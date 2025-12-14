import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL") or "sqlite:///./sweet_shop.db"


def _make_engine(url: str):
    connect_args = {}
    if url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
    else:
        connect_args = {"connect_timeout": 3}
    return create_engine(url, connect_args=connect_args)


engine = _make_engine(DATABASE_URL)
try:
    with engine.connect():
        pass
except Exception:
    DATABASE_URL = "sqlite:///./sweet_shop.db"
    engine = _make_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
