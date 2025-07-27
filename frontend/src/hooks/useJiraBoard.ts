import { useState, useEffect } from 'react';
import { jiraApi } from '@/services/jira';
import { JiraBoard } from '@/types/jira';
import { useJiraRequest } from './useJiraRequest';

export function useJiraBoard() {
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const boardsRequest = useJiraRequest<JiraBoard[]>();

  const loadBoards = async (projectKeyOrId: string) => {
    return boardsRequest.execute(jiraApi.getBoards(projectKeyOrId));
  };

  useEffect(() => {
    // Reset board selection when request state changes
    if (boardsRequest.error || !boardsRequest.data) {
      setSelectedBoardId(null);
    }
  }, [boardsRequest.error, boardsRequest.data]);

  return {
    selectedBoardId,
    setSelectedBoardId,
    boards: boardsRequest.data || [],
    isLoading: boardsRequest.isLoading,
    error: boardsRequest.error,
    loadBoards,
  };
}