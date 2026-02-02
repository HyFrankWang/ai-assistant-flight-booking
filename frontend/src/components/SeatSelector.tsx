import React, { useState, useCallback } from 'react';
import { SeatInfo } from '../types';
import './SeatSelector.css';

interface SeatSelectorProps {
  currentSeat?: string;
  onSeatSelected: (seatId: string) => void;
  onClose: () => void;
}

const ROWS = 12;
const SEAT_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export const SeatSelector: React.FC<SeatSelectorProps> = ({
  currentSeat,
  onSeatSelected,
  onClose
}) => {
  const [selectedSeat, setSelectedSeat] = useState<string>(currentSeat || '');

  const generateSeats = useCallback((): SeatInfo[] => {
    const seats: SeatInfo[] = [];
    for (let row = 1; row <= ROWS; row++) {
      for (const letter of SEAT_LETTERS) {
        const id = `${row}${letter}`;
        seats.push({
          id,
          row,
          letter,
          isSelected: id === selectedSeat
        });
      }
    }
    return seats;
  }, [selectedSeat]);

  const handleSeatClick = (seatId: string) => {
    setSelectedSeat(seatId);
  };

  const handleConfirm = () => {
    if (selectedSeat) {
      onSeatSelected(selectedSeat);
    }
  };

  const seats = generateSeats();

  return (
    <div className="seat-selector-overlay">
      <div className="seat-selector-dialog">
        <div className="seat-selector-header">
          <h3>Select a Seat</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="seat-legend">
          <div className="legend-item">
            <div className="seat sample available"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="seat sample selected"></div>
            <span>Selected</span>
          </div>
          <div className="legend-item">
            <div className="seat sample current"></div>
            <span>Current</span>
          </div>
        </div>

        <div className="seat-grid">
          {Array.from({ length: ROWS }).map((_, rowIndex) => {
            const row = rowIndex + 1;
            const rowSeats = seats.filter(s => s.row === row);
            
            return (
              <div key={row} className="seat-row">
                <span className="row-number">{row}</span>
                {rowSeats.map((seat) => {
                  const isCurrentSeat = seat.id === currentSeat;
                  return (
                    <button
                      key={seat.id}
                      className={`seat ${seat.isSelected ? 'selected' : ''} ${isCurrentSeat ? 'current' : ''}`}
                      onClick={() => handleSeatClick(seat.id)}
                      title={`Seat ${seat.id}`}
                    >
                      {seat.letter}
                    </button>
                  );
                })}
                <span className="row-number">{row}</span>
              </div>
            );
          })}
        </div>

        <div className="seat-selector-footer">
          <div className="selected-info">
            Selected: <strong>{selectedSeat || 'None'}</strong>
          </div>
          <div className="seat-actions">
            <button className="cancel-btn" onClick={onClose}>Cancel</button>
            <button 
              className="confirm-btn" 
              onClick={handleConfirm}
              disabled={!selectedSeat}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
