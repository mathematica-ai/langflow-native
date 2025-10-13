# Langflow Native Architecture

This document describes the architecture and design decisions behind Langflow Native.

## Overview

Langflow Native is designed as a modular, extensible framework for executing AI workflows on mobile devices. The architecture is inspired by LangChain.js and Langflow Python, adapted for mobile constraints.

## Design Principles

### 1. Modularity

The framework is split into focused packages:
- **@langflow-native/core**: Type definitions and base abstractions
- **@langflow-native/runtime**: Execution engine
- **@langflow-native/components**: Built-in components
- **@langflow-native/react-native**: Mobile UI integration

This allows developers to use only what they need.

### 2. Type Safety

TypeScript provides:
- Compile-time error detection
- Excellent IDE support
- Self-documenting code
- Safer refactoring

### 3. Mobile-First

Optimized for mobile constraints:
- Memory efficient data structures
- Cancellable operations
- Battery-conscious execution
- Offline-first design

### 4. Extensibility

Easy to extend:
- Plugin architecture for components
- Registry pattern for dynamic loading
- Clean interfaces for custom implementations

## Core Architecture

### Package Structure

```
langflow-native/
├── packages/
│   ├── core/
│   │   ├── types/              # TypeScript types
│   │   ├── graph/              # Graph data structure
│   │   └── component/          # Component system
│   │
│   ├── runtime/
│   │   ├── executor/           # Workflow execution
│   │   └── state/              # State management
│   │
│   ├── components/
│   │   ├── io/                 # Input/Output
│   │   ├── llm/                # Language models
│   │   ├── tools/              # Utility tools
│   │   └── memory/             # Memory systems
│   │
│   └── react-native/
│       ├── hooks/              # React hooks
│       └── components/         # UI components
```

## Core Package

### Graph

The `Graph` class represents a workflow:

```typescript
class Graph {
  id: FlowId
  name: string
  nodes: Map<NodeId, Node>
  edges: Map<EdgeId, Edge>
  variables: Map<string, any>
  
  addNode(node: Node): void
  removeNode(nodeId: NodeId): void
  addEdge(edge: Edge): void
  getIncomingEdges(nodeId: NodeId): Edge[]
  getOutgoingEdges(nodeId: NodeId): Edge[]
}
```

**Design Decisions:**
- Uses Maps for O(1) lookups
- Immutable operations return new instances
- JSON serializable for persistence

### Component System

Components are the building blocks of workflows:

```typescript
interface IComponent {
  metadata: ComponentMetadata
  inputs: PortDefinition[]
  outputs: PortDefinition[]
  
  execute(context: ExecutionContext): Promise<ExecutionResult>
  initialize?(): Promise<void>
  dispose?(): Promise<void>
}
```

**Design Decisions:**
- Interface-based for flexibility
- Async execution for non-blocking operations
- Optional lifecycle hooks
- BaseComponent abstract class provides common functionality

### Component Registry

Manages available component types:

```typescript
class ComponentRegistry {
  register(type: string, constructor: ComponentConstructor): void
  create(type: string, config: any): IComponent
  has(type: string): boolean
}
```

**Design Decisions:**
- Singleton pattern for global registry
- Factory pattern for component creation
- Lazy initialization

### Validation

Graph validation before execution:

```typescript
class GraphValidator {
  static validate(graph: Graph): ValidationResult
  static detectCycles(graph: Graph): NodeId[]
  static getTopologicalOrder(graph: Graph): NodeId[] | null
}
```

**Design Decisions:**
- Static methods (no state needed)
- Comprehensive validation (cycles, disconnected nodes, invalid edges)
- Topological sort for execution order

## Runtime Package

### GraphExecutor

Executes workflows with dependency resolution:

```typescript
class GraphExecutor {
  execute(
    graph: Graph,
    inputs?: Record<string, any>,
    options?: ExecutorOptions
  ): Promise<GraphExecutionState>
  
  cancel(): void
  on(listener: ExecutionListener): () => void
}
```

**Execution Algorithm:**

1. Validate graph structure
2. Compute topological order (dependency-based)
3. Initialize execution state
4. For each node in order:
   - Gather inputs from previous nodes
   - Create execution context
   - Execute component
   - Store results
   - Handle errors
5. Return final state

**Design Decisions:**
- Sequential execution by default (simpler, more predictable)
- Event-based progress tracking
- Cancellation support via AbortSignal
- Continue-on-error option for robustness

### StateManager

Manages execution state and history:

