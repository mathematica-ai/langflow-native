/**
 * Output component - receives and displays workflow output
 */

import {
  BaseComponent,
  ExecutionContext,
  PortDefinition,
  ComponentMetadata,
} from '@langflow-native/core';

export interface OutputComponentConfig {
  format?: 'json' | 'text' | 'raw';
}

/**
 * OutputComponent - receives and formats output data
 */
export class OutputComponent extends BaseComponent {
  private config: OutputComponentConfig;

  constructor(config?: OutputComponentConfig) {
    super(config);
    this.config = config || { format: 'raw' };
  }

  get metadata(): ComponentMetadata {
    return {
      name: 'Output',
      description: 'Receives and formats output data from the workflow',
      category: 'I/O',
      version: '1.0.0',
      tags: ['output', 'io'],
    };
  }

  get inputs(): PortDefinition[] {
    return [
      {
        name: 'value',
        type: 'any',
        required: true,
        description: 'Value to output',
      },
    ];
  }

  get outputs(): PortDefinition[] {
    return [
      {
        name: 'formatted',
        type: 'string',
        required: true,
        description: 'Formatted output',
      },
    ];
  }

  async executeImpl(context: ExecutionContext): Promise<any> {
    const value = this.getInput(context, 'value');

    switch (this.config.format) {
      case 'json':
        return JSON.stringify(value, null, 2);
      case 'text':
        return String(value);
      case 'raw':
      default:
        return value;
    }
  }
}

