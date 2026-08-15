"""
Motor de roteamento — adaptado do zip original para trabalhar diretamente
com os registros do banco (instâncias de `models.Dinosaurs`) em vez de
dataclasses em memória.

Duas responsabilidades:

1. `compute_route(origin, destination, dinos)` — calcula o caminho mínimo
   no grafo com Dijkstra (via networkx), mas o peso de cada aresta é
   penalizado pela proximidade de dinossauros, proporcional à gravidade do
   status deles. Dino calmo quase não pesa; dino agressivo praticamente
   fecha a via.

2. Recálculo automático orientado a evento: guardamos a rota ativa de cada
   cliente conectado. A cada tick da simulação, `recompute_threatened_routes`
   verifica se algum dino perigoso (estressado ou agressivo) entrou no raio
   de influência de alguma aresta de alguma rota ativa. Só nesse caso a rota
   daquele cliente é recalculada e devolvida pra ser empurrada via WebSocket.
"""

import math
import time
from typing import Dict, List, Optional, Set, Tuple

import networkx as nx

from config import CITY_CENTER_LAT, DINO_INFLUENCE_RADIUS_M
from models import Dinosaurs, StatusEnum

# quanto cada status "pesa" na penalização de uma via próxima
STATUS_PENALTY = {
    StatusEnum.CALM: 1.0,          # impacto quase nulo
    StatusEnum.STRESSED: 8.0,      # penaliza, mas ainda é uma via passável
    StatusEnum.AGGRESSIVE: 500.0,  # na prática, bloqueia a via
}

# status que justificam recalcular uma rota ativa (calmo não conta como ameaça)
THREATENING_STATUSES = {StatusEnum.STRESSED, StatusEnum.AGGRESSIVE}


def _latlon_to_xy(lat: float, lon: float, center_lat: float = CITY_CENTER_LAT):
    """Projeção planar local em metros — suficiente na escala de uma cidade,
    e bem mais barata que haversine pra rodar em todo tick da simulação."""
    x = lon * 111_320.0 * math.cos(math.radians(center_lat))
    y = lat * 111_320.0
    return x, y


def _point_segment_distance_m(px, py, ax, ay, bx, by) -> float:
    """Distância do ponto (px,py) ao segmento de reta (ax,ay)-(bx,by), em metros."""
    abx, aby = bx - ax, by - ay
    apx, apy = px - ax, py - ay
    ab_len2 = abx * abx + aby * aby
    if ab_len2 == 0:
        return math.hypot(px - ax, py - ay)
    t = max(0.0, min(1.0, (apx * abx + apy * aby) / ab_len2))
    cx, cy = ax + t * abx, ay + t * aby
    return math.hypot(px - cx, py - cy)


class ActiveRoute:
    """Representa a rota atualmente "assinada" por um cliente conectado."""

    def __init__(self, client_id: str, origin: str, destination: str, path: List[str]):
        self.client_id = client_id
        self.origin = origin
        self.destination = destination
        self.path = path
        self.edge_set: Set[Tuple[str, str]] = set(zip(path, path[1:]))


class RoutingEngine:
    def __init__(self, graph: nx.Graph):
        self.graph = graph
        self.interdicted_edges: Set[Tuple[str, str]] = set()
        self.active_routes: Dict[str, ActiveRoute] = {}

    # ---------- cálculo de rota (peso dinâmico) ----------

    def _edge_blocked(self, u: str, v: str) -> bool:
        return (u, v) in self.interdicted_edges or (v, u) in self.interdicted_edges

    def _weight_fn(self, dinos: List[Dinosaurs]):
        def weight(u, v, edge_data):
            if self._edge_blocked(u, v):
                return float("inf")

            base = edge_data.get("length", 150.0)
            ux, uy = _latlon_to_xy(self.graph.nodes[u]["lat"], self.graph.nodes[u]["lon"])
            vx, vy = _latlon_to_xy(self.graph.nodes[v]["lat"], self.graph.nodes[v]["lon"])

            penalty = 0.0
            for dino in dinos:
                dx, dy = _latlon_to_xy(dino.latitude, dino.longitude)
                dist = _point_segment_distance_m(dx, dy, ux, uy, vx, vy)
                if dist <= DINO_INFLUENCE_RADIUS_M:
                    closeness = 1 - (dist / DINO_INFLUENCE_RADIUS_M)  # 0..1, mais perto = mais peso
                    penalty += STATUS_PENALTY[dino.status] * closeness

            return base + penalty * base

        return weight

    def compute_route(
        self, origin: str, destination: str, dinos: List[Dinosaurs]
    ) -> Optional[dict]:
        weight_fn = self._weight_fn(dinos)
        try:
            path = nx.shortest_path(self.graph, origin, destination, weight=weight_fn)
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return None

        distance_m = sum(self.graph.edges[u, v]["length"] for u, v in zip(path, path[1:]))
        avg_speed_mps = 8.0  # ~29 km/h médio urbano; poderia vir de config
        duration_s = distance_m / avg_speed_mps if distance_m else 0.0

        return {
            "path": path,
            "coordinates": [
                {"lat": self.graph.nodes[n]["lat"], "lon": self.graph.nodes[n]["lon"]}
                for n in path
            ],
            "distance_m": round(distance_m, 1),
            "duration_s": round(duration_s, 1),
            "computed_at": time.time(),
        }

    # ---------- interdição de vias (modo admin) ----------

    def interdict_edge(self, u: str, v: str):
        self.interdicted_edges.add((u, v))

    def clear_interdiction(self, u: str, v: str):
        self.interdicted_edges.discard((u, v))
        self.interdicted_edges.discard((v, u))

    # ---------- rotas ativas + recálculo orientado a evento ----------

    def register_active_route(self, client_id: str, origin: str, destination: str, path: List[str]):
        self.active_routes[client_id] = ActiveRoute(client_id, origin, destination, path)

    def unregister_active_route(self, client_id: str):
        self.active_routes.pop(client_id, None)

    def _route_is_threatened(self, route: ActiveRoute, dinos: List[Dinosaurs]) -> bool:
        for u, v in route.edge_set:
            if self._edge_blocked(u, v):
                return True

            ux, uy = _latlon_to_xy(self.graph.nodes[u]["lat"], self.graph.nodes[u]["lon"])
            vx, vy = _latlon_to_xy(self.graph.nodes[v]["lat"], self.graph.nodes[v]["lon"])

            for dino in dinos:
                if dino.status not in THREATENING_STATUSES:
                    continue
                dx, dy = _latlon_to_xy(dino.latitude, dino.longitude)
                dist = _point_segment_distance_m(dx, dy, ux, uy, vx, vy)
                if dist <= DINO_INFLUENCE_RADIUS_M:
                    return True
        return False

    def recompute_threatened_routes(self, dinos: List[Dinosaurs]) -> Dict[str, dict]:
        """Chamado a cada tick da simulação (via main.py). Só recalcula — e
        só retorna — as rotas cujo caminho realmente mudou: barato na escala
        normal, reativo só quando um dino perigoso se aproxima."""
        updates: Dict[str, dict] = {}
        for client_id, route in list(self.active_routes.items()):
            if not self._route_is_threatened(route, dinos):
                continue

            new_route = self.compute_route(route.origin, route.destination, dinos)
            if new_route is None:
                continue

            if new_route["path"] != route.path:
                self.active_routes[client_id] = ActiveRoute(
                    client_id, route.origin, route.destination, new_route["path"]
                )
                updates[client_id] = new_route

        return updates