```typescript
class StateManager {
  saveState(state: GraphExecutionState): void
  getState(flowId: FlowId): GraphExecutionState | undefined
  getHistory(flowId: FlowId): StateSnapshot[]
  getSummary(flowId: FlowId): ExecutionSummary | null
}
```

**Design Decisions:**
- In-memory storage (fast access)
- Configurable history size (memory management)
- Snapshot pattern for time-travel debugging

## Component Package

### Component Categories

**I/O Components:**
- Input: Receives initial data
- Output: Formats and returns results

**LLM Components:**
- OpenAI: GPT-3.5/GPT-4 integration
- Anthropic: Claude integration (coming soon)
- Local LLM: On-device models (coming soon)

**Tool Components:**
- HTTP Request: API calls
- Text Transform: String operations
- JSON Parser: Data transformation

### Base LLM Component

```typescript
abstract class LLMComponent extends BaseComponent {
  protected abstract callLLM(messages: Message[]): Promise<Response>
  
  protected getRequestOptions(): RequestOptions
  protected buildMessages(prompt: string, history?: Message[]): Message[]
}
```

**Design Decisions:**
- Template method pattern
- Shared configuration handling
- Consistent API across providers

## React Native Package

### Hooks

**useWorkflow:**
- Manages workflow execution
- Provides loading/error states
- Returns results

**useWorkflowState:**
- Subscribes to state changes
- Provides execution summary
- Access to node results

### Components

**WorkflowRunner:**
- Complete execution UI
- Progress tracking
- Error display
- Result visualization

**Design Decisions:**
- Hooks for flexibility
- Components for quick setup
- Separate concerns (data vs UI)

## Data Flow

```
User Input
    ↓
Graph Definition
    ↓
GraphValidator → ValidationResult
    ↓
GraphExecutor
    ↓
Topological Sort
    ↓
For each Node:
    ↓
ComponentRegistry → Component Instance
    ↓
Component.execute(context)
    ↓
ExecutionResult
    ↓
StateManager → Store Results
    ↓
Final Results
```

## Error Handling

### Levels

1. **Component Level**: Try-catch in execute()
2. **Executor Level**: Catch execution errors
3. **Application Level**: User-facing error handling

### Strategy

- Errors don't crash the app
- Clear error messages
- Retry logic where appropriate
- Graceful degradation

## Performance Optimizations

### Memory Management

- Lazy component initialization
- Result cleanup after execution
- Bounded history size
- Weak references where appropriate

### Execution

- Sequential execution (predictable memory usage)
- Async/await (non-blocking)
- Cancellation support
- Timeout handling

### Mobile-Specific

- Respect battery constraints
- Handle background/foreground transitions
- Network-aware execution
- Cache API responses

## Security

### API Keys

- Never hardcode keys
- Use secure storage (Keychain/KeyStore)
- Support environment variables
- Prompt for missing keys

### Data Privacy

- On-device execution by default
- Clear data boundaries
- User consent for external calls
- Data encryption at rest

## Testing Strategy

### Unit Tests

- Individual component testing
- Mocked dependencies
- Edge case coverage
- >80% code coverage target

### Integration Tests

- Multi-component workflows
- Error scenarios
- State management
- Real component interactions

### E2E Tests

- Full workflow execution
- UI interactions
- Performance benchmarks
- Device-specific testing

## Future Considerations

### Streaming

Support streaming responses:
- AsyncIterator pattern
- Incremental UI updates
- Memory-efficient processing

### Parallel Execution

Execute independent branches in parallel:
- Identify independent subgraphs
- Worker-based execution
- Resource pooling

### Persistence

Save and restore workflows:
- SQLite storage
- JSON serialization
- Versioning support
- Migration tools

### WebAssembly

Use WASM for intensive operations:
- Embeddings generation
- Vector operations
- Model inference

## Comparison with Langflow Python

| Aspect | Langflow Python | Langflow Native |
|--------|----------------|-----------------|
| Language | Python | TypeScript |
| Runtime | FastAPI | React Native |
| Database | PostgreSQL | SQLite |
| Cache | Redis | MMKV |
| Execution | Async/Celery | Async/Promises |
| Components | Python classes | TS classes |
| UI | React (web) | React Native |

## Contributing

When contributing, consider:
- Package boundaries
- Type safety
- Mobile constraints
- Documentation
- Tests

See [CONTRIBUTING.md](../CONTRIBUTING.md) for details.

## References

- [Langflow Python](https://github.com/logspace-ai/langflow)
- [LangChain.js](https://github.com/langchain-ai/langchainjs)
- [LangGraph.js](https://github.com/langchain-ai/langgraphjs)
- [React Native](https://reactnative.dev)

