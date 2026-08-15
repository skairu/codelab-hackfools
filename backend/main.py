"""
Backend do sistema de controle de tráfego de dinossauros.

Este arquivo une:
  - o CRUD de dinossauros original (FastAPI + SQLAlchemy, banco SQLite)
  - o motor de simulação (movimento sobre um grafo de ruas + fome/estresse)
  - o motor de roteamento (rota mínima penalizada pela proximidade de dinos)
  - um endpoint WebSocket que transmite posições em tempo real e empurra
    recálculo automático de rota

Rodar com:
    uvicorn main:app --reload

Endpoints principais:
    POST   /dinosaurs             -> cria um dinossauro (é encaixado na malha viária)
    GET    /dinosaurs             -> lista todos os dinossauros
    GET    /dinosaurs/{id}        -> detalhe de um dinossauro
    PUT    /dinosaurs/{id}        -> atualiza um dinossauro
    GET    /graph                 -> grafo de ruas (nós/arestas) pro mapa base
    POST   /route                 -> calcula rota A->B e passa a monitorá-la
    DELETE /route/{client_id}     -> para de monitorar a rota desse cliente
    POST   /admin/interdict       -> bloqueia uma via
    DELETE /admin/interdict       -> libera uma via
    GET    /admin/alerts          -> dinos estressados/agressivos
    WS     /ws/{client_id}        -> stream de posições + recálculo de rota

Veja o README.md para mais detalhes de como rodar e conectar o frontend.
"""

import asyncio
import random
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from config import NUM_DINOS
from database import Base, SessionLocal, engine, get_db
from graph_builder import build_city_graph
from models import Dinosaurs, StatusEnum
from routing import RoutingEngine
from schemas import (
    DinosaurCreate,
    DinosaurOut,
    DinosaurUpdate,
    InterdictRequest,
    RouteRequest,
)
from simulation import DinosaurSimulator
from websocket_manager import ConnectionManager

Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- monta o estado compartilhado da aplicação ---
    city_graph = build_city_graph()
    app.state.graph = city_graph
    app.state.simulator = DinosaurSimulator(city_graph)
    app.state.routing = RoutingEngine(city_graph)
    app.state.manager = ConnectionManager()

    # popula o banco com dinos aleatórios só se ele ainda estiver vazio
    seed_db = SessionLocal()
    try:
        app.state.simulator.spawn_initial_dinos(seed_db, NUM_DINOS)
    finally:
        seed_db.close()

    # --- callback executado a cada tick da simulação ---
    async def on_tick(db: Session, dinos):
        # 1. todo mundo conectado recebe a posição atualizada dos dinos
        await app.state.manager.broadcast_dinos(app.state.simulator.snapshot(db))

        # 2. só quem tem rota ameaçada recebe recálculo (abordagem orientada a evento)
        updates = app.state.routing.recompute_threatened_routes(dinos)
        for client_id, new_route in updates.items():
            await app.state.manager.send_route_update(client_id, new_route)

    sim_task = asyncio.create_task(
        app.state.simulator.run_forever(SessionLocal, on_tick)
    )
    yield
    sim_task.cancel()


app = FastAPI(title="Dino Traffic Control - Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok"}


@app.get("/health")
def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# CRUD de dinossauros (banco SQLite via SQLAlchemy)
# ---------------------------------------------------------------------------

