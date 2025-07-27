import { IsString, IsOptional, IsNumber, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

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
    customfield_10026?: number; // Story points field
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

export interface JiraProject {
  id: string;
  key: string;
  name: string;
}

export interface JiraHealthCheckSuccess {
  status: 'healthy';
  version: string;
  baseUrl: string;
  buildNumber: string;
  buildDate: string;
  serverTime: string;
}

export interface JiraHealthCheckError {
  status: 'unhealthy';
  error: string;
  timestamp: string;
}

export type JiraHealthCheckResponse = JiraHealthCheckSuccess | JiraHealthCheckError;

export class UpdateIssueFields {
  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  assignee?: {
    name: string;
  };

  @IsOptional()
  @IsNumber()
  sprint?: number;
}

export class UpdateIssueDto {
  @ValidateNested()
  @Type(() => UpdateIssueFields)
  fields: UpdateIssueFields;
}

export class BulkUpdateDto {
  @ValidateNested({ each: true })
  @Type(() => BulkIssueUpdate)
  updates: BulkIssueUpdate[];
}

export class BulkIssueUpdate {
  @IsString()
  issueKey: string;

  @ValidateNested()
  @Type(() => UpdateIssueFields)
  fields: UpdateIssueFields;
}