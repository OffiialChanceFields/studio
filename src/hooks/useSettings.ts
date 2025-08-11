
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useSettings() {
  const { toast } = useToast();
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/github-token');
        if (res.ok) {
          const data = await res.json();
          setToken(data.token || '');
        }
      } catch (error) {
        console.error('Failed to fetch token:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchToken();
  }, []);

  const handleSaveToken = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/github-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save token');
      }
      
      toast({ title: 'Success', description: 'GitHub token saved successfully.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    token,
    setToken,
    isLoading,
    handleSaveToken,
  };
}
