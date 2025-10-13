# Contributing to Langflow Native

Thank you for your interest in contributing to Langflow Native! This guide will help you get started.

## Vision & Values

Langflow Native is built on the principles of **beauty and excellence**. We strive for:

- **Craftsmanship**: Every line of code should be deliberate and well-crafted
- **Clarity**: Code should be self-documenting and easy to understand
- **Performance**: Optimized for mobile devices and resource constraints
- **Extensibility**: Designed for the community to build upon
- **Reliability**: Thoroughly tested and production-ready

## Getting Started

### Prerequisites

- Node.js 18+ and Yarn 1.22+
- iOS development: Xcode 14+ (macOS only)
- Android development: Android Studio with SDK 33+
- Git

### Development Setup

1. **Fork and clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/langflow-native.git
cd langflow-native
```

2. **Install dependencies**

```bash
yarn install
```

3. **Build all packages**

```bash
yarn build
```

4. **Run tests**

```bash
yarn test
```

5. **Type check**

```bash
yarn typecheck
```

6. **Lint code**

```bash
yarn lint
```

## Project Structure

```
langflow-native/
├── packages/
│   ├── core/              # Core abstractions
│   ├── runtime/           # Execution engine
│   ├── components/        # Built-in components
│   ├── integrations/      # Third-party integrations
│   └── react-native/      # React Native integration
├── examples/              # Example applications
├── docs/                  # Documentation
└── .github/               # GitHub workflows and templates
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/my-feature
# or
git checkout -b fix/bug-description
# or
git checkout -b docs/documentation-improvement
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or modifications
- `perf/` - Performance improvements

### 2. Make Your Changes

#### Code Style

We use:
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for formatting

Run before committing:
```bash
yarn lint
yarn typecheck
```

#### Testing

All new features must include tests:
```bash
# Run tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run tests with coverage
yarn test --coverage
```

#### Commit Messages

We follow conventional commits:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test changes
- `perf`: Performance improvements
- `chore`: Build process or auxiliary tool changes

Examples:
```
feat(components): add Anthropic LLM component

Implements Claude integration with streaming support
Includes retry logic and error handling

Closes #123
```

```
fix(runtime): resolve race condition in graph executor

The executor could start nodes before dependencies completed.
Added proper dependency tracking and execution barriers.

Fixes #456
```

### 3. Submit a Pull Request

1. **Push your branch**

```bash
git push origin feature/my-feature
```

2. **Create a pull request** on GitHub

3. **Fill out the PR template** completely

4. **Request review** from maintainers

5. **Address feedback** and make requested changes

6. **Wait for approval** and merge

## Contributing Components

Components are the heart of Langflow Native. Here's how to contribute new ones:

### Component Structure

```typescript
import {
  BaseComponent,
  ExecutionContext,
  PortDefinition,
  ComponentMetadata,
} from '@langflow-native/core';

export interface MyComponentConfig {
  // Configuration options
}

export class MyComponent extends BaseComponent {
  private config: MyComponentConfig;

  constructor(config: MyComponentConfig) {
    super(config);
    this.config = config;
  }

  get metadata(): ComponentMetadata {
    return {
      name: 'My Component',
      description: 'What this component does',
      category: 'Category',
      version: '1.0.0',
      author: 'Your Name',
      tags: ['tag1', 'tag2'],
    };
  }

  get inputs(): PortDefinition[] {
    return [
      {
        name: 'input',
        type: 'string',
        required: true,
        description: 'Input description',
      },
    ];
  }

  get outputs(): PortDefinition[] {
    return [
      {
        name: 'output',
        type: 'string',
        required: true,
        description: 'Output description',
      },
    ];
  }

  async executeImpl(context: ExecutionContext): Promise<any> {
    const input = this.getInput<string>(context, 'input');
    
    // Your logic here
    
    return result;
  }

  // Optional: initialization
  async initialize(): Promise<void> {
    // Setup code
  }

  // Optional: cleanup
  async dispose(): Promise<void> {
    // Cleanup code
  }
}
```

### Component Guidelines

1. **Single Responsibility**: Each component should do one thing well
2. **Proper Error Handling**: Use try-catch and provide clear error messages
3. **Input Validation**: Validate all inputs before processing
4. **Documentation**: Document all configuration options and behaviors
5. **Tests**: Write comprehensive unit tests
6. **Performance**: Consider mobile resource constraints
7. **Cancellation**: Respect abort signals for long-running operations

### Component Checklist

- [ ] Extends `BaseComponent`
- [ ] Implements all required methods
- [ ] Includes comprehensive metadata
- [ ] Validates all inputs
- [ ] Handles errors gracefully
- [ ] Includes unit tests (>80% coverage)
- [ ] Includes integration tests
- [ ] Documented in code and README
- [ ] Example usage provided
- [ ] Performance tested on mobile devices

## Testing Guidelines

### Unit Tests

```typescript
import { MyComponent } from '../MyComponent';
import { ExecutionContext } from '@langflow-native/core';

describe('MyComponent', () => {
  it('should process input correctly', async () => {
    const component = new MyComponent({ /* config */ });
    
    const context: ExecutionContext = {
      flowId: 'test-flow',
      nodeId: 'test-node',
      inputs: { input: 'test' },
      variables: {},
      metadata: {},
    };
    
    const result = await component.execute(context);
    
    expect(result.status).toBe('success');
    expect(result.data).toBe('expected output');
  });

  it('should handle errors', async () => {
    // Test error scenarios
  });
});
```

### Integration Tests

Test component interactions and workflow execution.

### Performance Tests

Test on real devices with production-like data volumes.

## Documentation

### Code Documentation

- Use JSDoc comments for all public APIs
- Include examples in documentation
- Document edge cases and limitations

```typescript
/**
 * Transforms text using specified operation
 * 
 * @param text - Input text to transform
 * @param operation - Transformation to apply
 * @returns Transformed text
 * 
 * @example
 * ```typescript
 * const result = transform('hello', 'uppercase');
 * // Returns: 'HELLO'
 * ```
 */
```

### Documentation Files

When adding features, update:
- Package README
- API documentation
- Architecture docs (if applicable)
- Migration guides (if breaking changes)

## Code Review Process

### For Contributors

- Be responsive to feedback
- Be open to suggestions
- Ask questions if unclear
- Make requested changes promptly

### For Reviewers

- Be constructive and kind
- Explain reasoning for suggestions
- Approve when ready
- Celebrate good work

## Release Process

Maintainers handle releases:

1. Update version numbers
2. Update CHANGELOG.md
3. Create git tag
4. Publish to npm
5. Create GitHub release

## Community

### Communication

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and general discussion
- **Discord**: Coming soon
- **Twitter**: Coming soon

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Assume good intentions
- Focus on constructive feedback

## Recognition

Contributors are recognized:
- In release notes
- In the README contributors section
- In the project's AUTHORS file

Thank you for contributing to Langflow Native! Together, we're bringing AI workflows to mobile devices. 🚀

