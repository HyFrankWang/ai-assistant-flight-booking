import os
import sys
from datetime import datetime, date
from typing import List, Optional
import random

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models import Booking, BookingDetails, Customer, BookingStatus, BookingClass


class BookingData:
    def __init__(self):
        self.customers: List[Customer] = []
        self.bookings: List[Booking] = []
        self._init_demo_data()

    def _init_demo_data(self):
        first_names = ["Frank", "Danny", "Michael", "Eugenia", "Robert"]
        last_names = ["Li", "Smith", "Wu", "Williams", "Xiong"]
        airport_codes = ["LAX", "YVR", "JFK", "LHR", "CDG", "ARN", "HEL", "HND", "MUC", "FRA", "MAD", "FUN", "SJC"]

        customers = []
        bookings = []

        for i in range(5):
            first_name = first_names[i]
            last_name = last_names[i]
            from_airport = random.choice(airport_codes)
            to_airport = random.choice(airport_codes)
            seat_number = f"{random.randint(1, 19)}A"
            booking_class = random.choice(list(BookingClass))

            customer = Customer(
                first_name=first_name,
                last_name=last_name,
                email=f"{first_name.lower()}.{last_name.lower()}@example.com"
            )

            flight_date = date.today().replace(day=(date.today().day + 2 * i) % 28 + 1)

            booking = Booking(
                booking_number=f"10{i + 1}",
                ticket_number=f"FN{random.randint(100000, 999999)}",
                date=flight_date,
                customer=customer,
                status=BookingStatus.CONFIRMED,
                from_airport=from_airport,
                to_airport=to_airport,
                seat_number=seat_number,
                booking_class=booking_class
            )

            customers.append(customer)
            bookings.append(booking)

        self.customers = customers
        self.bookings = bookings

    def get_all_bookings(self) -> List[BookingDetails]:
        return [self._to_booking_details(b) for b in self.bookings]

    def _to_booking_details(self, booking: Booking) -> BookingDetails:
        return BookingDetails(
            booking_number=booking.booking_number,
            ticket_number=booking.ticket_number,
            first_name=booking.customer.first_name,
            last_name=booking.customer.last_name,
            date=booking.date,
            booking_status=booking.status,
            from_airport=booking.from_airport,
            to_airport=booking.to_airport,
            seat_number=booking.seat_number,
            booking_class=booking.booking_class.value
        )


class BookingService:
    def __init__(self):
        self.db = BookingData()

    def get_bookings(self) -> List[BookingDetails]:
        return self.db.get_all_bookings()

    def find_booking(self, booking_number: str, first_name: str, last_name: str) -> Booking:
        for booking in self.db.bookings:
            if (booking.booking_number.lower() == booking_number.lower() and
                booking.customer.first_name.lower() == first_name.lower() and
                booking.customer.last_name.lower() == last_name.lower()):
                return booking
        raise ValueError("Booking not found")

    def get_booking_details(self, booking_number: str, first_name: str, last_name: str) -> BookingDetails:
        booking = self.find_booking(booking_number, first_name, last_name)
        return self.db._to_booking_details(booking)

    def change_booking(self, booking_number: str, first_name: str, last_name: str,
                       new_date: str, from_airport: str, to_airport: str) -> None:
        booking = self.find_booking(booking_number, first_name, last_name)
        
        # Business rule: Cannot change within 24 hours
        if booking.date <= date.today():
            raise ValueError("Booking cannot be changed within 24 hours of the start date.")
        
        booking.date = date.fromisoformat(new_date)
        booking.from_airport = from_airport
        booking.to_airport = to_airport

    def cancel_booking(self, booking_number: str, first_name: str, last_name: str) -> None:
        booking = self.find_booking(booking_number, first_name, last_name)
        
        # Business rule: Cannot cancel within 48 hours
        if booking.date <= date.today():
            raise ValueError("Booking cannot be cancelled within 48 hours of the start date.")
        
        booking.status = BookingStatus.CANCELLED

    def change_seat(self, booking_number: str, first_name: str, last_name: str, seat_number: str) -> None:
        booking = self.find_booking(booking_number, first_name, last_name)
        booking.seat_number = seat_number


# Singleton instance
_booking_service: Optional[BookingService] = None


def get_booking_service() -> BookingService:
    global _booking_service
    if _booking_service is None:
        _booking_service = BookingService()
    return _booking_service
