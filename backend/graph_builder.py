"""
Gera o grafo de ruas da cidade.

Pra um protótipo acadêmico, evitamos depender de download de OpenStreetMap
(osmnx) — que exigiria internet em tempo de execução. Em vez disso, geramos
um grid sintético de N x M quarteirões, com coordenadas lat/lon plausíveis
ao redor de um centro de referência.

Se no futuro vocês quiserem trocar por uma malha viária real, só precisam
substituir `build_city_graph` por algo que devolva um networkx.Graph com os
mesmos atributos de nó (`lat`, `lon`) e de aresta (`length`), que o resto do
sistema (simulação + roteamento) continua funcionando sem alterações.
"""

import math

import networkx as nx

from config import BLOCK_SIZE_M, CITY_CENTER_LAT, CITY_CENTER_LON, GRID_COLS, GRID_ROWS


def _offset_to_latlon(x_m: float, y_m: float, center_lat: float, center_lon: float):
    """Converte um deslocamento em metros (x=leste, y=norte) para lat/lon,
    usando aproximação planar local (válida em áreas do tamanho de uma cidade)."""
    lat = center_lat + (y_m / 111_320.0)
    lon = center_lon + (x_m / (111_320.0 * math.cos(math.radians(center_lat))))
    return lat, lon


def build_city_graph(
    rows: int = GRID_ROWS,
    cols: int = GRID_COLS,
    block_size_m: float = BLOCK_SIZE_M,
    center_lat: float = CITY_CENTER_LAT,
    center_lon: float = CITY_CENTER_LON,
) -> nx.Graph:
    graph = nx.Graph()

    for r in range(rows):
        for c in range(cols):
            node_id = f"r{r}_c{c}"
            x_m = (c - cols / 2) * block_size_m
            y_m = (r - rows / 2) * block_size_m
            lat, lon = _offset_to_latlon(x_m, y_m, center_lat, center_lon)
            graph.add_node(node_id, lat=lat, lon=lon, row=r, col=c)

    for r in range(rows):
        for c in range(cols):
            node_id = f"r{r}_c{c}"
            if c + 1 < cols:
                right = f"r{r}_c{c + 1}"
                graph.add_edge(node_id, right, length=block_size_m)
            if r + 1 < rows:
                down = f"r{r + 1}_c{c}"
                graph.add_edge(node_id, down, length=block_size_m)

    return graph


def nearest_node(graph: nx.Graph, lat: float, lon: float) -> str:
    """Acha o nó do grafo mais próximo de um lat/lon — usado pra "encaixar"
    um dino recém-criado (ou atualizado via PUT) na malha viária."""
    best_node, best_dist = None, float("inf")
    for node_id, data in graph.nodes(data=True):
        d = (data["lat"] - lat) ** 2 + (data["lon"] - lon) ** 2
        if d < best_dist:
            best_dist, best_node = d, node_id
    return best_node
