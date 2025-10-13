# @langflow-native/services

Mobile-adapted services for Langflow Native workflows.

## Overview

This package provides essential services for mobile workflow execution:

- **StorageService**: File system operations for workflows and data
- **CacheService**: In-memory caching with TTL support
- **SessionService**: Conversation history and session management
- **SecureStorageService**: Encrypted storage for API keys and credentials

## Installation

```bash
yarn add @langflow-native/services
```

## Services

### StorageService

Manages file system operations with platform-specific implementations.

```typescript
import { InMemoryStorageService } from '@langflow-native/services';

const storage = new InMemoryStorageService();
await storage.initialize();

// Save workflow
await storage.saveWorkflow('flow-1', workflowData);

// Load workflow
const workflow = await storage.loadWorkflow('flow-1');

// List all workflows
const workflows = await storage.listWorkflows();
```

### CacheService

In-memory caching with automatic cleanup and size limits.

```typescript
import { CacheService } from '@langflow-native/services';

const cache = new CacheService({
  maxSize: 1000,
  ttl: 5 * 60 * 1000, // 5 minutes
});

await cache.initialize();

// Set value
cache.set('key', 'value', 60000); // Custom TTL

// Get value
const value = cache.get('key');

// Check existence
if (cache.has('key')) {
  // ...
}

// Get stats
const stats = cache.getStats();
```

### SessionService

Manages conversation sessions and message history.

```typescript
import { SessionService } from '@langflow-native/services';

const sessions = new SessionService({
  maxHistorySize: 100,
});

// Create session
const session = sessions.createSession('flow-1');

// Add messages
sessions.addMessage(session.id, 'user', 'Hello!');
sessions.addMessage(session.id, 'assistant', 'Hi there!');

// Get messages
const messages = sessions.getMessages(session.id);

// Set variables
sessions.setVariable(session.id, 'username', 'John');

// Get context for workflow
const context = sessions.getContext(session.id);
```

### SecureStorageService

Encrypted storage for sensitive data (API keys, credentials).

```typescript
import { InMemorySecureStorageService } from '@langflow-native/services';

const secure = new InMemorySecureStorageService();

// Store API key
await secure.setApiKey('openai', 'sk-...');

// Get API key
const apiKey = await secure.getApiKey('openai');

// Store credentials
await secure.setCredentials('service', {
  username: 'user',
  password: 'pass',
});

// Get credentials
const creds = await secure.getCredentials('service');
```

## Platform-Specific Implementations

### React Native

For production React Native apps, use platform-specific implementations:

```typescript
// iOS: Uses Keychain
// Android: Uses KeyStore
import { SecureStorage } from 'react-native-secure-storage';
import { MMKV } from 'react-native-mmkv';
import RNFS from 'react-native-fs';

// Implement custom StorageService using RNFS
class RNStorageService extends StorageService {
  async writeFile(path: string, data: string): Promise<void> {
    await RNFS.writeFile(path, data, 'utf8');
  }
  // ... implement other methods
}

// Implement custom SecureStorageService
class RNSecureStorageService extends SecureStorageService {
  async setItem(key: string, value: string): Promise<void> {
    await SecureStorage.setItem(key, value);
  }
  // ... implement other methods
}
```

## Usage with Workflows

### Caching Component Results

```typescript
import { CacheService } from '@langflow-native/services';
import { GraphExecutor } from '@langflow-native/runtime';

const cache = new CacheService();
const executor = new GraphExecutor();

// Cache results
executor.on((event) => {
  if (event.type === 'node-complete') {
    const key = CacheService.createKey(event.nodeId, event.data);
    cache.set(key, event.data);
  }
});
```

### Session-Based Workflows

```typescript
import { SessionService } from '@langflow-native/services';
import { GraphExecutor } from '@langflow-native/runtime';

const sessions = new SessionService();
const session = sessions.createSession('chat-flow');

// Execute with session context
const context = sessions.getContext(session.id);
const result = await executor.execute(graph, {
  messages: context?.messages || [],
  variables: context?.variables || {},
});

// Store result
sessions.addMessage(session.id, 'assistant', result.response);
```

### Secure API Key Management

```typescript
import { SecureStorageService } from '@langflow-native/services';
import { OpenAIComponent } from '@langflow-native/components';

const secure = new SecureStorageService();

// Get API key from secure storage
const apiKey = await secure.getApiKey('openai');

// Use in component
const llm = new OpenAIComponent({
  model: 'gpt-3.5-turbo',
  apiKey,
});
```

## Testing

All services include in-memory implementations for testing:

- `InMemoryStorageService`
- `CacheService` (already in-memory)
- `SessionService` (already in-memory)
- `InMemorySecureStorageService`

```typescript
import {
  InMemoryStorageService,
  CacheService,
  SessionService,
  InMemorySecureStorageService,
} from '@langflow-native/services';

// Use in tests
const storage = new InMemoryStorageService();
const cache = new CacheService();
const sessions = new SessionService();
const secure = new InMemorySecureStorageService();
```

## API Reference

See [API documentation](../../docs/API_REFERENCE.md) for detailed API reference.

## License

MIT

