# Basic Workflow Example

This example demonstrates how to create and execute a simple workflow using Langflow Native.

## What it does

The example workflow:
1. Takes text input
2. Transforms it to uppercase
3. Outputs the result

## Running the example

```bash
# From the repository root
yarn install
yarn build

# Run the example
cd examples/basic-workflow
yarn start
```

## Code walkthrough

### 1. Register components

```typescript
import { registerBuiltInComponents } from '@langflow-native/components';

registerBuiltInComponents();
```

### 2. Create a workflow

```typescript
import { Graph } from '@langflow-native/core';

const graph = new Graph({
  name: 'Text Processing Workflow',
  nodes: [
    { id: 'input-1', type: 'input', data: {...} },
    { id: 'transform-1', type: 'text-transform', data: {...} },
    { id: 'output-1', type: 'output', data: {...} },
  ],
  edges: [
    { id: 'edge-1', source: 'input-1', target: 'transform-1' },
    { id: 'edge-2', source: 'transform-1', target: 'output-1' },
  ],
});
```

### 3. Execute the workflow

```typescript
import { GraphExecutor } from '@langflow-native/runtime';

const executor = new GraphExecutor();
const state = await executor.execute(graph, { value: 'hello world' });

console.log(state.results);
```

## Next steps

- Check out other examples in the `examples/` directory
- Read the [Architecture Guide](../../docs/ARCHITECTURE.md)
- Learn how to [create custom components](../../docs/CUSTOM_COMPONENTS.md)

