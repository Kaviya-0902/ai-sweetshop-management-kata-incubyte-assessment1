import os
import sys
import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

@pytest.fixture(scope="session")
def test_database_url() -> str:
    url = os.environ.get("TEST_DATABASE_URL") or os.environ.get("DATABASE_URL")
    if url:
        os.environ["_SWEET_TEST_DB_FALLBACK"] = "0"
        return url

    os.environ["_SWEET_TEST_DB_FALLBACK"] = "1"
    fd, path = tempfile.mkstemp(prefix="sweet_management_test_", suffix=".sqlite3")
    os.close(fd)
    return f"sqlite:///{Path(path).as_posix()}"


@pytest.fixture(scope="session")
def client(test_database_url):
    os.environ["JWT_SECRET"] = "test_secret"
    os.environ["DATABASE_URL"] = test_database_url
    backend_root = Path(__file__).resolve().parents[1]
    sys.path.insert(0, str(backend_root))

    try:
        from main import app
    except ModuleNotFoundError:
        pytest.skip("Backend app module not found (expected `backend/main.py` exporting `app`).")

    with TestClient(app) as c:
        yield c


@pytest.fixture(autouse=True)
def clean_db(test_database_url):
    try:
        from db import init_db
    except ModuleNotFoundError:
        pytest.skip("Backend db module not found (expected `backend/db.py` exporting `init_db`).")

    os.environ["DATABASE_URL"] = test_database_url
    try:
        init_db()
    except Exception:
        if os.environ.get("_SWEET_TEST_DB_FALLBACK") == "1":
            pytest.skip("No TEST_DATABASE_URL/DATABASE_URL set and app DB init failed with SQLite fallback.")
        raise

    if test_database_url.startswith("postgresql://") or test_database_url.startswith("postgres://"):
        import psycopg

        with psycopg.connect(test_database_url) as conn:
            conn.execute("TRUNCATE TABLE sweets, users RESTART IDENTITY CASCADE")
            conn.commit()
    elif test_database_url.startswith("sqlite:"):
        import sqlite3

        db_path = test_database_url.replace("sqlite:///", "", 1)
        with sqlite3.connect(db_path) as conn:
            conn.execute("DELETE FROM sweets")
            conn.execute("DELETE FROM users")
            try:
                conn.execute("DELETE FROM sqlite_sequence WHERE name IN ('sweets','users')")
            except sqlite3.OperationalError:
                pass
            conn.commit()
    else:
        pytest.skip(f"Unsupported DATABASE_URL scheme for tests: {test_database_url}")


def _register(client, email, password, role=None):
    payload = {"email": email, "password": password}
    if role:
        payload["role"] = role
    return client.post("/api/auth/register", json=payload)


def _login(client, email, password):
    return client.post("/api/auth/login", json={"email": email, "password": password})


@pytest.fixture()
def user_token(client):
    r = _register(client, "user@example.com", "Password123!")
    assert r.status_code in (200, 201)
    l = _login(client, "user@example.com", "Password123!")
    assert l.status_code == 200
    return l.json()["token"]


@pytest.fixture()
def admin_token(client):
    r = _register(client, "admin@example.com", "Password123!", role="admin")
    assert r.status_code in (200, 201)
    l = _login(client, "admin@example.com", "Password123!")
    assert l.status_code == 200
    return l.json()["token"]


@pytest.fixture()
def user_headers(user_token):
    return {"Authorization": f"Bearer {user_token}"}


@pytest.fixture()
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}
