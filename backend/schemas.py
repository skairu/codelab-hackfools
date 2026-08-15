from pydantic import BaseModel
from models import TypeEnum, StatusEnum

from pydantic import BaseModel
from models import TypeEnum, StatusEnum


class DinosaurCreate(BaseModel):
    specie: str
    latitude: float
    longitude: float
    type: TypeEnum
    status: StatusEnum


class DinosaurUpdate(BaseModel):
    specie: str
    latitude: float
    longitude: float
    type: TypeEnum
    status: StatusEnum
