# Sprint Planner with JIRA Integration

A sprint planning application that integrates with JIRA to help manage and track sprint progress.

## Features

- JIRA Integration for fetching sprint and issue data
- Real-time sprint progress tracking
- Rate-limited API endpoints for security
- Comprehensive error handling and logging
- Type-safe implementation with TypeScript

## Prerequisites

- Node.js 16+ and npm
- JIRA account with API access
- JIRA API token

## Environment Setup

### Backend (.env)

Create a `.env` file in the `backend` directory with the following variables:

```env
JIRA_HOST=your-domain.atlassian.net
JIRA_USERNAME=your-email@domain.com
JIRA_API_TOKEN=your-api-token
PORT=3000
NODE_ENV=development
```

### Frontend (.env.local)

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Installation

1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm run start:dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000

## API Endpoints

### JIRA Integration

- `GET /api/jira/sprints/:boardId` - Get active sprints for a board
- `GET /api/jira/sprint/:sprintId/issues` - Get issues for a sprint
- `GET /api/jira/issue/:issueKey` - Get issue details
- `GET /api/jira/boards` - Get available boards
- `POST /api/jira/issue/:issueKey` - Update an issue
- `GET /api/jira/sprint/:sprintId/metrics` - Get sprint metrics

## Rate Limiting

The API is rate-limited to prevent abuse:
- 100 requests per minute per IP address
- Configurable through ThrottlerModule settings

## Error Handling

The application includes comprehensive error handling:
- Custom exception filters for JIRA-related errors
- Detailed error logging with Winston
- Structured error responses for the frontend

## Logging

Logs are stored in the `backend/logs` directory:
- `error.log`: Error-level logs
- `combined.log`: All logs
- Console output for development