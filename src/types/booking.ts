// src/types/booking.ts
export interface BookingRequest {
  farmId: number;
  activityId: number;
  bookingDate: string;
  timeSlot?: string;
  participants: number;
  specialRequests?: string;
  groupName?: string;
  contactPhone: string;
  contactEmail: string;
}

export interface BookingResponse {
  id: number;
  bookingReference: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  totalAmount: number;
  currency: string;
  platformFee: number;
  farmerEarning: number;
  groupDiscount?: number;
  originalAmount?: number;
}

export interface PriceCalculation {
  regularPrice: number;
  discountPercent: number;
  discountAmount: number;
  totalPrice: number;
  pricePerPerson: number;
  category: 'standard' | 'group' | 'large_group';
  requiresQuote: boolean;
}