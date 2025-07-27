export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: string;
    status: {
      name: string;
      statusCategory: {
        key: string;
        name: string;
      };
    };
    priority?: {
      name: string;
      iconUrl?: string;
    };
    assignee?: {
      displayName: string;
      emailAddress?: string;
      avatarUrls?: {
        [key: string]: string;
      };
    };
    sprint?: {
      id: number;
      name: string;
      state: string;
      startDate?: string;
      endDate?: string;
    };
    project: {
      id: string;
      key: string;
      name: string;
    };
  };
}

export interface JiraSprint {
  id: number;
  name: string;
  state: string;
  startDate?: string;
  endDate?: string;
  completeDate?: string;
  activatedDate?: string;
  goal?: string;
}

export interface JiraBoard {
  id: number;
  name: string;
  projectKey: string;
  type: string;
}

export interface SprintMetrics {
  totalIssues: number;
  completedIssues: number;
  completionRate: number;
}

export interface UpdateIssueFields {
  summary?: string;
  description?: string;
  assignee?: {
    name: string;
  };
  sprint?: number;
}

export interface UpdateIssueData {
  fields: UpdateIssueFields;
}