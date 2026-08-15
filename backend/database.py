from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# SQLite em arquivo local -> zero setup pra rodar o protótipo.
# Pra usar Postgres/MySQL em produção, basta trocar essa URL.
SQLALCHEMY_DATABASE_URL = "sqlite:///./dinosaurs.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},  # necessário só pro SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()