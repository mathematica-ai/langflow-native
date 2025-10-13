# Quick Start Guide

Get started with Langflow Native in 5 minutes.

## Prerequisites

- Node.js 18+ and Yarn
- React Native development environment (for mobile apps)
- Basic TypeScript knowledge

## Installation

### Option 1: For Node.js Projects

```bash
yarn add @langflow-native/core @langflow-native/runtime @langflow-native/components
```

### Option 2: For React Native Projects

```bash
yarn add @langflow-native/core @langflow-native/runtime @langflow-native/components @langflow-native/react-native
```

## Your First Workflow

### Step 1: Create a Simple Workflow

```typescript
import { Graph } from '@langflow-native/core';
import { GraphExecutor } from '@langflow-native/runtime';
import { registerBuiltInComponents } from '@langflow-native/components';

// Register components
registerBuiltInComponents();

// Create workflow
const graph = new Graph({
  name: 'Hello World',
  nodes: [
    {
      id: 'input',
      type: 'input',
      data: { defaultValue: 'World' },
    },
    {
      id: 'transform',
      type: 'text-transform',
      data: { operation: 'template', template: 'Hello, {{text}}!' },
    },
    {
      id: 'output',
      type: 'output',
      data: { format: 'text' },
    },
  ],
  edges: [
    { id: 'e1', source: 'input', target: 'transform', targetHandle: 'text' },
    { id: 'e2', source: 'transform', target: 'output', targetHandle: 'value' },
  ],
});

// Execute
const executor = new GraphExecutor();
const result = await executor.execute(graph);

console.log(result.results.get('output')); // "Hello, World!"
```

### Step 2: Add an LLM Component

```typescript
import { Graph } from '@langflow-native/core';

const graph = new Graph({
  name: 'LLM Chat',
  nodes: [
    {
      id: 'input',
      type: 'input',
      data: { type: 'text' },
    },
    {
      id: 'llm',
      type: 'openai',
      data: {
        model: 'gpt-3.5-turbo',
        apiKey: process.env.OPENAI_API_KEY,
        systemPrompt: 'You are a helpful assistant.',
      },
    },
    {
      id: 'output',
      type: 'output',
      data: {},
    },
  ],
  edges: [
    { id: 'e1', source: 'input', target: 'llm', targetHandle: 'prompt' },
    { id: 'e2', source: 'llm', target: 'output', sourceHandle: 'response', targetHandle: 'value' },
  ],
});

const executor = new GraphExecutor();
const result = await executor.execute(graph, {
  value: 'What is the capital of France?',
});

console.log(result.results.get('output'));
```

## React Native Usage

### Basic Setup

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { Graph } from '@langflow-native/core';
import { useWorkflow } from '@langflow-native/react-native';

function App() {
  const graph = new Graph({
    // ... your workflow
  });

  const { execute, isLoading, error, results } = useWorkflow(graph);

  const handleExecute = async () => {
    await execute({ value: 'Hello!' });
  };

  return (
    <View>
      <Button title="Execute" onPress={handleExecute} disabled={isLoading} />
      {isLoading && <Text>Loading...</Text>}
      {error && <Text>Error: {error.message}</Text>}
      {results.size > 0 && <Text>Result: {JSON.stringify(Array.from(results))}</Text>}
    </View>
  );
}
```

### Using WorkflowRunner Component

```typescript
import React from 'react';
import { View } from 'react-native';
import { Graph } from '@langflow-native/core';
import { WorkflowRunner } from '@langflow-native/react-native';
import { registerBuiltInComponents } from '@langflow-native/components';

registerBuiltInComponents();

