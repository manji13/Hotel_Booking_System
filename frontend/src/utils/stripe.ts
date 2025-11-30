import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  if (!stripePromise) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};