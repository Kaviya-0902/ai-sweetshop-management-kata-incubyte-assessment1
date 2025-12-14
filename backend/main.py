from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from database import Base, engine
from auth import router as auth_router
from sweet_controller import router as sweets_router

app = FastAPI(title="Sweet Shop Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


def _ensure_sweets_image_url_column():
    inspector = inspect(engine)
    if "sweets" not in inspector.get_table_names():
        return

    columns = {c.get("name") for c in inspector.get_columns("sweets")}
    if "image_url" in columns:
        return

    with engine.begin() as conn:
        if engine.dialect.name == "postgresql":
            conn.execute(text("ALTER TABLE sweets ADD COLUMN IF NOT EXISTS image_url VARCHAR"))
        else:
            try:
                conn.execute(text("ALTER TABLE sweets ADD COLUMN image_url VARCHAR"))
            except Exception:
                pass


_ensure_sweets_image_url_column()

app.include_router(auth_router)
app.include_router(sweets_router)

@app.get("/")
def root():
    return {"message": "Sweet Shop API is running"}
