export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  endpoints: {
    jira: {
      base: '/jira',
      sprints: (boardId: string) => `/jira/sprints/${boardId}`,
      sprintIssues: (sprintId: string) => `/jira/sprint/${sprintId}/issues`,
      issue: (issueKey: string) => `/jira/issue/${issueKey}`,
      boards: '/jira/boards',
      sprintMetrics: (sprintId: string) => `/jira/sprint/${sprintId}/metrics`,
      health: '/jira/health'
    }
  }
};