/**
 * Text Transform component
 */

import {
  BaseComponent,
  ExecutionContext,
  PortDefinition,
  ComponentMetadata,
} from '@langflow-native/core';

export type TransformOperation =
  | 'uppercase'
  | 'lowercase'
  | 'trim'
  | 'replace'
  | 'split'
  | 'join'
  | 'template';

export interface TextTransformConfig {
  operation: TransformOperation;
  replaceFrom?: string;
  replaceTo?: string;
  splitDelimiter?: string;
  joinDelimiter?: string;
  template?: string;
}

/**
 * TextTransformComponent - transforms text data
 */
export class TextTransformComponent extends BaseComponent {
  private config: TextTransformConfig;

  constructor(config: TextTransformConfig) {
    super(config);
    this.config = config;
  }

  get metadata(): ComponentMetadata {
    return {
      name: 'Text Transform',
      description: 'Transform text data with various operations',
      category: 'Tools',
      version: '1.0.0',
      tags: ['text', 'transform', 'string'],
    };
  }

  get inputs(): PortDefinition[] {
    const baseInputs: PortDefinition[] = [
      {
        name: 'text',
        type: 'string',
        required: true,
        description: 'Input text to transform',
      },
    ];

    // Add operation-specific inputs
    if (this.config.operation === 'template') {
      baseInputs.push({
        name: 'variables',
        type: 'object',
        required: false,
        description: 'Variables for template substitution',
      });
    }

    return baseInputs;
  }

  get outputs(): PortDefinition[] {
    return [
      {
        name: 'result',
        type: this.config.operation === 'split' ? 'array' : 'string',
        required: true,
        description: 'Transformed text',
      },
    ];
  }

  async executeImpl(context: ExecutionContext): Promise<any> {
    const text = this.getInput<string>(context, 'text');

    switch (this.config.operation) {
      case 'uppercase':
        return text.toUpperCase();

      case 'lowercase':
        return text.toLowerCase();

      case 'trim':
        return text.trim();

      case 'replace':
        if (!this.config.replaceFrom) {
          throw new Error('replaceFrom is required for replace operation');
        }
        return text.replace(
          new RegExp(this.config.replaceFrom, 'g'),
          this.config.replaceTo || ''
        );

      case 'split':
        return text.split(this.config.splitDelimiter || ',');

      case 'join':
        if (!Array.isArray(text)) {
          throw new Error('Input must be an array for join operation');
        }
        return text.join(this.config.joinDelimiter || ',');

      case 'template':
        const variables = context.inputs.variables as Record<string, any> || {};
        return this.renderTemplate(this.config.template || text, variables);

      default:
        throw new Error(`Unknown operation: ${this.config.operation}`);
    }
  }

  private renderTemplate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return key in variables ? String(variables[key]) : match;
    });
  }
}

