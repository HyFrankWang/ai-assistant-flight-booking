import { BookingDetails } from '../types';

const API_BASE = '/api';

export const api = {
  async getBookings(): Promise<BookingDetails[]> {
    const response = await fetch(`${API_BASE}/bookings`);
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },

  async getBooking(bookingNumber: string, firstName: string, lastName: string): Promise<BookingDetails> {
    const params = new URLSearchParams({
      booking_number: bookingNumber,
      first_name: firstName,
      last_name: lastName
    });
    const response = await fetch(`${API_BASE}/bookings/${bookingNumber}?${params}`);
    if (!response.ok) throw new Error('Booking not found');
    return response.json();
  },

  async changeBooking(data: {
    booking_number: string;
    first_name: string;
    last_name: string;
    new_date: string;
    from_airport: string;
    to_airport: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/bookings/change`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to change booking');
    }
    return response.json();
  },

  async cancelBooking(bookingNumber: string, firstName: string, lastName: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/bookings/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_number: bookingNumber,
        first_name: firstName,
        last_name: lastName
      })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to cancel booking');
    }
    return response.json();
  },

  async changeSeat(bookingNumber: string, firstName: string, lastName: string, seatNumber: string): Promise<{ success: boolean; message: string }> {
    const params = new URLSearchParams({
      first_name: firstName,
      last_name: lastName,
      seat_number: seatNumber
    });
    const response = await fetch(`${API_BASE}/bookings/${bookingNumber}/seat?${params}`, {
      method: 'POST'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to change seat');
    }
    return response.json();
  },

  async *chatStream(message: string, chatId: string): AsyncGenerator<string> {
    const response = await fetch(`${API_BASE}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, chat_id: chatId })
    });

    if (!response.ok) {
      throw new Error('Failed to get chat response');
    }

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const { chunk: content } = JSON.parse(data);
            if (content) yield content;
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  }
};
