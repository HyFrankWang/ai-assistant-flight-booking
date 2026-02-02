import React, { useState } from 'react';
import { BookingDetails } from '../types';
import './BookingGrid.css';

interface BookingGridProps {
  bookings: BookingDetails[];
}

export const BookingGrid: React.FC<BookingGridProps> = ({ bookings }) => {
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null);

  const columns = [
    { key: 'booking_number', label: 'Booking #' },
    { key: 'ticket_number', label: 'Ticket #' },
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'date', label: 'Date' },
    { key: 'booking_status', label: 'Status' },
    { key: 'from_airport', label: 'From' },
    { key: 'to_airport', label: 'To' },
    { key: 'booking_class', label: 'Class' }
  ];

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'status-confirmed';
      case 'CANCELLED': return 'status-cancelled';
      case 'COMPLETED': return 'status-completed';
      default: return '';
    }
  };

  const getClassLabel = (cls: string) => {
    switch (cls) {
      case 'ECONOMY': return 'Economy';
      case 'PREMIUM_ECONOMY': return 'Premium';
      case 'BUSINESS': return 'Business';
      default: return cls;
    }
  };

  const handleRowClick = (booking: BookingDetails) => {
    setSelectedBooking(booking);
  };

  const handleCloseModal = () => {
    setSelectedBooking(null);
  };

  const formatDateLong = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="booking-grid-container">
      <h3 className="grid-title">Flight Bookings</h3>
      <div className="booking-grid">
        <div className="grid-header">
          {columns.map(col => (
            <div key={col.key} className="grid-cell header-cell">
              {col.label}
            </div>
          ))}
        </div>
        <div className="grid-body">
          {bookings.length === 0 ? (
            <div className="no-bookings">
              No bookings found
            </div>
          ) : (
            bookings.map((booking, index) => (
              <div
                key={index}
                className="grid-row clickable"
                onClick={() => handleRowClick(booking)}
              >
                {columns.map(col => {
                  let value: string;
                  switch (col.key) {
                    case 'date':
                      value = formatDate(booking[col.key as keyof BookingDetails] as string);
                      break;
                    case 'booking_status':
                      value = booking[col.key as keyof BookingDetails] as string;
                      break;
                    case 'booking_class':
                      value = getClassLabel(booking[col.key as keyof BookingDetails] as string);
                      break;
                    case 'ticket_number':
                      value = (booking[col.key as keyof BookingDetails] as string).substring(0, 8);
                      break;
                    default:
                      value = String(booking[col.key as keyof BookingDetails] ?? '');
                  }
                  return (
                    <div
                      key={col.key}
                      className={`grid-cell ${col.key === 'booking_status' ? getStatusClass(value) : ''}`}
                    >
                      {value}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>

      {selectedBooking && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Booking Details</h3>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Passenger Information</h4>
                <div className="detail-row">
                  <span className="detail-label">Booking Number:</span>
                  <span className="detail-value">{selectedBooking.booking_number}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Ticket Number:</span>
                  <span className="detail-value ticket-number">{selectedBooking.ticket_number}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Passenger:</span>
                  <span className="detail-value">{selectedBooking.first_name} {selectedBooking.last_name}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Flight Information</h4>
                <div className="detail-row">
                  <span className="detail-label">Route:</span>
                  <span className="detail-value flight-route">
                    {selectedBooking.from_airport} → {selectedBooking.to_airport}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{formatDateLong(selectedBooking.date)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Class:</span>
                  <span className="detail-value">{getClassLabel(selectedBooking.booking_class)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Seat:</span>
                  <span className="detail-value">{selectedBooking.seat_number}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Booking Status</h4>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`detail-value status-badge ${getStatusClass(selectedBooking.booking_status)}`}>
                    {selectedBooking.booking_status}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
