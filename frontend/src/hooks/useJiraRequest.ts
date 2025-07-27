import { useState, useCallback } from 'react';
import { JiraApiError } from '@/services/jira';

interface UseJiraRequestState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export function useJiraRequest<T>() {
  const [state, setState] = useState<UseJiraRequestState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(async (promise: Promise<T>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await promise;
      setState({ data, error: null, isLoading: false });
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof JiraApiError
        ? err.message
        : 'An unexpected error occurred';
      setState({
        data: null,
        error: new Error(errorMessage),
        isLoading: false,
      });
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}