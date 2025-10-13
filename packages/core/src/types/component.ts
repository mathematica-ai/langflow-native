/**
 * Component system types
 */

import { ExecutionContext, ExecutionResult, PortDefinition, ComponentMetadata, ComponentOptions } from './base';

/**
 * Base component interface that all components must implement
 */
export interface IComponent {
  readonly metadata: ComponentMetadata;
  readonly inputs: PortDefinition[];
  readonly outputs: PortDefinition[];
  
  /**
   * Execute the component with given context
   */
  execute(context: ExecutionContext): Promise<ExecutionResult>;
  
  /**
   * Validate component configuration
   */
  validate?(): Promise<boolean>;
  
  /**
   * Initialize component (called once before first execution)
   */
  initialize?(): Promise<void>;
  
  /**
   * Cleanup resources (called when component is destroyed)
   */
  dispose?(): Promise<void>;
}

/**
 * Component constructor type
 */
export type ComponentConstructor = new (config?: any, options?: ComponentOptions) => IComponent;

/**
 * Component registration info
 */
export interface ComponentRegistration {
  type: string;
  constructor: ComponentConstructor;
  metadata: ComponentMetadata;
}

/**
 * Component factory function
 */
export type ComponentFactory = (config?: any, options?: ComponentOptions) => IComponent;

