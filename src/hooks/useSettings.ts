
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useSettings() {
  const { toast } = useToast();
  const [token, setToken] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTokenStatus = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/githubToken');
        if (res.ok) {
          const data = await res.json();
          setHasToken(data.hasToken);
        }
      } catch (error) {
        console.error('Failed to fetch token status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTokenStatus();
  }, []);

  const handleSaveToken = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/githubToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save token');
      }
      
      toast({ title: 'Success', description: 'GitHub token saved successfully.' });
      setHasToken(true);
      setToken('');

    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
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
