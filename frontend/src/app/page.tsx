'use client';

import { useState } from 'react';
import { useJiraBoard } from '@/hooks/useJiraBoard';
import { useJiraSprint } from '@/hooks/useJiraSprint';
import { Alert } from '@/components/Alert';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function SprintPlanningPage() {
  const [projectKey, setProjectKey] = useState('');
  const { 
    boards,
    selectedBoardId,
    setSelectedBoardId,
    isLoading: isBoardLoading,
    error: boardError,
    loadBoards
  } = useJiraBoard();

  const {
    sprints,
    selectedSprintId,
    setSelectedSprintId,
    issues,
    metrics,
    isLoading: isSprintLoading,
    error: sprintError,
    loadSprints
  } = useJiraSprint(selectedBoardId);

  const handleProjectSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (projectKey) {
      await loadBoards(projectKey);
    }
  };

  const handleBoardSelect = (boardId: string) => {
    setSelectedBoardId(boardId);
    loadSprints();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Sprint Planner</h1>

      <div className="grid gap-8">
        {/* Project Search */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Search Project</h2>
          <form onSubmit={handleProjectSearch} className="flex gap-4">
            <input
              type="text"
              value={projectKey}
              onChange={(e) => setProjectKey(e.target.value)}
              placeholder="Enter project key..."
              className="flex-1 p-2 border rounded"
            />
            <button
              type="submit"
              disabled={!projectKey || isBoardLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isBoardLoading ? <LoadingSpinner size="small" /> : 'Search'}
            </button>
          </form>
          {boardError && (
            <Alert
              type="error"
              message={boardError.message}
            />
          )}
        </section>

        {/* Board Selection */}
        {boards.length > 0 && (
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Select Board</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {boards.map(board => (
                <button
                  key={board.id}
                  onClick={() => handleBoardSelect(board.id.toString())}
                  className={`p-4 border rounded text-left hover:border-blue-500 ${
                    selectedBoardId === board.id.toString() ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <h3 className="font-medium">{board.name}</h3>
                  <p className="text-sm text-gray-600">Project: {board.projectKey}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Sprint List */}
        {selectedBoardId && (
          <ErrorBoundary>
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Active Sprints</h2>
              {isSprintLoading ? (
                <LoadingSpinner />
              ) : sprintError.sprints ? (
                <Alert
                  type="error"
                  message={sprintError.sprints.message}
                />
              ) : sprints.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No active sprints found</p>
              ) : (
                <div className="grid gap-4">
                  {sprints.map(sprint => (
                    <div
                      key={sprint.id}
                      className={`p-4 border rounded ${
                        selectedSprintId === sprint.id.toString() ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                    >
                      <h3 className="font-medium">{sprint.name}</h3>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Start: {new Date(sprint.startDate || '').toLocaleDateString()}</p>
                        <p>End: {new Date(sprint.endDate || '').toLocaleDateString()}</p>
                      </div>
                      {metrics && selectedSprintId === sprint.id.toString() && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm font-medium">
                            Progress: {metrics.completedIssues}/{metrics.totalIssues} issues 
                            ({Math.round(metrics.completionRate)}%)
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
}
