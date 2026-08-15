import json
from typing import Dict

from fastapi import WebSocket


class ConnectionManager:
    """Mantém as conexões WebSocket ativas, indexadas por client_id (o mesmo
    client_id usado em POST /route e em /ws/{client_id})."""

    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, client_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        self.active_connections.pop(client_id, None)

    async def broadcast_dinos(self, dinos_payload):
        """Envia o snapshot de todos os dinos pra todo mundo conectado —
        é o que alimenta os pontinhos se movendo no mapa do frontend."""
        message = json.dumps({"type": "dinos_update", "data": dinos_payload})
        dead = []
        for client_id, ws in self.active_connections.items():
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(client_id)
        for client_id in dead:
            self.disconnect(client_id)

    async def send_route_update(self, client_id: str, route_payload):
        """Envia uma rota recalculada só pro cliente dono daquela rota."""
        ws = self.active_connections.get(client_id)
        if ws is None:
            return
        message = json.dumps({"type": "route_update", "data": route_payload})
        try:
            await ws.send_text(message)
        except Exception:
            self.disconnect(client_id)
