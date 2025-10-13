/**
 * WorkflowRunner component - UI for executing workflows
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Graph } from '@langflow-native/core';
import { useWorkflow } from '../hooks/useWorkflow';
import { ExecutorOptions } from '@langflow-native/runtime';

export interface WorkflowRunnerProps {
  graph: Graph;
  inputs?: Record<string, any>;
  options?: ExecutorOptions;
  onComplete?: (results: Map<string, any>) => void;
  onError?: (error: Error) => void;
  children?: React.ReactNode;
}

/**
 * WorkflowRunner - Execute workflows with UI controls
 */
export const WorkflowRunner: React.FC<WorkflowRunnerProps> = ({
  graph,
  inputs,
  options,
  onComplete,
  onError,
  children,
}) => {
  const { execute, cancel, isLoading, error, results, state } = useWorkflow(graph, options);
  const [hasExecuted, setHasExecuted] = useState(false);

  const handleExecute = async () => {
    try {
      setHasExecuted(true);
      await execute(inputs);
      onComplete?.(results);
    } catch (err) {
      onError?.(err as Error);
    }
  };

  const handleCancel = () => {
    cancel();
  };

  return (
    <View style={styles.container}>
      {children}

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, styles.executeButton, isLoading && styles.buttonDisabled]}
          onPress={handleExecute}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {hasExecuted ? 'Execute Again' : 'Execute Workflow'}
            </Text>
          )}
        </TouchableOpacity>

        {isLoading && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error:</Text>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      )}

      {state && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>Status:</Text>
          <Text style={styles.statusText}>{state.status}</Text>

          {state.endTime && (
            <Text style={styles.statusText}>
              Duration: {state.endTime - state.startTime}ms
            </Text>
          )}

          <Text style={styles.statusText}>
            Nodes: {state.nodeStates.size} | Results: {results.size}
          </Text>
        </View>
      )}

      {results.size > 0 && (
        <ScrollView style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Results:</Text>
          {Array.from(results.entries()).map(([nodeId, result]) => (
            <View key={nodeId} style={styles.resultItem}>
              <Text style={styles.resultNodeId}>{nodeId}:</Text>
              <Text style={styles.resultData}>{JSON.stringify(result, null, 2)}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  executeButton: {
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FFE6E6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D32F2F',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#C62828',
  },
  statusContainer: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  resultItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resultNodeId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  resultData: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
  },
});

