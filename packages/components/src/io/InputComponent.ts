/**
 * Input component - provides initial input to workflow
 */

import {
  BaseComponent,
  ExecutionContext,
  PortDefinition,
  ComponentMetadata,
} from '@langflow-native/core';

export interface InputComponentConfig {
  defaultValue?: any;
  type?: 'text' | 'number' | 'boolean' | 'object' | 'array';
  placeholder?: string;
}

/**
 * InputComponent - receives and passes through input data
 */
export class InputComponent extends BaseComponent {
  private config: InputComponentConfig;

  constructor(config?: InputComponentConfig) {
    super(config);
    this.config = config || {};
  }

  get metadata(): ComponentMetadata {
    return {
      name: 'Input',
      description: 'Receives input data and passes it to connected nodes',
      category: 'I/O',
      version: '1.0.0',
      tags: ['input', 'io'],
    };
  }

  get inputs(): PortDefinition[] {
    return [
      {
        name: 'value',
        type: this.config.type || 'text',
        required: false,
        description: 'Input value',
        defaultValue: this.config.defaultValue,
      },
    ];
  }

  get outputs(): PortDefinition[] {
    return [
      {
        name: 'output',
        type: this.config.type || 'text',
        required: true,
        description: 'Output value (same as input)',
      },
    ];
  }

  async executeImpl(context: ExecutionContext): Promise<any> {
    const value = this.getInput(context, 'value');
    return value;
  }
}