function App() {
  const graph = new Graph({
    name: 'My Workflow',
    nodes: [
      // ... your nodes
    ],
    edges: [
      // ... your edges
    ],
  });

  return (
    <View style={{ flex: 1 }}>
      <WorkflowRunner
        graph={graph}
        inputs={{ value: 'Hello!' }}
        onComplete={(results) => {
          console.log('Workflow completed!', results);
        }}
        onError={(error) => {
          console.error('Workflow error:', error);
        }}
      />
    </View>
  );
}
```

## Common Patterns

### Pattern 1: Sequential Processing

```typescript
const graph = new Graph({
  name: 'Sequential',
  nodes: [
    { id: '1', type: 'input', data: {} },
    { id: '2', type: 'text-transform', data: { operation: 'uppercase' } },
    { id: '3', type: 'text-transform', data: { operation: 'trim' } },
    { id: '4', type: 'output', data: {} },
  ],
  edges: [
    { id: 'e1', source: '1', target: '2' },
    { id: 'e2', source: '2', target: '3' },
    { id: 'e3', source: '3', target: '4' },
  ],
});
```

### Pattern 2: Parallel Branches (Future)

```typescript
const graph = new Graph({
  name: 'Parallel',
  nodes: [
    { id: 'input', type: 'input', data: {} },
    { id: 'branch1', type: 'text-transform', data: { operation: 'uppercase' } },
    { id: 'branch2', type: 'text-transform', data: { operation: 'lowercase' } },
    { id: 'output1', type: 'output', data: {} },
    { id: 'output2', type: 'output', data: {} },
  ],
  edges: [
    { id: 'e1', source: 'input', target: 'branch1' },
    { id: 'e2', source: 'input', target: 'branch2' },
    { id: 'e3', source: 'branch1', target: 'output1' },
    { id: 'e4', source: 'branch2', target: 'output2' },
  ],
});
```

### Pattern 3: Conditional Logic (Coming Soon)

```typescript
const graph = new Graph({
  name: 'Conditional',
  nodes: [
    { id: 'input', type: 'input', data: {} },
    { id: 'condition', type: 'condition', data: { condition: 'value > 10' } },
    { id: 'if-true', type: 'output', data: {} },
    { id: 'if-false', type: 'output', data: {} },
  ],
  edges: [
    { id: 'e1', source: 'input', target: 'condition' },
    { id: 'e2', source: 'condition', target: 'if-true', sourceHandle: 'true' },
    { id: 'e3', source: 'condition', target: 'if-false', sourceHandle: 'false' },
  ],
});
```

## Environment Variables

For components that need API keys:

```bash
# .env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

```typescript
import { config } from 'dotenv';
config();

const graph = new Graph({
  nodes: [
    {
      id: 'llm',
      type: 'openai',
      data: {
        model: 'gpt-3.5-turbo',
        apiKey: process.env.OPENAI_API_KEY,
      },
    },
  ],
});
```

## Error Handling

```typescript
const executor = new GraphExecutor();

try {
  const result = await executor.execute(graph, inputs);
  
  // Check for node-level errors
  if (result.errors.size > 0) {
    result.errors.forEach((error, nodeId) => {
      console.error(`Node ${nodeId} failed:`, error.message);
    });
  }
  
  // Access results
  result.results.forEach((data, nodeId) => {
    console.log(`Node ${nodeId} result:`, data);
  });
} catch (error) {
  console.error('Workflow execution failed:', error);
}
```

## Execution Options

```typescript
const executor = new GraphExecutor();

const result = await executor.execute(graph, inputs, {
  timeout: 30000,           // 30 second timeout
  maxRetries: 3,            // Retry failed nodes 3 times
  continueOnError: true,    // Continue even if nodes fail
});
```

## Event Tracking

```typescript
const executor = new GraphExecutor();

executor.on((event) => {
  switch (event.type) {
    case 'start':
      console.log('Workflow started');
      break;
    case 'node-start':
      console.log(`Executing ${event.nodeId}`);
      break;
    case 'node-complete':
      console.log(`Completed ${event.nodeId}`);
      break;
    case 'node-error':
      console.error(`Error in ${event.nodeId}:`, event.error);
      break;
    case 'complete':
      console.log('Workflow completed');
      break;
  }
});

await executor.execute(graph);
```

## Next Steps

1. **Explore Examples**: Check out the `examples/` directory
2. **Create Custom Components**: See [Creating Custom Components](./CUSTOM_COMPONENTS.md)
3. **Read Architecture**: Understand the framework in [Architecture Guide](./ARCHITECTURE.md)
4. **Join Community**: Contribute to the project

## Troubleshooting

### Common Issues

**Issue**: Components not found
```
Solution: Make sure to call registerBuiltInComponents()
```

**Issue**: API key errors
```
Solution: Check environment variables and API key validity
```

**Issue**: Execution hangs
```
Solution: Check for cycles in the graph, use validation before execution
```

## Resources

- [Full Documentation](./README.md)
- [API Reference](./API_REFERENCE.md)
- [Examples](../examples/)
- [GitHub Issues](https://github.com/your-org/langflow-native/issues)

Happy building! 🚀

