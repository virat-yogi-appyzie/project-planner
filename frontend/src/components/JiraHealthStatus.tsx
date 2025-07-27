import { useEffect } from 'react';
import { jiraApi } from '@/services/jira';
import { useJiraRequest } from '@/hooks/useJiraRequest';
import { Alert } from './Alert';
import { LoadingSpinner } from './LoadingSpinner';

export function JiraHealthStatus() {
  const healthCheck = useJiraRequest<{
    status: 'healthy' | 'unhealthy';
    version?: string;
    error?: string;
  }>();

  useEffect(() => {
    const checkHealth = async () => {
      await healthCheck.execute(jiraApi.checkHealth());
    };
    checkHealth();

    // Check health every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (healthCheck.isLoading) {
    return <LoadingSpinner size="small" />;
  }

  if (healthCheck.error) {
    return (
      <Alert
        type="error"
        message="Unable to connect to JIRA"
        onClose={healthCheck.reset}
      />
    );
  }

  if (!healthCheck.data) {
    return null;
  }

  return (
    <Alert
      type={healthCheck.data.status === 'healthy' ? 'success' : 'error'}
      message={
        healthCheck.data.status === 'healthy'
          ? `Connected to JIRA (v${healthCheck.data.version})`
          : `JIRA Connection Error: ${healthCheck.data.error}`
      }
    />
  );
}