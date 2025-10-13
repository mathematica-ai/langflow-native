/**
 * useWorkflowState hook - subscribe to workflow state changes
 */

import { useState, useEffect } from 'react';
import { FlowId, NodeId, ExecutionStatus } from '@langflow-native/core';
import { StateManager } from '@langflow-native/runtime';

export interface UseWorkflowStateOptions {
  stateManager: StateManager;
  flowId: FlowId;
  pollInterval?: number;
}

export interface UseWorkflowStateResult {
  status: ExecutionStatus | null;
  duration?: number;
  successCount: number;
  errorCount: number;
  pendingCount: number;
  getNodeResult: (nodeId: NodeId) => any;
  getNodeError: (nodeId: NodeId) => Error | undefined;
}

/**
 * Hook to subscribe to workflow state
 */
export function useWorkflowState(
  options: UseWorkflowStateOptions
): UseWorkflowStateResult {
  const { stateManager, flowId, pollInterval = 1000 } = options;

  const [status, setStatus] = useState<ExecutionStatus | null>(null);
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const updateState = () => {
      const summary = stateManager.getSummary(flowId);
      if (summary) {
        setStatus(summary.status);
        setDuration(summary.duration);
        setSuccessCount(summary.successCount);
        setErrorCount(summary.errorCount);
        setPendingCount(summary.pendingCount);
      }
    };

    // Initial update
    updateState();

    // Poll for updates
    const intervalId = setInterval(updateState, pollInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [stateManager, flowId, pollInterval]);

  const getNodeResult = (nodeId: NodeId): any => {
    return stateManager.getNodeResult(flowId, nodeId);
  };

  const getNodeError = (nodeId: NodeId): Error | undefined => {
    return stateManager.getNodeError(flowId, nodeId);
  };

  return {
    status,
    duration,
    successCount,
    errorCount,
    pendingCount,
    getNodeResult,
    getNodeError,
  };
}

