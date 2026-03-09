from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert
from database import SessionLocal
from models import *
from schemas import *
from sqlalchemy import join
from sqlalchemy.orm import joinedload
app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://3.84.243.121:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,   # dominios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
async def get_db():
    async with SessionLocal() as session:
        yield session


@app.get("/tracks/search")
async def search_tracks(
    name: str = None,
    artist: str = None,
    genre: str = None,
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(
            Track.TrackId,
            Track.Name,
            Track.UnitPrice,
            Artist.Name.label("Artist")
        )
        .join(Album, Track.AlbumId == Album.AlbumId)
        .join(Artist, Album.ArtistId == Artist.ArtistId)
        .join(Genre, Track.GenreId == Genre.GenreId)
    )

    if name:
        query = query.where(Track.Name.ilike(f"%{name}%"))
    if artist:
        query = query.where(Artist.Name.ilike(f"%{artist}%"))
    if genre:
        query = query.where(Genre.Name.ilike(f"%{genre}%"))

    result = await db.execute(query)
    tracks = result.mappings().all()

    return tracks


@app.post("/purchase")
async def purchase(data: PurchaseRequest, db: AsyncSession = Depends(get_db)):

    customer = await db.get(Customer, data.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    track = await db.get(Track, data.track_id)
    if not track:
        raise HTTPException(status_code=404, detail="Canción no encontrada")

    # Verificar si el cliente ya compró esta canción
    result = await db.execute(
        select(InvoiceLine)
        .join(Invoice)
        .where(
            Invoice.CustomerId == data.customer_id,
            InvoiceLine.TrackId == data.track_id
        )
    )
    existing_purchase = result.scalar_one_or_none()

    if existing_purchase:
        raise HTTPException(
            status_code=400,
            detail="El cliente ya compró esta canción"
        )

    invoice = Invoice(CustomerId=data.customer_id, Total=track.UnitPrice)
    db.add(invoice)
    await db.flush()

    invoice_line = InvoiceLine(
        InvoiceId=invoice.InvoiceId,
        TrackId=data.track_id,
        UnitPrice=track.UnitPrice,
        Quantity=1
    )

    db.add(invoice_line)
    await db.commit()

    return {"message": "Compra realizada correctamente"}
