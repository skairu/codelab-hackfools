"""
Motor de simulação dos dinossauros — adaptado do zip original para
persistir o estado de cada dino no banco (tabela `dinosaurs`) em vez de
mantê-lo só em memória, seguindo o padrão SQLAlchemy do backend base.

Cada dino "vive" sobre uma aresta do grafo de ruas: `current_node` /
`next_node` + uma fração `edge_progress` (0 a 1) indicando o quanto já
andou de um até outro. A cada tick:

1. Avança `edge_progress` proporcionalmente à velocidade do dino.
2. Se chega ao nó destino, escolhe aleatoriamente a próxima aresta
   (evitando voltar de onde veio, quando possível).
3. Atualiza fome e estresse com ruído + reversão à média, e deriva o
   `status` (calm / stressed / aggressive) a partir desses valores.
4. Persiste tudo com `db.commit()`.

O motor não sabe nada sobre WebSocket ou rotas — só expõe `tick()` e
`snapshot()`. Quem orquestra a integração com o resto do sistema é o
`main.py`, via `run_forever(on_tick)`.
"""

import asyncio
import random
import time

import networkx as nx
from sqlalchemy.orm import Session

from config import NUM_DINOS, TICK_SECONDS
from graph_builder import nearest_node
from models import SPECIES_POOL, Dinosaurs, StatusEnum


def _interp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


class DinosaurSimulator:
    def __init__(self, graph: nx.Graph):
        self.graph = graph

    # ---------- criação / posicionamento na malha viária ----------

    def _random_edge_from(self, node: str, avoid: str | None = None):
        neighbors = [n for n in self.graph.neighbors(node) if n != avoid]
        if not neighbors:  # beco sem saída: só volta por onde veio
            neighbors = list(self.graph.neighbors(node))
        return random.choice(neighbors)

    def place_on_graph(self, dino: Dinosaurs):
        """Encaixa um dino (recém-criado ou reposicionado via PUT) no nó do
        grafo mais próximo do lat/lon informado, e escolhe uma aresta de
        saída aleatória a partir dali. Também ajusta lat/lon pra ficar
        exatamente sobre a malha viária, o que é necessário pra ele poder
        se mover e pra entrar corretamente no cálculo de rotas."""
        start_node = nearest_node(self.graph, dino.latitude, dino.longitude)
        next_node = self._random_edge_from(start_node)

        dino.current_node = start_node
        dino.next_node = next_node
        dino.edge_progress = 0.0

        node_data = self.graph.nodes[start_node]
        dino.latitude = node_data["lat"]
        dino.longitude = node_data["lon"]

    def spawn_initial_dinos(self, db: Session, n: int = NUM_DINOS):
        """Só roda se o banco estiver vazio: popula com `n` dinos aleatórios
        pra já ter algo se movendo assim que o servidor sobe."""
        if db.query(Dinosaurs).count() > 0:
            return

        nodes = list(self.graph.nodes)
        for _ in range(n):
            specie, dino_type, speed_kmh = random.choice(SPECIES_POOL)
            speed_mps = speed_kmh * 1000 / 3600 * random.uniform(0.5, 1.0)
            start_node = random.choice(nodes)
            node_data = self.graph.nodes[start_node]

            dino = Dinosaurs(
                specie=specie,
                type=dino_type,
                status=StatusEnum.CALM,
                latitude=node_data["lat"],
                longitude=node_data["lon"],
                speed=round(speed_mps, 2),
                hunger=round(random.uniform(10, 40), 1),
                stress=round(random.uniform(5, 30), 1),
                current_node=start_node,
                next_node=self._random_edge_from(start_node),
                edge_progress=random.random(),
            )
            db.add(dino)
        db.commit()

    # ---------- movimento ----------

    def _advance(self, dino: Dinosaurs):
        if dino.current_node is None or dino.next_node is None:
            self.place_on_graph(dino)
            return

        edge_data = self.graph.get_edge_data(dino.current_node, dino.next_node)
        if edge_data is None:
            # aresta não existe mais (ex: grafo mudou) -> reposiciona
            self.place_on_graph(dino)
            return

        edge_len = edge_data.get("length", 150.0)
        step = (dino.speed * TICK_SECONDS) / edge_len if edge_len else 1.0
        dino.edge_progress = (dino.edge_progress or 0.0) + step

        if dino.edge_progress >= 1.0:
            arrived_node = dino.next_node
            next_node = self._random_edge_from(arrived_node, avoid=dino.current_node)
            dino.current_node = arrived_node
            dino.next_node = next_node
            dino.edge_progress = 0.0

        u_data = self.graph.nodes[dino.current_node]
        v_data = self.graph.nodes[dino.next_node]
        dino.latitude = _interp(u_data["lat"], v_data["lat"], dino.edge_progress)
        dino.longitude = _interp(u_data["lon"], v_data["lon"], dino.edge_progress)

    # ---------- biologia / comportamento ----------

    def _update_biology(self, dino: Dinosaurs):
        # fome sobe com o tempo; de vez em quando o dino "se alimenta" (evento aleatório)
        dino.hunger = min(100.0, (dino.hunger or 0.0) + random.uniform(0.5, 2.0))
        if random.random() < 0.05:
            dino.hunger = max(0.0, dino.hunger - random.uniform(20, 40))

        # estresse: ruído + leve pressão quando a fome está alta (fome > 60 incomoda)
        drift = random.uniform(-4, 4)
        hunger_pressure = 0.15 * max(0.0, dino.hunger - 60)
        dino.stress = max(0.0, min(100.0, (dino.stress or 0.0) + drift + hunger_pressure))

        if dino.stress > 70 or (dino.hunger > 85 and dino.stress > 50):
            dino.status = StatusEnum.AGGRESSIVE
        elif dino.stress > 40:
            dino.status = StatusEnum.STRESSED
        else:
            dino.status = StatusEnum.CALM

    # ---------- API pública ----------

    def tick(self, db: Session):
        dinos = db.query(Dinosaurs).all()
        for dino in dinos:
            self._advance(dino)
            self._update_biology(dino)
        db.commit()
        return dinos

    def snapshot(self, db: Session):
        """Payload serializável, pronto pra mandar pro frontend via WebSocket/REST."""
        dinos = db.query(Dinosaurs).all()
        return [
            {
                "id": d.id,
                "specie": d.specie,
                "type": d.type.value,
                "status": d.status.value,
                "latitude": round(d.latitude, 6),
                "longitude": round(d.longitude, 6),
                "speed": round(d.speed or 0.0, 2),
                "hunger": round(d.hunger or 0.0, 1),
                "stress": round(d.stress or 0.0, 1),
            }
            for d in dinos
        ]

    async def run_forever(self, session_factory, on_tick):
        """Loop principal da simulação. `session_factory()` abre uma nova
        sessão de banco a cada tick (padrão recomendado do SQLAlchemy pra
        tarefas de longa duração). `on_tick(db, dinos)` é chamado a cada
        tick (pode ser síncrono ou uma coroutine) — é o gancho que o
        main.py usa pra fazer broadcast via WebSocket e checar rotas
        ameaçadas."""
        while True:
            db = session_factory()
            try:
                dinos = self.tick(db)
                result = on_tick(db, dinos)
                if asyncio.iscoroutine(result):
                    await result
            finally:
                db.close()
            await asyncio.sleep(TICK_SECONDS)
