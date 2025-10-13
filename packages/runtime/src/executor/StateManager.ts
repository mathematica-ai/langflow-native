/**
 * State management for workflow execution
 */

import { FlowId, GraphExecutionState, NodeId, ExecutionStatus } from '@langflow-native/core';

export interface StateSnapshot {
  flowId: FlowId;
  timestamp: number;
  state: GraphExecutionState;
}

/**
 * StateManager - manages execution state and history
 */
export class StateManager {
  private states: Map<FlowId, GraphExecutionState> = new Map();
  private history: Map<FlowId, StateSnapshot[]> = new Map();
  private maxHistorySize: number;

  constructor(maxHistorySize: number = 100) {
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Save execution state
   */
  saveState(state: GraphExecutionState): void {
    this.states.set(state.flowId, state);

    // Save to history
    const snapshot: StateSnapshot = {
      flowId: state.flowId,
      timestamp: Date.now(),
      state: this.cloneState(state),
    };

    const flowHistory = this.history.get(state.flowId) || [];
    flowHistory.push(snapshot);

    // Limit history size
    if (flowHistory.length > this.maxHistorySize) {
      flowHistory.shift();
    }

    this.history.set(state.flowId, flowHistory);
  }

  /**
   * Get current state for a flow
   */
  getState(flowId: FlowId): GraphExecutionState | undefined {
    return this.states.get(flowId);
  }

  /**
   * Get execution history for a flow
   */
  getHistory(flowId: FlowId): StateSnapshot[] {
    return this.history.get(flowId) || [];
  }

  /**
   * Clear state for a flow
   */
  clearState(flowId: FlowId): void {
    this.states.delete(flowId);
    this.history.delete(flowId);
  }

  /**
   * Clear all states
   */
  clearAll(): void {
    this.states.clear();
    this.history.clear();
  }

  /**
   * Get execution summary
   */
  getSummary(flowId: FlowId): {
    status: ExecutionStatus;
    duration?: number;
    successCount: number;
    errorCount: number;
    pendingCount: number;
  } | null {
    const state = this.states.get(flowId);
    if (!state) return null;

    let successCount = 0;
    let errorCount = 0;
    let pendingCount = 0;

    state.nodeStates.forEach((nodeState) => {
      switch (nodeState.status) {
        case ExecutionStatus.SUCCESS:
          successCount++;
          break;
        case ExecutionStatus.ERROR:
          errorCount++;
          break;
        case ExecutionStatus.PENDING:
        case ExecutionStatus.RUNNING:
          pendingCount++;
          break;
      }
    });

    const duration = state.endTime ? state.endTime - state.startTime : undefined;

    return {
      status: state.status,
      duration,
      successCount,
      errorCount,
      pendingCount,
    };
  }

  /**
   * Clone state for snapshot
   */
  private cloneState(state: GraphExecutionState): GraphExecutionState {
    return {
      flowId: state.flowId,
      status: state.status,
      startTime: state.startTime,
      endTime: state.endTime,
      nodeStates: new Map(state.nodeStates),
      results: new Map(state.results),
      errors: new Map(state.errors),
    };
  }

  /**
   * Get node result
   */
  getNodeResult(flowId: FlowId, nodeId: NodeId): any {
    const state = this.states.get(flowId);
    return state?.results.get(nodeId);
  }

  /**
   * Get node error
   */
  getNodeError(flowId: FlowId, nodeId: NodeId): Error | undefined {
    const state = this.states.get(flowId);
    return state?.errors.get(nodeId);
  }
}

