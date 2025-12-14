def test_register_user(client):
    res = client.post(
        "/api/auth/register",
        json={"email": "kavi@example.com", "password": "Password123!"},
    )
    assert res.status_code == 201
    body = res.json()
    assert "id" in body
    assert body["email"] == "kavi@example.com"
    assert body["role"] == "user"


def test_login_user_returns_token(client):
    client.post(
        "/api/auth/register",
        json={"email": "bob@example.com", "password": "Password123!"},
    )
    res = client.post(
        "/api/auth/login",
        json={"email": "bob@example.com", "password": "Password123!"},
    )
    assert res.status_code == 200
    assert "token" in res.json()


def test_protected_route_requires_auth(client):
    res = client.get("/api/sweets")
    assert res.status_code == 401


def test_sweets_crud_and_inventory_flow(user_headers, admin_headers, client):
    create = client.post(
        "/api/sweets",
        headers=user_headers,
        json={
            "name": "Gulab Jamun",
            "category": "Indian",
            "price": 10.5,
            "quantity": 20,
        },
    )
    assert create.status_code == 201
    sweet = create.json()
    sweet_id = sweet["id"]

    list_res = client.get("/api/sweets", headers=user_headers)
    assert list_res.status_code == 200
    assert isinstance(list_res.json(), list)

    search = client.get("/api/sweets/search?name=gulab", headers=user_headers)
    assert search.status_code == 200
    assert any(s["name"] == "Gulab Jamun" for s in search.json())

    update = client.put(
        f"/api/sweets/{sweet_id}",
        headers=user_headers,
        json={"price": 12.0},
    )
    assert update.status_code == 200
    assert update.json()["price"] == 12.0

    purchase = client.post(
        f"/api/sweets/{sweet_id}/purchase",
        headers=user_headers,
        json={"quantity": 2},
    )
    assert purchase.status_code == 200
    assert purchase.json()["quantity"] == 18

    restock_forbidden = client.post(
        f"/api/sweets/{sweet_id}/restock",
        headers=user_headers,
        json={"quantity": 5},
    )
    assert restock_forbidden.status_code == 403

    restock = client.post(
        f"/api/sweets/{sweet_id}/restock",
        headers=admin_headers,
        json={"quantity": 5},
    )
    assert restock.status_code == 200
    assert restock.json()["quantity"] == 23

    delete_forbidden = client.delete(f"/api/sweets/{sweet_id}", headers=user_headers)
    assert delete_forbidden.status_code == 403

    delete_ok = client.delete(f"/api/sweets/{sweet_id}", headers=admin_headers)
    assert delete_ok.status_code == 204
