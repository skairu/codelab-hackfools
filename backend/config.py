"""
Configurações centrais do backend.
Mantidas num único lugar pra facilitar ajustes durante a demo/apresentação.
"""

# --- simulação ---
TICK_SECONDS = 0.1 # Intervalo (em segundos) entre atualizações da simulação
NUM_DINOS = 25 # Nº de dinos gerados automaticamente se o banco estiver vazio

# --- roteamento ---
DINO_INFLUENCE_RADIUS_M = 120.0   # raio (em metros) em que um dino afeta o peso de uma via

# --- grafo da cidade (grid sintético, sem depender de download de OSM) ---
GRID_ROWS = 8
GRID_COLS = 8
BLOCK_SIZE_M = 150.0

# --- geografia de referência (centro de São Paulo, só pra as coordenadas ficarem "plausíveis" num mapa real) ---
CITY_CENTER_LAT = -23.5505
CITY_CENTER_LON = -46.6333
