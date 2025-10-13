/**
 * Base types for Langflow Native framework
 */

/**
 * Unique identifier type
 */
export type NodeId = string;
export type EdgeId = string;
export type FlowId = string;

/**
 * Execution status for nodes and graphs
 */
export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  ERROR = 'error',
  CANCELLED = 'cancelled',
}

/**
 * Node execution result
 */
export interface ExecutionResult {
  status: ExecutionStatus;
  data?: any;
  error?: Error;
  timestamp: number;
  duration?: number;
}

/**
 * Execution context provided to components during execution
 */
export interface ExecutionContext {
  flowId: FlowId;
  nodeId: NodeId;
  inputs: Record<string, any>;
  variables: Record<string, any>;
  metadata: Record<string, any>;
  signal?: AbortSignal;
}

/**
 * Component input/output port definition
 */
export interface PortDefinition {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: any;
}

/**
 * Base component metadata
 */
export interface ComponentMetadata {
  name: string;
  description?: string;
  category?: string;
  version?: string;
  author?: string;
  tags?: string[];
}

/**
 * Component execution options
 */
export interface ComponentOptions {
  timeout?: number;
  retries?: number;
  cache?: boolean;
}

