from datetime import datetime, date
from typing import Optional, List
from enum import Enum
from pydantic import BaseModel


class BookingClass(str, Enum):
    ECONOMY = "ECONOMY"
    PREMIUM_ECONOMY = "PREMIUM_ECONOMY"
    BUSINESS = "BUSINESS"


class BookingStatus(str, Enum):
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"


class Customer(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None


class Booking(BaseModel):
    booking_number: str
    ticket_number: str
    date: date
    customer: Customer
    status: BookingStatus
    from_airport: str
    to_airport: str
    seat_number: str
    booking_class: BookingClass


class BookingDetails(BaseModel):
    booking_number: str
    ticket_number: str
    first_name: str
    last_name: str
    date: date
    booking_status: BookingStatus
    from_airport: str
    to_airport: str
    seat_number: str
    booking_class: str


class ChangeBookingRequest(BaseModel):
    booking_number: str
    first_name: str
    last_name: str
    new_date: str
    from_airport: str
    to_airport: str


class CancelBookingRequest(BaseModel):
    booking_number: str
    first_name: str
    last_name: str


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    chat_id: str


class ToolCall(BaseModel):
    name: str
    arguments: dict