@app.post("/dinosaurs", response_model=DinosaurOut)
def create_dinosaur(
    dinosaur: DinosaurCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    new_dinosaur = Dinosaurs(
        specie=dinosaur.specie,
        latitude=dinosaur.latitude,
        longitude=dinosaur.longitude,
        type=dinosaur.type,
        status=dinosaur.status,
        speed=random.uniform(1.0, 6.0),
        hunger=random.uniform(0, 100),
        stress=random.uniform(0, 100),
    )

    # encaixa o novo dino na malha viária mais próxima, pra que ele já
    # comece a se mover na simulação e possa entrar no cálculo de rotas
    request.app.state.simulator.place_on_graph(new_dinosaur)

    db.add(new_dinosaur)
    db.commit()
    db.refresh(new_dinosaur)

    return new_dinosaur


@app.get("/dinosaurs", response_model=list[DinosaurOut])
def get_dinosaurs(db: Session = Depends(get_db)):
    return db.query(Dinosaurs).all()


@app.get("/dinosaurs/{dinosaur_id}", response_model=DinosaurOut)
def get_dinosaur(dinosaur_id: int, db: Session = Depends(get_db)):
    dinosaur = db.query(Dinosaurs).filter(Dinosaurs.id == dinosaur_id).first()

    if dinosaur is None:
        raise HTTPException(status_code=404, detail="Dinosaur not found")

    return dinosaur


@app.put("/dinosaurs/{dinosaur_id}", response_model=DinosaurOut)
def update_dinosaur(
    dinosaur_id: int,
    dinosaur_data: DinosaurUpdate,
    request: Request,
    db: Session = Depends(get_db),
):
    dinosaur = db.query(Dinosaurs).filter(Dinosaurs.id == dinosaur_id).first()

    if dinosaur is None:
        raise HTTPException(status_code=404, detail="Dinosaur not found")

    position_changed = (
        dinosaur_data.latitude != dinosaur.latitude
        or dinosaur_data.longitude != dinosaur.longitude
    )

    dinosaur.specie = dinosaur_data.specie
    dinosaur.latitude = dinosaur_data.latitude
    dinosaur.longitude = dinosaur_data.longitude
    dinosaur.type = dinosaur_data.type
    dinosaur.status = dinosaur_data.status

    # se a posição foi alterada manualmente (ex: "teleportar" um dino pra
    # testar um cenário), reencaixa ele na malha viária mais próxima
    if position_changed:
        request.app.state.simulator.place_on_graph(dinosaur)

    db.commit()
    db.refresh(dinosaur)

    return dinosaur


# ---------------------------------------------------------------------------
# Grafo de ruas
# ---------------------------------------------------------------------------

@app.get("/graph")
def get_graph(request: Request):
    """Nós e arestas do grafo de ruas — o frontend usa isso pra desenhar a
    malha viária base e pra deixar o usuário clicar num nó como origem/destino."""
    g = request.app.state.graph
    nodes = [{"id": n, "lat": d["lat"], "lon": d["lon"]} for n, d in g.nodes(data=True)]
    edges = [{"a": u, "b": v, "length": d["length"]} for u, v, d in g.edges(data=True)]
    return {"nodes": nodes, "edges": edges}


# ---------------------------------------------------------------------------
# Roteamento (rota do usuário)
# ---------------------------------------------------------------------------

@app.post("/route")
def compute_route(payload: RouteRequest, request: Request, db: Session = Depends(get_db)):
    """Calcula a rota entre origem e destino considerando a posição/status
    atual dos dinos. Registra a rota como "ativa" pro client_id informado:
    se um dino se aproximar demais dela mais tarde, o backend recalcula
    sozinho e empurra a nova rota via WebSocket (/ws/{client_id})."""
    routing = request.app.state.routing
    dinos = db.query(Dinosaurs).all()

    route = routing.compute_route(payload.origin_node, payload.destination_node, dinos)
    if route is None:
        raise HTTPException(status_code=404, detail="Nenhuma rota encontrada (área bloqueada?)")

    routing.register_active_route(
        payload.client_id, payload.origin_node, payload.destination_node, route["path"]
    )
    return route


@app.delete("/route/{client_id}")
def cancel_route(client_id: str, request: Request):
    """Cancela o acompanhamento automático da rota (ex: usuário chegou ao
    destino ou fechou a busca)."""
    request.app.state.routing.unregister_active_route(client_id)
    return {"status": "cancelado"}


# ---------------------------------------------------------------------------
# Administração (bloqueio manual de vias + alertas)
# ---------------------------------------------------------------------------

@app.post("/admin/interdict")
def interdict(payload: InterdictRequest, request: Request):
    """Bloqueia uma via manualmente (ex: equipe de campo confirmou perigo)."""
    request.app.state.routing.interdict_edge(payload.node_a, payload.node_b)
    return {"status": "via interditada", "edge": [payload.node_a, payload.node_b]}


@app.delete("/admin/interdict")
def clear_interdict(payload: InterdictRequest, request: Request):
    request.app.state.routing.clear_interdiction(payload.node_a, payload.node_b)
    return {"status": "interdição removida", "edge": [payload.node_a, payload.node_b]}


@app.get("/admin/alerts", response_model=list[DinosaurOut])
def alerts(db: Session = Depends(get_db)):
    """Lista de dinos em status estressado/agressivo — pro painel de alertas."""
    return (
        db.query(Dinosaurs)
        .filter(Dinosaurs.status != StatusEnum.CALM)
        .all()
    )


# ---------------------------------------------------------------------------
# WebSocket
# ---------------------------------------------------------------------------

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """Canal único que carrega dois tipos de mensagem:
      {"type": "dinos_update", "data": [...]}  -> broadcast pra todos, a cada tick
      {"type": "route_update", "data": {...}}  -> só pro client_id dono da rota

    O client_id deve ser o mesmo usado em POST /route, pra que o backend
    saiba pra qual conexão empurrar o recálculo automático."""
    manager = websocket.app.state.manager
    routing = websocket.app.state.routing
    simulator = websocket.app.state.simulator

    await manager.connect(client_id, websocket)
    db = SessionLocal()
    try:
        # snapshot inicial, pra não esperar o próximo tick pra ver algo no mapa
        await websocket.send_json({"type": "dinos_update", "data": simulator.snapshot(db)})
        while True:
            # a conexão é majoritariamente de saída (servidor -> cliente);
            # aqui só mantemos ela viva e ignoramos pings do cliente, se houver
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(client_id)
        routing.unregister_active_route(client_id)
    finally:
        db.close()
