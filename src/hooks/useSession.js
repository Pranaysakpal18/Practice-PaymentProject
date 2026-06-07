import { useQuery } from '@tanstack/react-query';
import { client } from '../api/client';

// Fetch checkout session by request/session ID
export const useSession = (requestId) => {
  return useQuery({
    queryKey: ['checkout-session', requestId],
    queryFn: async () => {
      return await client.get(`/checkout/sessions/${requestId}`);
    },
    enabled: !!requestId,
    retry: 1,
    staleTime: 5 * 60 * 1000 // 5 minutes cache
  });
};
