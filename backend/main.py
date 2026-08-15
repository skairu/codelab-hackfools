from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db
from models import Base, Dinosaurs, TypeEnum, StatusEnum
from schemas import DinosaurCreate, DinosaurUpdate
import random

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok"}

@app.post("/dinosaurs")
def create_dinosaur(
    dinosaur: DinosaurCreate,
    db: Session = Depends(get_db)
):
    new_dinosaur = Dinosaurs(
        specie=dinosaur.specie,
        latitude=dinosaur.latitude,
        longitude=dinosaur.longitude,
        type=dinosaur.type,
        status=dinosaur.status,
        speed=random.randint(0, 100),
        hunger=random.randint(0, 100),
        stress=random.randint(0, 100)
    )

    db.add(new_dinosaur)
    db.commit()
    db.refresh(new_dinosaur)

    return new_dinosaur

@app.get("/dinosaurs")
def get_dinosaurs(db: Session = Depends(get_db)):
    return db.query(Dinosaurs).all()

@app.get("/dinosaurs/{dinosaur_id}")
def get_dinosaur(
    dinosaur_id: int,
    db: Session = Depends(get_db)
):
    dinosaur = db.query(Dinosaurs).filter(
        Dinosaurs.id == dinosaur_id
    ).first()

    if dinosaur is None:
        raise HTTPException(
            status_code=404,
            detail="Dinosaur not found"
        )

    return dinosaur

@app.put("/dinosaurs/{dinosaur_id}")
def update_dinosaur(
    dinosaur_id: int,
    dinosaur_data: DinosaurUpdate,
    db: Session = Depends(get_db)
):
    dinosaur = db.query(Dinosaurs).filter(
        Dinosaurs.id == dinosaur_id
    ).first()

    if dinosaur is None:
        raise HTTPException(
            status_code=404,
            detail="Dinosaur not found"
        )

    dinosaur.specie = dinosaur_data.specie
    dinosaur.latitude = dinosaur_data.latitude
    dinosaur.longitude = dinosaur_data.longitude
    dinosaur.type = dinosaur_data.type
    dinosaur.status = dinosaur_data.status

    db.commit()
    db.refresh(dinosaur)

    return dinosaur