const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface PaymentIntentRequest {
  amount: number;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
  };
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface ConfirmBookingRequest {
  paymentIntentId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
  };
  totalAmount: number;
}

export const createPaymentIntent = async (paymentData: PaymentIntentRequest): Promise<PaymentIntentResponse> => {
  const response = await fetch(`${API_BASE_URL}/payments/create-payment-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create payment intent');
  }

  return response.json();
};

export const confirmBooking = async (bookingData: ConfirmBookingRequest) => {
  const response = await fetch(`${API_BASE_URL}/payments/confirm-booking`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to confirm booking');
  }

  return response.json();
};

export const getBooking = async (bookingId: string) => {
  const response = await fetch(`${API_BASE_URL}/payments/booking/${bookingId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch booking');
  }

  return response.json();
};