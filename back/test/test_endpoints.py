from types import SimpleNamespace
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, MagicMock, Mock
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app, get_db


@pytest.fixture
def mock_db():
    db = AsyncMock()
    return db


@pytest_asyncio.fixture
async def client(mock_db):
    async def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_search_tracks_success(client, mock_db):
    mock_result = MagicMock()
    mock_mappings = MagicMock()
    mock_mappings.all.return_value = [
        {
            "TrackId": 1,
            "Name": "Song A",
            "UnitPrice": 1.5,
            "Artist": "Artist A"
        }
    ]
    mock_result.mappings.return_value = mock_mappings

    mock_db.execute = AsyncMock(return_value=mock_result)

    response = await client.get("/tracks/search?name=Song")

    assert response.status_code == 200
    assert response.json()[0]["Name"] == "Song A"


@pytest.mark.asyncio
async def test_purchase_customer_not_found(client, mock_db):

    mock_db.get.side_effect = [None]

    response = await client.post("/purchase", json={
        "customer_id": 1,
        "track_id": 2
    })

    assert response.status_code == 404
    assert response.json()["detail"] == "Cliente no encontrado"


@pytest.mark.asyncio
async def test_purchase_track_not_found(client, mock_db):

    mock_db.get.side_effect = [
        {"CustomerId": 1},
        None
    ]

    response = await client.post("/purchase", json={
        "customer_id": 1,
        "track_id": 2
    })

    assert response.status_code == 404
    assert response.json()["detail"] == "Canción no encontrada"


@pytest.mark.asyncio
async def test_purchase_already_bought(client, mock_db):

    mock_db.get.side_effect = [
        {"CustomerId": 1},
        {"TrackId": 2, "UnitPrice": 1.5}
    ]

    mock_existing = AsyncMock()
    mock_existing.scalar_one_or_none.return_value = {"InvoiceId": 1}

    mock_db.execute.return_value = mock_existing

    response = await client.post("/purchase", json={
        "customer_id": 1,
        "track_id": 2
    })

    assert response.status_code == 400
    assert response.json()["detail"] == "El cliente ya compró esta canción"


@pytest.mark.asyncio
async def test_purchase_success(client, mock_db):

    mock_customer = SimpleNamespace(CustomerId=1)
    mock_track = SimpleNamespace(TrackId=2, UnitPrice=1.5)

    mock_db.get.side_effect = [
        mock_customer,
        mock_track
    ]

    mock_result = Mock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    response = await client.post(
        "/purchase",
        json={
            "customer_id": 1,
            "track_id": 2
        }
    )
    print(response.status_code)
    print(response.json())
    assert response.status_code == 200
    assert response.json() == {"message": "Compra realizada correctamente"}
