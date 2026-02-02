from datetime import datetime
from typing import Optional
from langchain_core.tools import tool

from booking_service import get_booking_service
from models import BookingDetails


def _get_booking_service():
    return get_booking_service()


@tool(description="Get booking details (requires booking number, first name, last name)")
def get_booking_details(booking_number: str, first_name: str, last_name: str) -> dict:
    try:
        booking_service = _get_booking_service()
        booking = booking_service.get_booking_details(booking_number, first_name, last_name)
        return {
            "success": True,
            "booking": booking.model_dump()
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@tool(description="Change booking dates and route (requires booking number, first name, last name, new date, from airport, to airport)")
def change_booking(booking_number: str, first_name: str, last_name: str,
                   new_date: str, from_airport: str, to_airport: str) -> dict:
    try:
        booking_service = _get_booking_service()
        booking_service.change_booking(booking_number, first_name, last_name, new_date, from_airport, to_airport)
        return {
            "success": True,
            "message": f"Booking {booking_number} has been changed successfully."
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@tool(description="Cancel a booking (requires booking number, first name, last name)")
def cancel_booking(booking_number: str, first_name: str, last_name: str) -> dict:
    try:
        booking_service = _get_booking_service()
        booking_service.cancel_booking(booking_number, first_name, last_name)
        return {
            "success": True,
            "message": f"Booking {booking_number} has been cancelled."
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def get_booking_tools() -> list:
    return [
        get_booking_details,
        change_booking,
        cancel_booking
    ]
