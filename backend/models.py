import enum

from sqlalchemy import Column, Enum, Float, Integer, String

from database import Base


class TypeEnum(str, enum.Enum):
    HERBIVORE = "herbivore"
    CARNIVORE = "carnivore"


class StatusEnum(str, enum.Enum):
    CALM = "calm"
    STRESSED = "stressed"
    AGGRESSIVE = "aggressive"


# (espécie, tipo, velocidade média km/h) — usado só pra popular o banco
# automaticamente na primeira vez que o servidor sobe (ver simulation.py)
SPECIES_POOL = [
    ("Tyrannosaurus rex", TypeEnum.CARNIVORE, 12.0),
    ("Velociraptor", TypeEnum.CARNIVORE, 22.0),
    ("Triceratops", TypeEnum.HERBIVORE, 8.0),
    ("Brachiosaurus", TypeEnum.HERBIVORE, 5.0),
    ("Stegosaurus", TypeEnum.HERBIVORE, 6.5),
]


class Dinosaurs(Base):
    __tablename__ = "dinosaurs"

    id = Column(Integer, primary_key=True, index=True)
    specie = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    type = Column(Enum(TypeEnum), nullable=False)
    status = Column(Enum(StatusEnum), nullable=False, default=StatusEnum.CALM)

    speed = Column(Float, default=0.0)   # m/s
    hunger = Column(Float, default=0.0)  # 0-100
    stress = Column(Float, default=0.0)  # 0-100

    # ---- estado interno de simulação (não exposto nos schemas da API) ----
    # o dino "vive" sobre uma aresta (current_node -> next_node) do grafo de
    # ruas e vai andando conforme edge_progress (0..1) avança a cada tick.
    current_node = Column(String, nullable=True)
    next_node = Column(String, nullable=True)
    edge_progress = Column(Float, default=0.0)
