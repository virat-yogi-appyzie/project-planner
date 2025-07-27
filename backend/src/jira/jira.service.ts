import { Injectable, Inject } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import JiraClient from 'jira-client';
import { jiraConfig } from '../config/jira.config';
import { JiraIssue, JiraSprint, JiraBoard, JiraHealthCheckResponse, JiraHealthCheckSuccess, JiraHealthCheckError, BulkUpdateDto } from './dto/jira.dto';

@Injectable()
export class JiraService {
  private readonly jira: JiraClient;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {
    this.jira = new JiraClient(jiraConfig);
    this.logger.info('JIRA service initialized', { context: 'JiraService' });
  }

  async checkHealth(): Promise<JiraHealthCheckResponse> {
    try {
      this.logger.debug('Checking JIRA connection health', { context: 'JiraService' });
      const serverInfo = await this.jira.getServerInfo();
      const status: JiraHealthCheckSuccess = {
        status: 'healthy',
        version: serverInfo.version,
        baseUrl: serverInfo.baseUrl,
        buildNumber: serverInfo.buildNumber,
        buildDate: serverInfo.buildDate,
        serverTime: serverInfo.serverTime,
      };
      this.logger.info('JIRA health check successful', { 
        context: 'JiraService',
        ...status
      });
      return status;
    } catch (error) {
      this.logger.error('JIRA health check failed', {
        context: 'JiraService',
        error: error.message,
        stack: error.stack
      });
      const errorResponse: JiraHealthCheckError = {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      return errorResponse;
    }
  }

  async getSprintIssues(sprintId: string): Promise<{ issues: JiraIssue[] }> {
    try {
      this.logger.debug(`Fetching issues for sprint ${sprintId}`, { context: 'JiraService' });
      const jql = `sprint = ${sprintId} ORDER BY created DESC`;
      const response = await this.jira.searchJira(jql);
      this.logger.debug(`Found ${response.issues.length} issues for sprint ${sprintId}`, { context: 'JiraService' });
      
      return {
        issues: response.issues.map(issue => ({
          id: issue.id,
          key: issue.key,
          fields: {
            summary: issue.fields.summary,
            description: issue.fields.description,
            status: {
              name: issue.fields.status.name,
              statusCategory: {
                key: issue.fields.status.statusCategory.key,
                name: issue.fields.status.statusCategory.name
              }
            },
            priority: issue.fields.priority,
            assignee: issue.fields.assignee,
            sprint: issue.fields.sprint,
            project: {
              id: issue.fields.project.id,
              key: issue.fields.project.key,
              name: issue.fields.project.name
            }
          }
        }))
      };
    } catch (error) {
      this.logger.error(`Error fetching sprint issues: ${error.message}`, {
        context: 'JiraService',
        sprintId,
        error
      });
      throw error;
    }
  }

  async getIssueDetails(issueKey: string): Promise<JiraIssue> {
    try {
      this.logger.debug(`Fetching details for issue ${issueKey}`, { context: 'JiraService' });
      const issue = await this.jira.findIssue(issueKey);
      
      return {
        id: issue.id,
        key: issue.key,
        fields: {
          summary: issue.fields.summary,
          description: issue.fields.description,
          status: {
            name: issue.fields.status.name,
            statusCategory: {
              key: issue.fields.status.statusCategory.key,
              name: issue.fields.status.statusCategory.name
            }
          },
          priority: issue.fields.priority,
          assignee: issue.fields.assignee,
          sprint: issue.fields.sprint,
          project: {
            id: issue.fields.project.id,
            key: issue.fields.project.key,
            name: issue.fields.project.name
          }
        }
      };
    } catch (error) {
      this.logger.error(`Error fetching issue details: ${error.message}`, {
        context: 'JiraService',
        issueKey,
        error
      });
      throw error;
    }
  }

  async getActiveSprints(boardId: string): Promise<JiraSprint[]> {
    try {
      this.logger.debug(`Fetching active sprints for board ${boardId}`, { context: 'JiraService' });
      const jql = `project in (select project from board where id = ${boardId}) AND sprint in openSprints()`;
      const result = await this.jira.searchJira(jql);
      const sprintsMap = new Map<number, JiraSprint>();
      
      result.issues.forEach(issue => {
        if (issue.fields.sprint) {
          const sprint = issue.fields.sprint;
          if (!sprintsMap.has(sprint.id)) {
            sprintsMap.set(sprint.id, {
              id: sprint.id,
              name: sprint.name,
              state: sprint.state,
              startDate: sprint.startDate,
              endDate: sprint.endDate,
              completeDate: sprint.completeDate,
              activatedDate: sprint.activatedDate,
              goal: sprint.goal
            });
          }
        }
      });
      
      const sprints = Array.from(sprintsMap.values());
      this.logger.debug(`Found ${sprints.length} active sprints for board ${boardId}`, { 
        context: 'JiraService'
      });
      return sprints;
    } catch (error) {
      this.logger.error(`Error fetching active sprints: ${error.message}`, {
        context: 'JiraService',
        boardId,
        error
      });
      throw error;
    }
  }

  async getBoard(projectKeyOrId: string): Promise<JiraBoard[]> {
    try {
      this.logger.debug(`Fetching board for project ${projectKeyOrId}`, { context: 'JiraService' });
      const jql = `project = ${projectKeyOrId}`;
      const result = await this.jira.searchJira(jql, {
        maxResults: 1,
        fields: ['project']
      });
      
      if (result.issues.length === 0) {
        this.logger.warn(`No boards found for project ${projectKeyOrId}`, { context: 'JiraService' });
        return [];
      }

      const project = result.issues[0].fields.project;
      const boards = [{
        id: parseInt(project.id, 10),
        name: `${project.name} Board`,
        projectKey: project.key,
        type: 'scrum'
      }];

      this.logger.debug(`Found ${boards.length} boards for project ${projectKeyOrId}`, { 
        context: 'JiraService' 
      });
      return boards;
    } catch (error) {
      this.logger.error(`Error fetching board: ${error.message}`, {
        context: 'JiraService',
        projectKeyOrId,
        error
      });
      throw error;
    }
  }

  async updateIssue(issueKey: string, data: any) {
    try {
      this.logger.debug(`Updating issue ${issueKey}`, { 
        context: 'JiraService',
        updateData: data
      });
      const result = await this.jira.updateIssue(issueKey, data);
      this.logger.info(`Successfully updated issue ${issueKey}`, { context: 'JiraService' });
      return result;
    } catch (error) {
      this.logger.error(`Error updating issue: ${error.message}`, {
        context: 'JiraService',
        issueKey,
        updateData: data,
        error
      });
      throw error;
    }
  }

  async getSprintHistory(sprintId: string): Promise<{
    changes: Array<{
      field: string;
      from: string;
      to: string;
      author: string;
      created: string;
    }>;
  }> {
    try {
      this.logger.debug(`Fetching history for sprint ${sprintId}`, { context: 'JiraService' });
      const jql = `sprint = ${sprintId}`;
      const result = await this.jira.searchJira(jql, {
        expand: ['changelog']
      });
      
      const changes = result.issues.reduce((acc, issue) => {
        if (issue.changelog && issue.changelog.histories) {
          const sprintChanges = issue.changelog.histories
            .filter(history => history.items.some(item => 
              item.field === 'status' || item.field === 'Sprint'
            ))
            .map(history => history.items.map(item => ({
              field: item.field,
              from: item.fromString || '',
              to: item.toString || '',
              author: history.author.displayName,
              created: history.created
            })))
            .flat();
          return [...acc, ...sprintChanges];
        }
        return acc;
      }, []);

      changes.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
      
      this.logger.debug(`Found ${changes.length} changes for sprint ${sprintId}`, { 
        context: 'JiraService'
      });
      return { changes };
    } catch (error) {
      this.logger.error(`Error fetching sprint history: ${error.message}`, {
        context: 'JiraService',
        sprintId,
        error
      });
      throw error;
    }
  }

  async bulkUpdateIssues(sprintId: string, data: BulkUpdateDto) {
    try {
      this.logger.debug(`Starting bulk update for sprint ${sprintId}`, { 
        context: 'JiraService',
        updateCount: data.updates.length
      });

      const results = await Promise.allSettled(
        data.updates.map(update => 
          this.updateIssue(update.issueKey, { fields: update.fields })
        )
      );

      const summary = results.reduce((acc: { succeeded: string[], failed: Array<{ issueKey: string, error: string }> }, result, index) => {
        const issueKey = data.updates[index].issueKey;
        if (result.status === 'fulfilled') {
          acc.succeeded.push(issueKey);
        } else {
          acc.failed.push({
            issueKey,
            error: result.reason.message
          });
        }
        return acc;
      }, { succeeded: [], failed: [] });

      this.logger.info(`Completed bulk update for sprint ${sprintId}`, {
        context: 'JiraService',
        successCount: summary.succeeded.length,
        failureCount: summary.failed.length
      });

      return summary;
    } catch (error) {
      this.logger.error(`Error in bulk update: ${error.message}`, {
        context: 'JiraService',
        sprintId,
        error
      });
      throw error;
    }
  }
}