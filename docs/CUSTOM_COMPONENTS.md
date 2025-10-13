# Creating Custom Components

This guide walks you through creating custom components for Langflow Native.

## Overview

Components are the building blocks of Langflow workflows. They:
- Process inputs and produce outputs
- Can be chained together
- Are reusable across workflows
- Follow a standard interface

## Basic Component Structure

```typescript
import {
  BaseComponent,
  ExecutionContext,
  PortDefinition,
  ComponentMetadata,
} from '@langflow-native/core';

export class MyComponent extends BaseComponent {
  get metadata(): ComponentMetadata {
    return {
      name: 'My Component',
      description: 'What this component does',
      category: 'Custom',
      version: '1.0.0',
      author: 'Your Name',
      tags: ['custom', 'example'],
    };
  }

  get inputs(): PortDefinition[] {
    return [
      {
        name: 'input',
        type: 'string',
        required: true,
        description: 'The input value',
      },
    ];
  }

  get outputs(): PortDefinition[] {
    return [
      {
        name: 'output',
        type: 'string',
        required: true,
        description: 'The output value',
      },
    ];
  }

  async executeImpl(context: ExecutionContext): Promise<any> {
    const input = this.getInput<string>(context, 'input');
    
    // Your processing logic here
    const output = input.toUpperCase();
    
    return output;
  }
}
```

## Component Lifecycle

### 1. Construction

```typescript
constructor(config?: MyComponentConfig, options?: ComponentOptions) {
  super(config, options);
  this.config = config || {};
}
```

Configuration is passed when the component is created.

### 2. Initialization (Optional)

```typescript
async initialize(): Promise<void> {
  // Setup code (called once before first execution)
  // Example: Connect to database, load model, etc.
}
```

### 3. Execution

```typescript
async executeImpl(context: ExecutionContext): Promise<any> {
  // Main processing logic
  // Called each time the component runs
}
```

### 4. Disposal (Optional)

```typescript
async dispose(): Promise<void> {
  // Cleanup code (called when component is destroyed)
  // Example: Close connections, free resources
}
```

## Input/Output Handling

### Defining Inputs

```typescript
get inputs(): PortDefinition[] {
  return [
    {
      name: 'text',
      type: 'string',
      required: true,
      description: 'Text to process',
    },
    {
      name: 'count',
      type: 'number',
      required: false,
      description: 'Number of times to repeat',
      defaultValue: 1,
    },
  ];
}
```

### Getting Input Values

```typescript
async executeImpl(context: ExecutionContext): Promise<any> {
  // Get required input
  const text = this.getInput<string>(context, 'text');
  
  // Get optional input (falls back to default)
  const count = this.getInput<number>(context, 'count');
  
  // Manual access with fallback
  const value = context.inputs.optionalValue ?? 'default';
  
  return text.repeat(count);
}
```

### Defining Outputs

```typescript
get outputs(): PortDefinition[] {
  return [
    {
      name: 'result',
      type: 'string',
      required: true,
      description: 'Processed result',
    },
    {
      name: 'metadata',
      type: 'object',
      required: false,
      description: 'Processing metadata',
    },
  ];
}
```

### Returning Output

```typescript
async executeImpl(context: ExecutionContext): Promise<any> {
  // Single output
  return 'result';
  
  // Multiple outputs (return object matching output names)
  return {
    result: 'processed text',
    metadata: {
      timestamp: Date.now(),
      length: 14,
    },
  };
}
```

## Configuration

### Define Configuration Interface

```typescript
export interface MyComponentConfig {
  apiKey?: string;
  timeout?: number;
  retryCount?: number;
}

export class MyComponent extends BaseComponent {
  private config: MyComponentConfig;

  constructor(config?: MyComponentConfig) {
    super(config);
    this.config = {
      timeout: 5000,
      retryCount: 3,
      ...config,
    };
  }
}
```

### Using Configuration

```typescript
async executeImpl(context: ExecutionContext): Promise<any> {
  const timeout = this.config.timeout;
  const apiKey = this.config.apiKey;
  
  // Use configuration values
}
```

## Error Handling

### Basic Error Handling

```typescript
async executeImpl(context: ExecutionContext): Promise<any> {
  const input = this.getInput<string>(context, 'input');
  
  if (!input) {
    throw new Error('Input is required');
  }
  
  if (input.length > 1000) {
    throw new Error('Input too long (max 1000 characters)');
  }
  
  return processInput(input);
}
```

### Validation Method

```typescript
async validate(): Promise<boolean> {
  if (!this.config.apiKey) {
    throw new Error('API key is required');
  }
  
  return true;
}
```

## Advanced Examples

### HTTP Request Component

```typescript
export interface HttpConfig {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class HttpRequestComponent extends BaseComponent {
  private config: HttpConfig;

  constructor(config?: HttpConfig) {
    super(config);
    this.config = config || {};
  }

  get metadata(): ComponentMetadata {
    return {
      name: 'HTTP Request',
      description: 'Make HTTP requests',
      category: 'Tools',
      version: '1.0.0',
    };
  }

  get inputs(): PortDefinition[] {
    return [
      { name: 'url', type: 'string', required: true, description: 'Request URL' },
      { name: 'method', type: 'string', required: false, defaultValue: 'GET' },
      { name: 'body', type: 'any', required: false, description: 'Request body' },
    ];
  }

  get outputs(): PortDefinition[] {
    return [
      { name: 'response', type: 'any', required: true },
      { name: 'status', type: 'number', required: true },
    ];
  }

  async executeImpl(context: ExecutionContext): Promise<any> {
    const url = this.getInput<string>(context, 'url');
    const method = this.getInput<string>(context, 'method');
    const body = context.inputs.body;

    const fullUrl = this.config.baseUrl ? `${this.config.baseUrl}${url}` : url;

    const response = await fetch(fullUrl, {
      method,
      headers: this.config.headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: context.signal, // Support cancellation
    });

    const data = await response.json();

    return {
      response: data,
      status: response.status,
    };
  }
}
```

