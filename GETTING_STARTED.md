# Getting Started with Langflow Native Development

Welcome to Langflow Native! This guide will help you set up your development environment and start contributing.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **Yarn 1.22+** installed (`npm install -g yarn`)
- **Git** installed
- A code editor (VS Code recommended)
- For mobile development:
  - **iOS**: macOS with Xcode 14+
  - **Android**: Android Studio with SDK 33+

## Quick Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/langflow-native.git
cd langflow-native
```

### 2. Install Dependencies

```bash
yarn install
```

This will install all dependencies for all packages in the monorepo.

### 3. Build All Packages

```bash
yarn build
```

This compiles all TypeScript packages.

### 4. Verify Installation

Run the basic example:

```bash
cd examples/basic-workflow
yarn start
```

You should see:
```
=== Langflow Native - Basic Workflow Example ===

1. Registering components...
   ✓ Components registered

2. Creating workflow...
   ✓ Workflow created

3. Executing workflow...
   → Execution started
   → Executing node: input-1
   ✓ Node complete: input-1
   → Executing node: transform-1
   ✓ Node complete: transform-1
   → Executing node: output-1
   ✓ Node complete: output-1
   ✓ Execution complete

4. Results:
   Status: success
   Duration: XXms
   Nodes executed: 3

   Output:
   input-1: "hello world"
   transform-1: "HELLO WORLD"
   output-1: "HELLO WORLD"

✓ Example completed successfully!
```

## Project Structure

```
langflow-native/
├── packages/               # Core packages
│   ├── core/              # Base abstractions
│   ├── runtime/           # Execution engine
│   ├── components/        # Built-in components
│   └── react-native/      # Mobile integration
├── examples/              # Example applications
├── docs/                  # Documentation
└── .github/              # GitHub templates
```

## Development Workflow

### Working on a Package

1. **Navigate to the package**:
```bash
cd packages/core
# or
cd packages/runtime
# or
cd packages/components
```

2. **Make your changes** to the TypeScript files in `src/`

3. **Build the package**:
```bash
yarn build
```

4. **Run tests** (when implemented):
```bash
yarn test
```

5. **Type check**:
```bash
yarn typecheck
```

6. **Lint code**:
```bash
yarn lint
```

### Creating a New Component

1. **Create component file**:
```bash
cd packages/components/src/tools
touch MyNewComponent.ts
```

2. **Implement component**:
```typescript
import {
  BaseComponent,
  ExecutionContext,
  PortDefinition,
  ComponentMetadata,
} from '@langflow-native/core';

export class MyNewComponent extends BaseComponent {
  get metadata(): ComponentMetadata {
    return {
      name: 'My New Component',
      description: 'Does something awesome',
      category: 'Tools',
      version: '1.0.0',
    };
  }

  get inputs(): PortDefinition[] {
    return [
      {
        name: 'input',
        type: 'string',
        required: true,
        description: 'Input value',
      },
    ];
  }

  get outputs(): PortDefinition[] {
    return [
      {
        name: 'output',
        type: 'string',
        required: true,
        description: 'Output value',
      },
    ];
  }

  async executeImpl(context: ExecutionContext): Promise<any> {
    const input = this.getInput<string>(context, 'input');
    // Your logic here
    return processInput(input);
  }
}
```

3. **Export from index**:
```typescript
// packages/components/src/tools/index.ts
export { MyNewComponent } from './MyNewComponent';
```

4. **Register component**:
```typescript
// packages/components/src/index.ts
import { MyNewComponent } from './tools/MyNewComponent';

export function registerBuiltInComponents(registry?: ComponentRegistry): void {
  const reg = registry || ComponentRegistry.getInstance();
  
  // ... existing registrations
  reg.register('my-new-component', MyNewComponent);
}
```

5. **Build and test**:
```bash
cd packages/components
yarn build
```

### Creating an Example

1. **Create example directory**:
```bash
mkdir -p examples/my-example/src
cd examples/my-example
```

2. **Create package.json**:
```json
{
  "name": "my-example",
  "version": "0.1.0",
  "scripts": {
    "start": "ts-node src/index.ts"
  },
  "dependencies": {
    "@langflow-native/core": "^0.1.0",
    "@langflow-native/runtime": "^0.1.0",
    "@langflow-native/components": "^0.1.0"
  }
}
```

3. **Create example code**:
```typescript
// src/index.ts
import { Graph } from '@langflow-native/core';
import { GraphExecutor } from '@langflow-native/runtime';
import { registerBuiltInComponents } from '@langflow-native/components';

