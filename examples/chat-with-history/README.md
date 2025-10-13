# Chat with History Example

This example demonstrates how to use Langflow Native services to maintain conversation history across multiple workflow executions.

## What it does

The example shows:
1. Initializing all services (Storage, Cache, Session, SecureStorage)
2. Creating and managing a chat session
3. Adding messages to session history
4. Caching responses for performance
5. Storing and loading session data
6. Using secure storage for API keys

## Running the example

```bash
# From the repository root
yarn install
yarn build

# Run the example
cd examples/chat-with-history
yarn start
```

## Code walkthrough

### 1. Initialize Services

```typescript
import {
  SessionService,
  CacheService,
  InMemoryStorageService,
  InMemorySecureStorageService,
} from '@langflow-native/services';

const storage = new InMemoryStorageService();
const cache = new CacheService();
const sessions = new SessionService();
const secure = new InMemorySecureStorageService();

await storage.initialize();
await cache.initialize();
```

### 2. Create a Session

```typescript
const session = sessions.createSession('chat-flow', {
  username: 'demo-user',
});
```

### 3. Manage Conversation History

```typescript
// Add messages
sessions.addMessage(session.id, 'user', 'Hello!');
sessions.addMessage(session.id, 'assistant', 'Hi there!');

// Get context for workflow
const context = sessions.getContext(session.id);

// Execute with history
const result = await executor.execute(graph, {
  value: message,
  history: context?.messages || [],
});
```

### 4. Use Caching

```typescript
const cacheKey = CacheService.createKey('response', message);
let response = cache.get(cacheKey);

if (!response) {
  response = await executeWorkflow();
  cache.set(cacheKey, response);
}
```

### 5. Persist Session Data

```typescript
// Export and save
const sessionData = sessions.exportSession(session.id);
await storage.saveData(`session-${session.id}`, JSON.parse(sessionData));

// Load later
const loadedData = await storage.loadData(`session-${session.id}`);
const restoredSession = sessions.importSession(JSON.stringify(loadedData));
```

## Services Used

### SessionService
- Manages conversation sessions
- Maintains message history
- Stores session variables
- Limits history size automatically

### CacheService
- In-memory caching with TTL
- Automatic cleanup of expired entries
- Size-based eviction (LRU-like)
- Statistics tracking

### StorageService
- File system operations
- Workflow persistence
- Arbitrary data storage
- In-memory implementation for demo

### SecureStorageService
- Encrypted credential storage
- API key management
- In-memory implementation for demo
- Production apps should use Keychain/KeyStore

## Next Steps

- Integrate with a real LLM component
- Use platform-specific storage implementations
- Add conversation branching
- Implement session search

## Related Examples

- [Basic Workflow](../basic-workflow) - Simple workflow execution
- Future: RAG with Memory - Retrieval with conversation context

