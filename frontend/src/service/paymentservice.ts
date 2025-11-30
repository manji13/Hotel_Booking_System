const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const createPaymentIntent = async (paymentData: any) => {
  const response = await fetch(`${API_BASE_URL}/payments/create-payment-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  });
  if (!response.ok) throw new Error('Failed to create payment intent');
  return response.json();
};

export const confirmBooking = async (bookingData: any) => {
  const response = await fetch(`${API_BASE_URL}/payments/confirm-booking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData),
  });
  if (!response.ok) {
     const err = await response.json();
     throw new Error(err.error || 'Failed to confirm booking');
  }
  return response.json();
};

export const getBooking = async (bookingId: string) => {
  const response = await fetch(`${API_BASE_URL}/payments/booking/${bookingId}`);
  if (!response.ok) throw new Error('Failed to fetch booking');
  return response.json();
};

// --- ADD THIS NEW FUNCTION ---
export const getAllBookings = async () => {
  const response = await fetch(`${API_BASE_URL}/payments/all-bookings`);
  if (!response.ok) throw new Error('Failed to fetch bookings list');
  return response.json();
};
// ----------------------------

export const deleteBooking = async (bookingId: string) => {
  const response = await fetch(`${API_BASE_URL}/payments/booking/${bookingId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete booking');
  return response.json();
};