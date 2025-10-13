/**
 * useWorkflow hook - execute and manage workflow state
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Graph, ExecutionStatus, GraphExecutionState } from '@langflow-native/core';
import { GraphExecutor, ExecutorOptions, ExecutionEvent } from '@langflow-native/runtime';

export interface UseWorkflowResult {
  execute: (inputs?: Record<string, any>) => Promise<void>;
  cancel: () => void;
  state: GraphExecutionState | null;
  isLoading: boolean;
  error: Error | null;
  results: Map<string, any>;
}

/**
 * Hook to execute and manage a workflow
 */
export function useWorkflow(
  graph: Graph | null,
  options?: ExecutorOptions
): UseWorkflowResult {
  const [state, setState] = useState<GraphExecutionState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [results, setResults] = useState<Map<string, any>>(new Map());

  const executorRef = useRef<GraphExecutor | null>(null);

  // Initialize executor
  useEffect(() => {
    if (!executorRef.current) {
      executorRef.current = new GraphExecutor();
    }
  }, []);

  // Setup event listeners
  useEffect(() => {
    const executor = executorRef.current;
    if (!executor) return;

    const handleEvent = (event: ExecutionEvent) => {
      switch (event.type) {
        case 'start':
          setIsLoading(true);
          setError(null);
          break;

        case 'node-complete':
          if (event.nodeId && event.data !== undefined) {
            setResults((prev) => new Map(prev).set(event.nodeId!, event.data));
          }
          break;

        case 'node-error':
          if (event.error) {
            setError(event.error);
          }
          break;

        case 'complete':
          setIsLoading(false);
          break;

        case 'error':
          setIsLoading(false);
          if (event.error) {
            setError(event.error);
          }
          break;
      }
    };

    const unsubscribe = executor.on(handleEvent);

    return () => {
      unsubscribe();
    };
  }, []);

  const execute = useCallback(
    async (inputs?: Record<string, any>) => {
      if (!graph) {
        const err = new Error('No graph provided');
        setError(err);
        throw err;
      }

      if (!executorRef.current) {
        const err = new Error('Executor not initialized');
        setError(err);
        throw err;
      }

      try {
        setError(null);
        setIsLoading(true);
        setResults(new Map());

        const executionState = await executorRef.current.execute(graph, inputs, options);

        setState(executionState);
        setResults(executionState.results);
        setIsLoading(false);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setIsLoading(false);
        throw error;
      }
    },
    [graph, options]
  );

  const cancel = useCallback(() => {
    if (executorRef.current) {
      executorRef.current.cancel();
    }
  }, []);

  return {
    execute,
    cancel,
    state,
    isLoading,
    error,
    results,
  };
}

