from pydantic import BaseModel

class PurchaseRequest(BaseModel):
    customer_id: int
    track_id: int

class TrackResponse(BaseModel):
    TrackId: int
    Name: str
    UnitPrice: float
