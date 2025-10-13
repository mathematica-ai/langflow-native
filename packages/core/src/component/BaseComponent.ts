/**
 * Base component implementation
 */

import {
  IComponent,
  ExecutionContext,
  ExecutionResult,
  PortDefinition,
  ComponentMetadata,
  ComponentOptions,
  ExecutionStatus,
} from '../types';

/**
 * Abstract base class for all components
 * Provides common functionality and enforces interface implementation
 */
export abstract class BaseComponent implements IComponent {
  protected config: any;
  protected options: ComponentOptions;
  protected initialized: boolean = false;

  constructor(config?: any, options?: ComponentOptions) {
    this.config = config || {};
    this.options = options || {};
  }

  abstract get metadata(): ComponentMetadata;
  abstract get inputs(): PortDefinition[];
  abstract get outputs(): PortDefinition[];

  /**
   * Main execution method - must be implemented by subclasses
   */
  abstract executeImpl(context: ExecutionContext): Promise<any>;

  /**
   * Execute with error handling and timing
   */
  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      // Initialize if needed
      if (!this.initialized && this.initialize) {
        await this.initialize();
        this.initialized = true;
      }

      // Validate inputs
      this.validateInputs(context.inputs);

      // Execute with timeout if specified
      let result;
      if (this.options.timeout) {
        result = await this.executeWithTimeout(context, this.options.timeout);
      } else {
        result = await this.executeImpl(context);
      }

      const duration = Date.now() - startTime;

      return {
        status: ExecutionStatus.SUCCESS,
        data: result,
        timestamp: Date.now(),
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        status: ExecutionStatus.ERROR,
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp: Date.now(),
        duration,
      };
    }
  }

  /**
   * Execute with timeout support
   */
  private async executeWithTimeout(
    context: ExecutionContext,
    timeout: number
  ): Promise<any> {
    return Promise.race([
      this.executeImpl(context),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Execution timeout after ${timeout}ms`)), timeout)
      ),
    ]);
  }

  /**
   * Validate that all required inputs are provided
   */
  protected validateInputs(inputs: Record<string, any>): void {
    const requiredInputs = this.inputs.filter((input) => input.required);

    for (const input of requiredInputs) {
      if (!(input.name in inputs) || inputs[input.name] === undefined) {
        throw new Error(`Required input '${input.name}' is missing`);
      }
    }
  }

  /**
   * Get input value with fallback to default
   */
  protected getInput<T = any>(context: ExecutionContext, name: string): T {
    const value = context.inputs[name];
    if (value !== undefined) {
      return value as T;
    }

    const inputDef = this.inputs.find((i) => i.name === name);
    if (inputDef?.defaultValue !== undefined) {
      return inputDef.defaultValue as T;
    }

    throw new Error(`Input '${name}' not found and no default value available`);
  }

  /**
   * Optional initialization hook
   */
  async initialize?(): Promise<void>;

  /**
   * Optional validation hook
   */
  async validate?(): Promise<boolean>;

  /**
   * Optional cleanup hook
   */
  async dispose?(): Promise<void>;
}

