/**
 * Graph execution engine
 */

import {
  Graph,
  GraphValidator,
  ComponentRegistry,
  NodeId,
  ExecutionStatus,
  GraphExecutionState,
  NodeExecutionState,
  ExecutionContext,
} from '@langflow-native/core';

export interface ExecutorOptions {
  maxRetries?: number;
  timeout?: number;
  continueOnError?: boolean;
  parallel?: boolean;
}

export interface ExecutionEvent {
  type: 'start' | 'node-start' | 'node-complete' | 'node-error' | 'complete' | 'error';
  nodeId?: NodeId;
  data?: any;
  error?: Error;
  timestamp: number;
}

export type ExecutionListener = (event: ExecutionEvent) => void;

/**
 * GraphExecutor - executes workflow graphs
 */
export class GraphExecutor {
  private registry: ComponentRegistry;
  private listeners: Set<ExecutionListener> = new Set();
  private abortController?: AbortController;

  constructor(registry?: ComponentRegistry) {
    this.registry = registry || ComponentRegistry.getInstance();
  }

  /**
   * Add execution event listener
   */
  on(listener: ExecutionListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Emit execution event
   */
  private emit(event: ExecutionEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in execution listener:', error);
      }
    });
  }

  /**
   * Execute a graph
   */
  async execute(
    graph: Graph,
    inputs?: Record<string, any>,
    options: ExecutorOptions = {}
  ): Promise<GraphExecutionState> {
    // Validate graph
    const validation = GraphValidator.validate(graph);
    if (!validation.valid) {
      throw new Error(
        `Graph validation failed: ${validation.errors.map((e) => e.message).join(', ')}`
      );
    }

    // Get execution order
    const executionOrder = GraphValidator.getTopologicalOrder(graph);
    if (!executionOrder) {
      throw new Error('Cannot execute graph with cycles');
    }

    // Initialize execution state
    const state: GraphExecutionState = {
      flowId: graph.id,
      status: ExecutionStatus.RUNNING,
      startTime: Date.now(),
      nodeStates: new Map(),
      results: new Map(),
      errors: new Map(),
    };

    // Initialize node states
    graph.nodes.forEach((node) => {
      state.nodeStates.set(node.id, {
        nodeId: node.id,
        status: ExecutionStatus.PENDING,
      });
    });

    // Setup abort controller
    this.abortController = new AbortController();

    // Emit start event
    this.emit({
      type: 'start',
      timestamp: Date.now(),
      data: { flowId: graph.id, nodeCount: graph.nodes.length },
    });

    try {
      // Execute nodes in topological order
      for (const nodeId of executionOrder) {
        // Check if aborted
        if (this.abortController.signal.aborted) {
          state.status = ExecutionStatus.CANCELLED;
          break;
        }

        // Skip if previous node failed and not continuing on error
        if (!options.continueOnError && state.status === ExecutionStatus.ERROR) {
          const nodeState = state.nodeStates.get(nodeId)!;
          nodeState.status = ExecutionStatus.CANCELLED;
          continue;
        }

        await this.executeNode(graph, nodeId, state, inputs, options);
      }

      // Set final status
      if (state.status !== ExecutionStatus.CANCELLED) {
        const hasErrors = Array.from(state.nodeStates.values()).some(
          (s) => s.status === ExecutionStatus.ERROR
        );
        state.status = hasErrors ? ExecutionStatus.ERROR : ExecutionStatus.SUCCESS;
      }

      state.endTime = Date.now();

      // Emit complete event
      this.emit({
        type: 'complete',
        timestamp: Date.now(),
        data: { status: state.status },
      });

      return state;
    } catch (error) {
      state.status = ExecutionStatus.ERROR;
      state.endTime = Date.now();

      this.emit({
        type: 'error',
        timestamp: Date.now(),
        error: error instanceof Error ? error : new Error(String(error)),
      });

      throw error;
    }
  }

  /**
   * Execute a single node
   */
  private async executeNode(
    graph: Graph,
    nodeId: NodeId,
    state: GraphExecutionState,
    globalInputs: Record<string, any> = {},
    options: ExecutorOptions
  ): Promise<void> {
    const node = graph.getNode(nodeId)!;
    const nodeState = state.nodeStates.get(nodeId)!;

    // Update node state to running
    nodeState.status = ExecutionStatus.RUNNING;
    nodeState.startTime = Date.now();

    this.emit({
      type: 'node-start',
      nodeId,
      timestamp: Date.now(),
    });

    try {
      // Create component instance
      const component = this.registry.create(node.type, node.data);

      // Gather inputs from connected nodes
      const inputs = this.gatherNodeInputs(graph, nodeId, state, globalInputs);

      // Create execution context
      const context: ExecutionContext = {
        flowId: graph.id,
        nodeId,
        inputs,
        variables: graph.variables,
        metadata: node.metadata || {},
        signal: this.abortController?.signal,
      };

      // Execute component
      const result = await component.execute(context);

      // Store result
      if (result.status === ExecutionStatus.SUCCESS) {
        state.results.set(nodeId, result.data);
        nodeState.status = ExecutionStatus.SUCCESS;
        nodeState.result = result.data;
      } else {
        state.errors.set(nodeId, result.error || new Error('Unknown error'));
        nodeState.status = ExecutionStatus.ERROR;
        nodeState.error = result.error;
        state.status = ExecutionStatus.ERROR;
      }

      nodeState.endTime = Date.now();

      this.emit({
        type: result.status === ExecutionStatus.SUCCESS ? 'node-complete' : 'node-error',
        nodeId,
        timestamp: Date.now(),
        data: result.data,
        error: result.error,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      state.errors.set(nodeId, err);
      nodeState.status = ExecutionStatus.ERROR;
      nodeState.error = err;
      nodeState.endTime = Date.now();
      state.status = ExecutionStatus.ERROR;

      this.emit({
        type: 'node-error',
        nodeId,
        timestamp: Date.now(),
        error: err,
      });

      if (!options.continueOnError) {
        throw err;
      }
    }
  }

  /**
   * Gather inputs for a node from its incoming edges
   */
  private gatherNodeInputs(
    graph: Graph,
    nodeId: NodeId,
    state: GraphExecutionState,
    globalInputs: Record<string, any>
  ): Record<string, any> {
    const inputs: Record<string, any> = { ...globalInputs };
    const incomingEdges = graph.getIncomingEdges(nodeId);

    for (const edge of incomingEdges) {
      const sourceResult = state.results.get(edge.source);
      if (sourceResult !== undefined) {
        const targetHandle = edge.targetHandle || 'input';
        inputs[targetHandle] = sourceResult;
      }
    }

    return inputs;
  }

  /**
   * Cancel execution
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }
}

