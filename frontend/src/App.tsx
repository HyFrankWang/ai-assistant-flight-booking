import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BookingDetails } from './types';
import { api } from './services/api';
import { ChatInterface } from './components/ChatInterface';
import { BookingGrid } from './components/BookingGrid';
import { SeatSelector } from './components/SeatSelector';
import './App.css';

// Based on: https://github.com/tzolov/playground-flight-booking
// Original project by tzolov - Thanks for the inspiration!

function App() {
  const [chatId] = useState(() => uuidv4());
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [showSeatSelector, setShowSeatSelector] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{
    bookingNumber: string;
    firstName: string;
    lastName: string;
    currentSeat: string;
  } | null>(null);

  const loadBookings = async () => {
    try {
      const data = await api.getBookings();
      setBookings(data);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleSeatChange = async (newSeat: string) => {
    if (!selectedBooking) return;

    try {
      await api.changeSeat(
        selectedBooking.bookingNumber,
        selectedBooking.firstName,
        selectedBooking.lastName,
        newSeat
      );
      await loadBookings();
      setShowSeatSelector(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Failed to change seat:', error);
      alert('Failed to change seat. Please try again.');
    }
  };

  const openSeatSelector = (booking: BookingDetails) => {
    setSelectedBooking({
      bookingNumber: booking.booking_number,
      firstName: booking.first_name,
      lastName: booking.last_name,
      currentSeat: booking.seat_number
    });
    setShowSeatSelector(true);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">✈️</span>
          <span className="logo-text">Funnair</span>
        </div>
        <div className="header-info">
          <span className="status-badge">AI Assistant</span>
        </div>
      </header>

      <main className="app-content">
        <div className="split-layout">
          <div className="chat-panel">
            <ChatInterface
              chatId={chatId}
              onBookingChange={loadBookings}
            />
          </div>

          <div className="bookings-panel">
            <BookingGrid bookings={bookings} />
          </div>
        </div>
      </main>

      {showSeatSelector && selectedBooking && (
        <SeatSelector
          currentSeat={selectedBooking.currentSeat}
          onSeatSelected={handleSeatChange}
          onClose={() => {
            setShowSeatSelector(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
