"use client";

import { useState } from 'react';
import { Calendar, CheckCircle, Loader2 } from 'lucide-react';

interface AddToCalendarProps {
  bookingId: number;
  bookingDate: string;
  farmName: string;
  activityName: string;
  durationMinutes?: number;
  variant?: 'button' | 'icon';
  className?: string;
}

export default function AddToCalendar({
  bookingId,
  bookingDate,
  farmName,
  activityName,
  durationMinutes = 60,
  variant = 'button',
  className = '',
}: AddToCalendarProps) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCalendar = async () => {
    if (added) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.eventUrl) {
        setAdded(true);
        window.open(data.eventUrl, '_blank');
        setTimeout(() => setAdded(false), 3000);
      } else {
        alert('Failed to add to calendar. Please try again.');
      }
    } catch (error) {
      console.error('Error adding to calendar:', error);
      alert('Failed to add to calendar');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleAddToCalendar}
        disabled={loading || added}
        className={`p-2 rounded-lg transition-colors ${className} ${
          added
            ? 'bg-green-100 text-green-600'
            : 'text-emerald-600 hover:bg-emerald-50'
        }`}
        title="Add to Google Calendar"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : added ? (
          <CheckCircle className="h-5 w-5" />
        ) : (
          <Calendar className="h-5 w-5" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCalendar}
      disabled={loading || added}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${className} ${
        added
          ? 'bg-green-100 text-green-700'
          : 'bg-emerald-600 text-white hover:bg-emerald-700'
      }`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Adding...
        </>
      ) : added ? (
        <>
          <CheckCircle className="h-4 w-4" />
          Added to Calendar
        </>
      ) : (
        <>
          <Calendar className="h-4 w-4" />
          Add to Calendar
        </>
      )}
    </button>
  );
}