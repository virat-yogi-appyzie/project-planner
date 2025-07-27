import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class JiraExceptionFilter implements ExceptionFilter {
  catch(error: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (error.statusCode === 401) {
      status = HttpStatus.UNAUTHORIZED;
      message = 'Invalid JIRA credentials';
    } else if (error.statusCode === 403) {
      status = HttpStatus.FORBIDDEN;
      message = 'Insufficient permissions for this JIRA operation';
    } else if (error.statusCode === 404) {
      status = HttpStatus.NOT_FOUND;
      message = 'JIRA resource not found';
    } else if (error.message) {
      message = error.message;
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}