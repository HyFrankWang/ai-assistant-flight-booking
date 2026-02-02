export interface BookingDetails {
  booking_number: string;
  ticket_number: string;
  first_name: string;
  last_name: string;
  date: string;
  booking_status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  from_airport: string;
  to_airport: string;
  seat_number: string;
  booking_class: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface SeatInfo {
  id: string;
  row: number;
  letter: string;
  isSelected: boolean;
}
