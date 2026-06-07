// Helper methods for express one-click checkout flows
import { client } from './client';

export async function processOneClickCheckout(sessionId, methodDetails) {
  return await client.post('/payment/pay', {
    sessionId,
    isOneClick: true,
    ...methodDetails
  });
}
