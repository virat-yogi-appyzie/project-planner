import * as dotenv from 'dotenv';

dotenv.config();

export interface JiraConfig {
  protocol: string;
  host: string;
  username: string;
  password: string;
  apiVersion: string;
  strictSSL: boolean;
}

export const jiraConfig: JiraConfig = {
  protocol: 'https',
  host: process.env.JIRA_HOST || '',
  username: process.env.JIRA_USERNAME || '',
  password: process.env.JIRA_API_TOKEN || '',
  apiVersion: '3',
  strictSSL: true
};