### Stateful Component

```typescript
export class CounterComponent extends BaseComponent {
  private count: number = 0;

  get metadata(): ComponentMetadata {
    return {
      name: 'Counter',
      description: 'Maintains a count across executions',
      category: 'Logic',
      version: '1.0.0',
    };
  }

  get inputs(): PortDefinition[] {
    return [
      { name: 'increment', type: 'number', required: false, defaultValue: 1 },
      { name: 'reset', type: 'boolean', required: false, defaultValue: false },
    ];
  }

  get outputs(): PortDefinition[] {
    return [
      { name: 'count', type: 'number', required: true },
    ];
  }

  async executeImpl(context: ExecutionContext): Promise<any> {
    const increment = this.getInput<number>(context, 'increment');
    const reset = this.getInput<boolean>(context, 'reset');

    if (reset) {
      this.count = 0;
    } else {
      this.count += increment;
    }

    return this.count;
  }
}
```

### Async/Stream Component

```typescript
export class StreamingComponent extends BaseComponent {
  get metadata(): ComponentMetadata {
    return {
      name: 'Streaming LLM',
      description: 'LLM with streaming support',
      category: 'LLM',
      version: '1.0.0',
    };
  }

  get inputs(): PortDefinition[] {
    return [
      { name: 'prompt', type: 'string', required: true },
      { name: 'onChunk', type: 'function', required: false },
    ];
  }

  get outputs(): PortDefinition[] {
    return [
      { name: 'fullResponse', type: 'string', required: true },
    ];
  }

  async executeImpl(context: ExecutionContext): Promise<any> {
    const prompt = this.getInput<string>(context, 'prompt');
    const onChunk = context.inputs.onChunk as ((chunk: string) => void) | undefined;

    let fullResponse = '';

    // Simulated streaming
    const chunks = prompt.split(' ');
    for (const chunk of chunks) {
      if (context.signal?.aborted) {
        throw new Error('Execution cancelled');
      }

      fullResponse += chunk + ' ';
      
      if (onChunk) {
        onChunk(chunk);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return fullResponse.trim();
  }
}
```

## Registration

### Register a Single Component

```typescript
import { ComponentRegistry } from '@langflow-native/core';
import { MyComponent } from './MyComponent';

const registry = ComponentRegistry.getInstance();
registry.register('my-component', MyComponent);
```

### Register Multiple Components

```typescript
export function registerMyComponents(registry?: ComponentRegistry): void {
  const reg = registry || ComponentRegistry.getInstance();

  reg.register('component-1', Component1);
  reg.register('component-2', Component2);
  reg.register('component-3', Component3);
}
```

## Testing

### Unit Test

```typescript
import { MyComponent } from '../MyComponent';
import { ExecutionContext, ExecutionStatus } from '@langflow-native/core';

describe('MyComponent', () => {
  let component: MyComponent;

  beforeEach(() => {
    component = new MyComponent({ /* config */ });
  });

  it('should process input correctly', async () => {
    const context: ExecutionContext = {
      flowId: 'test',
      nodeId: 'test-node',
      inputs: { input: 'hello' },
      variables: {},
      metadata: {},
    };

    const result = await component.execute(context);

    expect(result.status).toBe(ExecutionStatus.SUCCESS);
    expect(result.data).toBe('HELLO');
  });

  it('should handle errors', async () => {
    const context: ExecutionContext = {
      flowId: 'test',
      nodeId: 'test-node',
      inputs: {},
      variables: {},
      metadata: {},
    };

    const result = await component.execute(context);

    expect(result.status).toBe(ExecutionStatus.ERROR);
    expect(result.error).toBeDefined();
  });
});
```

## Best Practices

### 1. Single Responsibility
Each component should do one thing well.

### 2. Clear Naming
Use descriptive names for inputs, outputs, and the component itself.

### 3. Input Validation
Always validate inputs before processing.

### 4. Error Messages
Provide clear, actionable error messages.

### 5. Cancellation Support
Respect the abort signal for long-running operations:

```typescript
if (context.signal?.aborted) {
  throw new Error('Operation cancelled');
}
```

### 6. Resource Cleanup
Clean up resources in the `dispose()` method.

### 7. Documentation
Document configuration options and behavior.

### 8. Performance
Consider mobile device constraints:
- Avoid blocking operations
- Limit memory usage
- Optimize for battery life

## Publishing Components

### Create a Package

```json
{
  "name": "@your-org/langflow-components",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "@langflow-native/core": "^0.1.0"
  }
}
```

### Export Components

```typescript
// src/index.ts
export { MyComponent } from './MyComponent';
export { registerMyComponents } from './register';
```

### Usage

```typescript
import { registerMyComponents } from '@your-org/langflow-components';

registerMyComponents();
```

## Examples

See the `packages/components/src` directory for more examples of built-in components.

## Questions?

- Check the [Architecture Guide](./ARCHITECTURE.md)
- Join our [Discord](https://discord.gg/langflow-native) (coming soon)
- Open an [issue](https://github.com/your-org/langflow-native/issues)

