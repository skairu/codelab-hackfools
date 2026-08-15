from sqlalchemy import Column, Integer, String, Float, Enum
from enum import Enum as PyEnum
from database import Base


class TypeEnum(str, PyEnum):
    air = "air"
    water = "water"
    land = "land"


class StatusEnum(str, PyEnum):
    danger = "danger"
    attention = "attention"
    controlled = "controlled"


class Dinosaurs(Base):
    __tablename__ = "dinosaurs"

    id = Column(Integer, primary_key=True, index=True)
    specie = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    type = Column(Enum(TypeEnum), nullable=False)
    status = Column(Enum(StatusEnum))
    speed = Column(Integer)
    hunger = Column(Integer)
    stress = Column(Integer)