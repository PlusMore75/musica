from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Customer(Base):
    __tablename__ = "Customer"
    CustomerId = Column(Integer, primary_key=True)
    FirstName = Column(String)
    LastName = Column(String)

class Artist(Base):
    __tablename__ = "Artist"
    ArtistId = Column(Integer, primary_key=True)
    Name = Column(String)

class Album(Base):
    __tablename__ = "Album"
    AlbumId = Column(Integer, primary_key=True)
    Title = Column(String)
    ArtistId = Column(Integer, ForeignKey("Artist.ArtistId"))

class Genre(Base):
    __tablename__ = "Genre"
    GenreId = Column(Integer, primary_key=True)
    Name = Column(String)

class Track(Base):
    __tablename__ = "Track"
    TrackId = Column(Integer, primary_key=True)
    Name = Column(String)
    AlbumId = Column(Integer, ForeignKey("Album.AlbumId"))
    GenreId = Column(Integer, ForeignKey("Genre.GenreId"))
    Composer = Column(String)
    UnitPrice = Column(Float)

class Invoice(Base):
    __tablename__ = "Invoice"
    InvoiceId = Column(Integer, primary_key=True)
    CustomerId = Column(Integer, ForeignKey("Customer.CustomerId"))
    Total = Column(Float)

class InvoiceLine(Base):
    __tablename__ = "InvoiceLine"
    InvoiceLineId = Column(Integer, primary_key=True)
    InvoiceId = Column(Integer, ForeignKey("Invoice.InvoiceId"))
    TrackId = Column(Integer, ForeignKey("Track.TrackId"))
    UnitPrice = Column(Float)
    Quantity = Column(Integer)