async function main() {
  registerBuiltInComponents();
  
  const graph = new Graph({
    // Your workflow
  });
  
  const executor = new GraphExecutor();
  const result = await executor.execute(graph);
  
  console.log(result);
}

main();
```

4. **Run example**:
```bash
yarn install
yarn start
```

## Common Commands

From repository root:

```bash
# Install all dependencies
yarn install

# Build all packages
yarn build

# Run all tests
yarn test

# Type check all packages
yarn typecheck

# Lint all packages
yarn lint

# Clean all build artifacts
yarn clean
```

From individual package:

```bash
# Build this package only
yarn build

# Test this package only
yarn test

# Type check this package
yarn typecheck

# Lint this package
yarn lint
```

## Development Tips

### 1. Use TypeScript Strict Mode

All packages use strict TypeScript settings. Fix type errors before committing.

### 2. Watch Mode

For active development, use watch mode:
```bash
cd packages/core
yarn build --watch
```

### 3. Link Packages Locally

Yarn workspaces automatically links packages. Changes in one package are immediately available to others after building.

### 4. IDE Setup

**VS Code Extensions:**
- ESLint
- Prettier
- TypeScript and JavaScript Language Features

**VS Code Settings:**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### 5. Debugging

**Node.js debugging:**
```bash
node --inspect-brk node_modules/.bin/ts-node src/index.ts
```

**VS Code launch.json:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Example",
      "program": "${workspaceFolder}/examples/basic-workflow/src/index.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/examples/basic-workflow/dist/**/*.js"]
    }
  ]
}
```

## Testing

### Unit Tests (Coming Soon)

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run tests with coverage
yarn test --coverage
```

### Manual Testing

Create a test workflow and execute it:

```typescript
import { Graph } from '@langflow-native/core';
import { GraphExecutor } from '@langflow-native/runtime';
import { registerBuiltInComponents } from '@langflow-native/components';

registerBuiltInComponents();

const graph = new Graph({
  name: 'Test Workflow',
  nodes: [
    { id: '1', type: 'input', data: {} },
    { id: '2', type: 'text-transform', data: { operation: 'uppercase' } },
    { id: '3', type: 'output', data: {} },
  ],
  edges: [
    { id: 'e1', source: '1', target: '2' },
    { id: 'e2', source: '2', target: '3' },
  ],
});

const executor = new GraphExecutor();
const result = await executor.execute(graph, { value: 'test' });

console.log(result);
```

## Troubleshooting

### Issue: TypeScript errors after pulling changes

**Solution:**
```bash
yarn clean
yarn install
yarn build
```

### Issue: Package not found

**Solution:**
```bash
yarn install
```

### Issue: Build errors

**Solution:**
1. Check TypeScript version: `tsc --version` (should be 5.x)
2. Clean and rebuild: `yarn clean && yarn build`
3. Check for syntax errors in your code

### Issue: Examples not running

**Solution:**
1. Ensure packages are built: `yarn build`
2. Check example dependencies are installed: `cd examples/basic-workflow && yarn install`

## Git Workflow

### 1. Create a branch

```bash
git checkout -b feature/my-feature
# or
git checkout -b fix/bug-fix
```

### 2. Make changes and commit

```bash
git add .
git commit -m "feat(components): add new component

Description of changes
"
```

Use conventional commits:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

### 3. Push and create PR

```bash
git push origin feature/my-feature
```

Then create a pull request on GitHub.

## Resources

- **Documentation**: [`docs/`](./docs/)
- **Examples**: [`examples/`](./examples/)
- **Architecture**: [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **Component Guide**: [CUSTOM_COMPONENTS.md](./docs/CUSTOM_COMPONENTS.md)
- **Contributing**: [CONTRIBUTING.md](./CONTRIBUTING.md)

## Getting Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/your-org/langflow-native/issues)
- **GitHub Discussions**: [Ask questions](https://github.com/your-org/langflow-native/discussions)
- **Documentation**: Check the `docs/` directory

## Next Steps

1. ✅ Set up development environment
2. 📖 Read [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
3. 🔨 Try creating a custom component
4. 🚀 Build your first workflow
5. 🤝 Make your first contribution

Welcome to the Langflow Native community! 🎉

