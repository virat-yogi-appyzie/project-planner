import { Controller, Get, Post, Body, Param, Query, ValidationPipe, ParseIntPipe, UseFilters, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JiraService } from './jira.service';
import { JiraIssue, JiraSprint, JiraBoard, UpdateIssueDto, JiraHealthCheckResponse, BulkUpdateDto } from './dto/jira.dto';
import { JiraExceptionFilter } from './filters/jira-exception.filter';

@Controller('api/jira')
@UseFilters(JiraExceptionFilter)
@UseGuards(ThrottlerGuard)
export class JiraController {
  constructor(private readonly jiraService: JiraService) {}

  @Get('health')
  async checkHealth(): Promise<JiraHealthCheckResponse> {
    return this.jiraService.checkHealth();
  }

  @Get('sprints/:boardId')
  async getActiveSprints(
    @Param('boardId', ParseIntPipe) boardId: string
  ): Promise<JiraSprint[]> {
    return this.jiraService.getActiveSprints(boardId);
  }

  @Get('sprint/:sprintId/issues')
  async getSprintIssues(
    @Param('sprintId', ParseIntPipe) sprintId: string
  ): Promise<{ issues: JiraIssue[] }> {
    return this.jiraService.getSprintIssues(sprintId);
  }

  @Get('issue/:issueKey')
  async getIssueDetails(
    @Param('issueKey') issueKey: string
  ): Promise<JiraIssue> {
    return this.jiraService.getIssueDetails(issueKey);
  }

  @Get('boards')
  async getBoards(
    @Query('projectKeyOrId') projectKeyOrId: string
  ): Promise<JiraBoard[]> {
    return this.jiraService.getBoard(projectKeyOrId);
  }

  @Post('issue/:issueKey')
  async updateIssue(
    @Param('issueKey') issueKey: string,
    @Body(new ValidationPipe()) updateData: UpdateIssueDto
  ) {
    return this.jiraService.updateIssue(issueKey, updateData);
  }

  @Get('sprint/:sprintId/metrics')
  async getSprintMetrics(
    @Param('sprintId', ParseIntPipe) sprintId: string
  ) {
    const issues = await this.jiraService.getSprintIssues(sprintId);
    const totalIssues = issues.issues.length;
    const completedIssues = issues.issues.filter(
      issue => issue.fields.status.statusCategory.key === 'done'
    ).length;

    return {
      totalIssues,
      completedIssues,
      completionRate: totalIssues ? (completedIssues / totalIssues) * 100 : 0
    };
  }

  @Get('sprint/:sprintId/history')
  async getSprintHistory(
    @Param('sprintId', ParseIntPipe) sprintId: string
  ) {
    return this.jiraService.getSprintHistory(sprintId);
  }

  @Get('sprint/:sprintId/advanced-metrics')
  async getAdvancedSprintMetrics(
    @Param('sprintId', ParseIntPipe) sprintId: string
  ) {
    const issues = await this.jiraService.getSprintIssues(sprintId);
    const storyPoints = issues.issues.reduce((acc, issue) => {
      return acc + (issue.fields.customfield_10026 || 0); // Assuming story points field
    }, 0);

    const byAssignee = issues.issues.reduce((acc, issue) => {
      const assignee = issue.fields.assignee?.displayName || 'Unassigned';
      if (!acc[assignee]) {
        acc[assignee] = { total: 0, completed: 0 };
      }
      acc[assignee].total++;
      if (issue.fields.status.statusCategory.key === 'done') {
        acc[assignee].completed++;
      }
      return acc;
    }, {});

    const byPriority = issues.issues.reduce((acc, issue) => {
      const priority = issue.fields.priority?.name || 'None';
      if (!acc[priority]) {
        acc[priority] = 0;
      }
      acc[priority]++;
      return acc;
    }, {});

    return {
      storyPoints,
      assigneeMetrics: byAssignee,
      priorityDistribution: byPriority
    };
  }

  @Post('sprint/:sprintId/bulk-update')
  async bulkUpdateIssues(
    @Param('sprintId', ParseIntPipe) sprintId: string,
    @Body(new ValidationPipe()) updates: BulkUpdateDto
  ) {
    return this.jiraService.bulkUpdateIssues(sprintId, updates);
  }
}