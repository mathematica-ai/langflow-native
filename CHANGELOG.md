# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-01-XX

### Added

#### Core Package (@langflow-native/core)
- Complete type system for workflows, nodes, edges, and components
- `Graph` class for workflow structure manipulation
- `GraphValidator` with cycle detection and topological sorting
- `BaseComponent` abstract class for component development
- `ComponentRegistry` for dynamic component registration
- Full TypeScript type safety

#### Runtime Package (@langflow-native/runtime)
- `GraphExecutor` with dependency-based execution
- Event-based execution tracking
- Cancellation support via AbortSignal
- `StateManager` for execution history
- Configurable execution options (timeout, retries, continue-on-error)

#### Components Package (@langflow-native/components)
- I/O Components:
  - `InputComponent` - Workflow input handling
  - `OutputComponent` - Workflow output formatting
- LLM Components:
  - `LLMComponent` - Abstract base for LLM integrations
  - `OpenAIComponent` - OpenAI GPT integration
- Tool Components:
  - `HttpRequestComponent` - HTTP API calls
  - `TextTransformComponent` - Text manipulation operations
- Component registration utilities

#### Services Package (@langflow-native/services)
- `StorageService` - Abstract file system operations
- `InMemoryStorageService` - In-memory implementation
- `CacheService` - In-memory caching with TTL and auto-cleanup
- `SessionService` - Conversation history and session management
- `SecureStorageService` - Abstract secure storage for credentials
- `InMemorySecureStorageService` - In-memory implementation
- Workflow and data persistence utilities

#### React Native Package (@langflow-native/react-native)
- `useWorkflow` hook for workflow execution
- `useWorkflowState` hook for state subscriptions
- `WorkflowRunner` component for complete workflow UI
- Event handling and state management

#### Documentation
- Comprehensive README with examples
- CONTRIBUTING guide with development setup
- ARCHITECTURE documentation
- CUSTOM_COMPONENTS development guide
- QUICK_START tutorial
- GitHub issue templates (bug, feature, component)
- Pull request template

#### Examples
- Basic workflow example with documentation
- Chat with history example demonstrating services
- Text processing workflow
- Session management and caching demonstrations

#### Development Infrastructure
- Monorepo setup with yarn workspaces
- TypeScript configuration
- ESLint and Prettier configuration
- Git ignore rules
- MIT License

### Design Decisions

- **TypeScript-first**: Type safety and excellent DX
- **Mobile-first**: Optimized for device constraints
- **Modular**: Clean package separation
- **Extensible**: Plugin architecture for components
- **LangChain.js compatible**: Follows established patterns

### Architecture

- Core abstractions in separate package
- Runtime execution engine independent of UI
- Component system with registry pattern
- React Native integration as optional layer
- Sequential execution with topological sorting

## [0.0.0] - Initial Concept

### Vision
Create a React Native framework for running Langflow workflows entirely on-device, bringing the power of AI workflow execution to mobile platforms.

---

## Version History

- **0.1.0** - Initial release with core functionality
- **0.0.0** - Project conception

## Upcoming

See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for the roadmap and future plans.

