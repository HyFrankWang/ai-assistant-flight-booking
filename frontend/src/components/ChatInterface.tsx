import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { api } from '../services/api';
import './ChatInterface.css';

interface ChatInterfaceProps {
  chatId: string;
  onBookingChange: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatId, onBookingChange }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      let accumulatedContent = '';
      for await (const chunk of api.chatStream(inputValue, chatId)) {
        if (chunk === '[DONE]') {
          break;
        }
        accumulatedContent += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: accumulatedContent
          };
          return updated;
        });
      }

      // Refresh bookings after chat completes (in case of changes)
      onBookingChange();

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !isLoading) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h3>Funnair Customer Support</h3>
        <span className="chat-subtitle">Ask me about your bookings</span>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <div className="welcome-icon">✈️</div>
            <h4>Welcome to Funnair!</h4>
            <p>I'm your AI travel assistant. You can ask me about:</p>
            <ul>
              <li>Your flight details and status</li>
              <li>Changing your booking</li>
              <li>Cancelling a reservation</li>
              <li>Seat selection</li>
              <li>Our policies and fees</li>
            </ul>
          </div>
        )}
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-avatar">
              {message.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="message-role">
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </span>
                <span className="message-time">{formatTime(message.timestamp)}</span>
              </div>
              <div className="message-text">
                {message.content || (isLoading && message.role === 'assistant' ? '...' : '')}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-container" onSubmit={handleSubmit}>
        <textarea
          className="chat-input"
          placeholder="Type your message... (Shift+Enter for new line)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={1}
        />
        <button
          type="submit"
          className="send-button"
          disabled={!inputValue.trim() || isLoading}
        >
          {isLoading ? '⏳' : 'Send'}
        </button>
      </form>
    </div>
  );
};
