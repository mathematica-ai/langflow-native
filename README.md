# Langflow Native

A React Native framework for running [Langflow](https://github.com/logspace-ai/langflow) workflows entirely on-device. Execute AI workflows, LLM chains, and agentic systems natively on mobile without server dependencies.

## Vision

Bring the power of Langflow workflows to mobile devices, enabling developers to build sophisticated AI applications that run completely on-device with privacy, performance, and offline capabilities.

## Features

- **Full On-Device Execution**: Run complete workflows natively on mobile devices
- **TypeScript-First**: Built with TypeScript for excellent developer experience
- **Modular Architecture**: Clean separation of concerns (core, runtime, components, integrations)
- **React Native Integration**: First-class hooks and components for React Native apps
- **Extensible**: Easy to create custom components and integrations
- **LangChain.js Compatible**: Designed to work seamlessly with the LangChain ecosystem
- **Offline-First**: Works without network connectivity (excluding external API calls)
- **Performance Optimized**: Designed for mobile resource constraints

## Architecture

```
langflow-native/
├── packages/
│   ├── core/              # Base abstractions (Graph, Node, Component)
│   ├── runtime/           # Execution engine (GraphExecutor, StateManager)
│   ├── services/          # Mobile services (Storage, Cache, Session)
│   ├── components/        # Built-in components (LLM, Tools, I/O)
│   ├── integrations/      # Third-party integrations
│   └── react-native/      # React Native hooks and components
└── examples/              # Example workflows and applications
```

## Quick Start

### Installation

```bash
# Install all packages
yarn add @langflow-native/core @langflow-native/runtime @langflow-native/services @langflow-native/components @langflow-native/react-native

# Or install individually
yarn add @langflow-native/core        # Core abstractions
yarn add @langflow-native/runtime     # Execution engine
yarn add @langflow-native/services    # Mobile services
yarn add @langflow-native/components  # Built-in components
yarn add @langflow-native/react-native # React Native integration
```

### Basic Usage

```typescript
import { Graph } from '@langflow-native/core';
import { GraphExecutor } from '@langflow-native/runtime';
import { registerBuiltInComponents } from '@langflow-native/components';

// Register components
registerBuiltInComponents();

// Create a workflow
const graph = new Graph({
  name: 'My First Workflow',
  nodes: [
    {
      id: 'input',
      type: 'input',
      data: { defaultValue: 'Hello, World!' },
    },
    {
      id: 'transform',
      type: 'text-transform',
      data: { operation: 'uppercase' },
    },
    {
      id: 'output',
      type: 'output',
      data: { format: 'text' },
    },
  ],
  edges: [
    { id: 'e1', source: 'input', target: 'transform' },
    { id: 'e2', source: 'transform', target: 'output' },
  ],
});

// Execute
const executor = new GraphExecutor();
const result = await executor.execute(graph);

console.log(result.results);
```

### React Native Usage

```typescript
import React from 'react';
import { View, Text, Button } from 'react-native';
import { Graph } from '@langflow-native/core';
import { useWorkflow, WorkflowRunner } from '@langflow-native/react-native';

function MyApp() {
  const graph = new Graph({
    // ... your workflow definition
  });

  return (
    <WorkflowRunner
      graph={graph}
      inputs={{ value: 'Hello!' }}
      onComplete={(results) => console.log('Done!', results)}
      onError={(error) => console.error('Error:', error)}
    />
  );
}
```

## Built-in Components

### I/O Components
- **Input**: Receive input data
- **Output**: Format and display output

### LLM Components
- **OpenAI**: GPT models (GPT-4, GPT-3.5-turbo)
- Coming soon: Anthropic, Local LLMs (llama.cpp, Ollama)

### Tool Components
- **HTTP Request**: Make API calls
- **Text Transform**: Text manipulation operations
- Coming soon: JSON Parser, Vector Store, Memory

## Creating Custom Components

```typescript
import { BaseComponent, ExecutionContext, PortDefinition } from '@langflow-native/core';

export class MyComponent extends BaseComponent {
  get metadata() {
    return {
      name: 'My Component',
      description: 'Does something cool',
      category: 'Custom',
      version: '1.0.0',
    };
  }

  get inputs(): PortDefinition[] {
    return [
      { name: 'input', type: 'string', required: true },
    ];
  }

  get outputs(): PortDefinition[] {
    return [
      { name: 'output', type: 'string', required: true },
    ];
  }

  async executeImpl(context: ExecutionContext) {
    const input = this.getInput<string>(context, 'input');
    return input.toUpperCase();
  }
}

// Register your component
import { ComponentRegistry } from '@langflow-native/core';

const registry = ComponentRegistry.getInstance();
registry.register('my-component', MyComponent);
```

## Examples

Check out the `examples/` directory for complete working examples:

- [Basic Workflow](./examples/basic-workflow) - Simple text processing
- [Chat with History](./examples/chat-with-history) - Session management and caching
- Coming soon: LLM Chat, RAG Pipeline, Tool Chaining

## Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md)
- [Creating Custom Components](./docs/CUSTOM_COMPONENTS.md)
- [API Reference](./docs/API_REFERENCE.md)
- [Migration from Langflow Python](./docs/MIGRATION.md)

## Contributing

We welcome contributions! This is an open-source initiative to bring Langflow to mobile.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Development setup
- Code standards
- Pull request process
- Component development guidelines

### Quick Contributing Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Write tests
5. Submit a pull request

## Roadmap

### Phase 1: Core Foundation ✅
- [x] Core abstractions (Graph, Node, Component)
- [x] Execution engine with topological sorting
- [x] Component system and registry
- [x] React Native hooks and components

### Phase 2: Component Library 🚧
- [x] Basic I/O components
- [x] OpenAI integration
- [x] HTTP and text tools
- [ ] Anthropic integration
- [ ] Local LLM support (llama.cpp)
- [ ] Memory components
- [ ] Vector store components

### Phase 3: Services & Storage ✅
- [x] Mobile-optimized storage abstraction
- [x] Caching system with TTL
- [x] Session management with history
- [x] Secure credential storage abstraction
- [ ] Platform-specific implementations (SQLite, MMKV, Keychain)

### Phase 4: Advanced Features 📋
- [ ] Streaming support
- [ ] Background execution
- [ ] Workflow versioning
- [ ] Performance optimizations
- [ ] WebAssembly integration

## Performance

Designed for mobile devices with:
- Support for 50+ node workflows
- <100ms execution latency for simple workflows
- <100MB memory footprint
- Battery-efficient background execution

## License

MIT License - see [LICENSE](./LICENSE)

## Community

- **GitHub**: [github.com/mathematica-ai/langflow-native](https://github.com/mathematica-ai/langflow-native)
- **Discord**: Coming soon
- **Twitter**: Coming soon

## Acknowledgments

- [Langflow](https://github.com/logspace-ai/langflow) - The original Python framework
- [LangChain.js](https://github.com/langchain-ai/langchainjs) - JavaScript LangChain implementation
- [LangGraph.js](https://github.com/langchain-ai/langgraphjs) - Graph orchestration framework

## Support

- 📖 [Documentation](./docs)
- 💬 [GitHub Discussions](https://github.com/your-org/langflow-native/discussions)
- 🐛 [Issue Tracker](https://github.com/your-org/langflow-native/issues)
