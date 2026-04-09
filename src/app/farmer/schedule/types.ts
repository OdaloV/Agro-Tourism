// src/app/farmer/schedule/types.ts
export interface Booking {
  id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  guests_count: number;
  total_amount: number;
  status: string;
  payment_status?: string; 
  activity_name: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
}

export interface BlockedDate {
  id: number;
  start_date: string;
  end_date: string;
  reason: string;
}

export interface SummaryStats {
  today_count: number;
  upcoming_count: number;
  pending_count: number;
  total_bookings: number;
}