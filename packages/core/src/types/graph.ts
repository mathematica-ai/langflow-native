/**
 * Graph structure types
 */

import { NodeId, EdgeId, FlowId, ExecutionStatus } from './base';

/**
 * Node definition in the graph
 */
export interface Node {
  id: NodeId;
  type: string;
  data: Record<string, any>;
  position?: { x: number; y: number };
  metadata?: Record<string, any>;
}

/**
 * Edge connecting two nodes
 */
export interface Edge {
  id: EdgeId;
  source: NodeId;
  target: NodeId;
  sourceHandle?: string;
  targetHandle?: string;
  data?: Record<string, any>;
}

/**
 * Complete graph/flow definition
 */
export interface Graph {
  id: FlowId;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  variables?: Record<string, any>;
  metadata?: Record<string, any>;
  version?: string;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Graph execution state
 */
export interface GraphExecutionState {
  flowId: FlowId;
  status: ExecutionStatus;
  startTime: number;
  endTime?: number;
  nodeStates: Map<NodeId, NodeExecutionState>;
  results: Map<NodeId, any>;
  errors: Map<NodeId, Error>;
}

/**
 * Individual node execution state
 */
export interface NodeExecutionState {
  nodeId: NodeId;
  status: ExecutionStatus;
  startTime?: number;
  endTime?: number;
  result?: any;
  error?: Error;
}

/**
 * Graph validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation error
 */
export interface ValidationError {
  nodeId?: NodeId;
  edgeId?: EdgeId;
  message: string;
  code: string;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  nodeId?: NodeId;
  edgeId?: EdgeId;
  message: string;
  code: string;
}

