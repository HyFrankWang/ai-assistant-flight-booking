import os
import sys
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, Iterator
import json

# Based on: https://github.com/tzolov/playground-flight-booking
# Original project by tzolov - Thanks for the inspiration!

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models import (
    BookingDetails, ChangeBookingRequest, CancelBookingRequest,
    ChatRequest
)
from booking_service import get_booking_service
from chat_service import get_chat_service
from config import settings

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="AI-powered Flight Booking Assistant with LangChain",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ Booking API Endpoints ============

@app.get("/api/bookings", response_model=list[BookingDetails])
def get_bookings():
    """Get all bookings"""
    service = get_booking_service()
    return service.get_bookings()


@app.get("/api/bookings/{booking_number}", response_model=BookingDetails)
def get_booking(booking_number: str, first_name: str, last_name: str):
    """Get specific booking details"""
    service = get_booking_service()
    try:
        return service.get_booking_details(booking_number, first_name, last_name)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/api/bookings/change")
def change_booking(request: ChangeBookingRequest):
    """Change a booking"""
    service = get_booking_service()
    try:
        service.change_booking(
            request.booking_number,
            request.first_name,
            request.last_name,
            request.new_date,
            request.from_airport,
            request.to_airport
        )
        return {"success": True, "message": f"Booking {request.booking_number} changed successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/bookings/cancel")
def cancel_booking(request: CancelBookingRequest):
    """Cancel a booking"""
    service = get_booking_service()
    try:
        service.cancel_booking(request.booking_number, request.first_name, request.last_name)
        return {"success": True, "message": f"Booking {request.booking_number} cancelled successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/bookings/{booking_number}/seat")
def change_seat(booking_number: str, first_name: str, last_name: str, seat_number: str):
    """Change seat number"""
    service = get_booking_service()
    try:
        service.change_seat(booking_number, first_name, last_name, seat_number)
        return {"success": True, "message": f"Seat changed to {seat_number}"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============ Chat API Endpoints ============

@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    """Chat streaming endpoint for AI responses"""
    def generate():
        chat_service = get_chat_service()
        for chunk in chat_service.chat_stream(request.message, request.chat_id):
            yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        yield f"data: {json.dumps({'chunk': '[DONE]'})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@app.post("/api/chat/rag")
async def chat_with_rag(request: ChatRequest):
    """Chat with RAG context for policy questions"""
    def generate():
        chat_service = get_chat_service()
        for chunk in chat_service.chat_with_rag(request.message, request.chat_id):
            yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        yield f"data: {json.dumps({'chunk': '[DONE]'})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


# ============ Health Check ============

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": settings.app_name}


@app.get("/")
def root():
    return {
        "service": settings.app_name,
        "version": "1.0.0",
        "endpoints": {
            "bookings": "/api/bookings",
            "chat": "/api/chat/stream",
            "health": "/health"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.port)
