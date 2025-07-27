import { JiraIssue, JiraSprint, JiraBoard, UpdateIssueData, SprintMetrics } from '@/types/jira';
import { API_CONFIG } from '@/config/api.config';

export class JiraApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'JiraApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new JiraApiError(
      error.message || 'An error occurred while fetching data',
      response.status
    );
  }
  return response.json();
}

export const jiraApi = {
  getActiveSprints: async (boardId: string): Promise<JiraSprint[]> => {
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.jira.sprints(boardId)}`
    );
    return handleResponse<JiraSprint[]>(response);
  },

  getSprintIssues: async (sprintId: string): Promise<{ issues: JiraIssue[] }> => {
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.jira.sprintIssues(sprintId)}`
    );
    return handleResponse<{ issues: JiraIssue[] }>(response);
  },

  getIssueDetails: async (issueKey: string): Promise<JiraIssue> => {
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.jira.issue(issueKey)}`
    );
    return handleResponse<JiraIssue>(response);
  },

  getBoards: async (projectKeyOrId: string): Promise<JiraBoard[]> => {
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.jira.boards}?projectKeyOrId=${projectKeyOrId}`
    );
    return handleResponse<JiraBoard[]>(response);
  },

  updateIssue: async (issueKey: string, data: UpdateIssueData): Promise<void> => {
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.jira.issue(issueKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
    return handleResponse<void>(response);
  },

  getSprintMetrics: async (sprintId: string): Promise<SprintMetrics> => {
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.jira.sprintMetrics(sprintId)}`
    );
    return handleResponse<SprintMetrics>(response);
  },

  checkHealth: async () => {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.jira.health}`);
    return handleResponse<{
      status: 'healthy' | 'unhealthy';
      version?: string;
      baseUrl?: string;
      error?: string;
      timestamp?: string;
    }>(response);
  },
};