from pydantic import BaseModel, ConfigDict

from models import StatusEnum, TypeEnum


class DinosaurCreate(BaseModel):
    specie: str
    latitude: float
    longitude: float
    type: TypeEnum
    status: StatusEnum = StatusEnum.CALM


class DinosaurUpdate(BaseModel):
    specie: str
    latitude: float
    longitude: float
    type: TypeEnum
    status: StatusEnum


class DinosaurOut(BaseModel):
    id: int
    specie: str
    latitude: float
    longitude: float
    type: TypeEnum
    status: StatusEnum
    speed: float
    hunger: float
    stress: float

    model_config = ConfigDict(from_attributes=True)


# ---- roteamento ----

class RouteRequest(BaseModel):
    client_id: str          # mesmo id usado na conexão WebSocket (/ws/{client_id})
    origin_node: str        # id do nó no grafo, ex: "r0_c0" (ver GET /graph)
    destination_node: str


# ---- administração (bloqueio de vias) ----

class InterdictRequest(BaseModel):
    node_a: str
    node_b: str
