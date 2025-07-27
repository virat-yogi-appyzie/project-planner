import { useState, useEffect } from 'react';
import { jiraApi } from '@/services/jira';
import { JiraSprint, JiraIssue } from '@/types/jira';
import { useJiraRequest } from './useJiraRequest';

export function useJiraSprint(boardId: string | null) {
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const sprintsRequest = useJiraRequest<JiraSprint[]>();
  const sprintIssuesRequest = useJiraRequest<{ issues: JiraIssue[] }>();
  const sprintMetricsRequest = useJiraRequest<{
    totalIssues: number;
    completedIssues: number;
    completionRate: number;
  }>();

  const loadSprints = async () => {
    if (!boardId) return;
    return sprintsRequest.execute(jiraApi.getActiveSprints(boardId));
  };

  const loadSprintIssues = async (sprintId: string) => {
    return sprintIssuesRequest.execute(jiraApi.getSprintIssues(sprintId));
  };

  const loadSprintMetrics = async (sprintId: string) => {
    return sprintMetricsRequest.execute(jiraApi.getSprintMetrics(sprintId));
  };

  useEffect(() => {
    // Reset sprint selection when board changes or on error
    if (!boardId || sprintsRequest.error || !sprintsRequest.data) {
      setSelectedSprintId(null);
    }
  }, [boardId, sprintsRequest.error, sprintsRequest.data]);

  useEffect(() => {
    // Load sprint issues when sprint is selected
    if (selectedSprintId) {
      loadSprintIssues(selectedSprintId);
      loadSprintMetrics(selectedSprintId);
    }
  }, [selectedSprintId]);

  return {
    selectedSprintId,
    setSelectedSprintId,
    sprints: sprintsRequest.data || [],
    issues: sprintIssuesRequest.data?.issues || [],
    metrics: sprintMetricsRequest.data,
    isLoading: {
      sprints: sprintsRequest.isLoading,
      issues: sprintIssuesRequest.isLoading,
      metrics: sprintMetricsRequest.isLoading
    },
    error: {
      sprints: sprintsRequest.error,
      issues: sprintIssuesRequest.error,
      metrics: sprintMetricsRequest.error
    },
    loadSprints,
    loadSprintIssues,
    loadSprintMetrics,
  };
}