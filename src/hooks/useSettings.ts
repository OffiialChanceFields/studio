
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

const GITHUB_TOKEN_KEY = 'github_token';

export function useSettings() {
  const { toast } = useToast();
  const [token, setToken] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize the function to fetch token status to avoid re-creating it on every render
  const fetchTokenStatus = useCallback(() => {
    // Safely access localStorage only on the client side
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem(GITHUB_TOKEN_KEY);
      setHasToken(!!storedToken);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchTokenStatus();
  }, [fetchTokenStatus]);

  const handleSaveToken = async () => {
    setIsLoading(true);
    try {
      // Safely access localStorage only on the client side
      if (typeof window !== 'undefined') {
        if (!token) {
          throw new Error('Token cannot be empty.');
        }
        localStorage.setItem(GITHUB_TOKEN_KEY, token);
        setHasToken(true); // First, confirm that the token is set
        setToken(''); // Then, clear the input
        toast({ title: 'Success', description: 'GitHub token saved successfully.' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save token.', variant: 'destructive' });
      setHasToken(false); // Reflect that token saving failed
    } finally {
      setIsLoading(false);
    }
  };

  return {
    token,
    setToken,
    hasToken,
    isLoading,
    handleSaveToken,
  };
}
