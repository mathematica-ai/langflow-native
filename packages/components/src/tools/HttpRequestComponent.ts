/**
 * HTTP Request component
 */

import {
  BaseComponent,
  ExecutionContext,
  PortDefinition,
  ComponentMetadata,
} from '@langflow-native/core';

export interface HttpRequestConfig {
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * HttpRequestComponent - makes HTTP requests
 */
export class HttpRequestComponent extends BaseComponent {
  private config: HttpRequestConfig;

  constructor(config?: HttpRequestConfig) {
    super(config);
    this.config = config || { method: 'GET' };
  }

  get metadata(): ComponentMetadata {
    return {
      name: 'HTTP Request',
      description: 'Make HTTP requests to external APIs',
      category: 'Tools',
      version: '1.0.0',
      tags: ['http', 'api', 'request'],
    };
  }

  get inputs(): PortDefinition[] {
    return [
      {
        name: 'url',
        type: 'string',
        required: !this.config.url,
        description: 'Request URL',
        defaultValue: this.config.url,
      },
      {
        name: 'method',
        type: 'string',
        required: false,
        description: 'HTTP method',
        defaultValue: this.config.method || 'GET',
      },
      {
        name: 'body',
        type: 'any',
        required: false,
        description: 'Request body (for POST, PUT, PATCH)',
      },
      {
        name: 'headers',
        type: 'object',
        required: false,
        description: 'Additional headers',
        defaultValue: this.config.headers,
      },
    ];
  }

  get outputs(): PortDefinition[] {
    return [
      {
        name: 'response',
        type: 'any',
        required: true,
        description: 'Response data',
      },
      {
        name: 'status',
        type: 'number',
        required: true,
        description: 'HTTP status code',
      },
    ];
  }

  async executeImpl(context: ExecutionContext): Promise<any> {
    const url = this.getInput<string>(context, 'url');
    const method = (context.inputs.method || this.config.method || 'GET') as string;
    const body = context.inputs.body;
    const headers = {
      ...(this.config.headers || {}),
      ...(context.inputs.headers || {}),
    };

    const options: RequestInit = {
      method: method.toUpperCase(),
      headers,
    };

    // Add body for methods that support it
    if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      if (typeof body === 'object') {
        options.body = JSON.stringify(body);
        if (!headers['Content-Type']) {
          headers['Content-Type'] = 'application/json';
        }
      } else {
        options.body = String(body);
      }
    }

    // Add timeout if configured
    if (this.config.timeout) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
      options.signal = controller.signal;

      try {
        const response = await fetch(url, options);
        clearTimeout(timeoutId);

        const responseData = await this.parseResponse(response);

        return {
          response: responseData,
          status: response.status,
        };
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } else {
      const response = await fetch(url, options);
      const responseData = await this.parseResponse(response);

      return {
        response: responseData,
        status: response.status,
      };
    }
  }

  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return response.json();
    } else if (contentType?.includes('text/')) {
      return response.text();
    } else {
      return response.blob();
    }
  }
}

