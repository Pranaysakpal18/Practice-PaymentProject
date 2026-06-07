// Card payment validation utility endpoints and helpers

import { client } from './client';

// Luhn validation algorithm for credit cards
export function validateLuhn(cardNumber) {
  const digits = cardNumber.replace(/\D/g, '');
  let sum = 0;
  let shouldDouble = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0 && digits.length >= 12;
}

// Card Type brand detection
export function detectCardType(cardNumber) {
  const cleanNum = cardNumber.replace(/\D/g, '');
  
  if (cleanNum.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(cleanNum) || /^2[2-7]/.test(cleanNum)) return 'mastercard';
  if (/^3[47]/.test(cleanNum)) return 'amex';
  if (/^(6011|622|64|65)/.test(cleanNum)) return 'discover';
  if (/^35/.test(cleanNum)) return 'jcb';
  if (/^(5085|60|65)/.test(cleanNum)) return 'rupay'; // RuPay ranges
  
  return 'generic';
}

// Fetch card BIN metadata (to simulate card bank query)
export async function validateCardBin(bin) {
  // If short, return neutral
  if (bin.length < 6) return null;
  
  // Call checkout endpoint (intercepted by client mocks)
  return await client.get(`/checkout/card-bin/${bin}`);
}

// Submit card transaction updates
export async function updateTransaction(sessionId, payload) {
  return await client.post('/payment/pay', {
    sessionId,
    method: 'CARD',
    ...payload
  });
}
