/**
 * Chat with History Example
 * 
 * This example demonstrates how to use SessionService to maintain
 * conversation history across multiple workflow executions.
 */

import { Graph } from '@langflow-native/core';
import { GraphExecutor } from '@langflow-native/runtime';
import { registerBuiltInComponents } from '@langflow-native/components';
import {
  SessionService,
  CacheService,
  InMemoryStorageService,
  InMemorySecureStorageService,
} from '@langflow-native/services';

async function main() {
  console.log('=== Langflow Native - Chat with History Example ===\n');

  // Step 1: Initialize services
  console.log('1. Initializing services...');
  const storage = new InMemoryStorageService();
  const cache = new CacheService({ maxSize: 100, ttl: 5 * 60 * 1000 });
  const sessions = new SessionService({ maxHistorySize: 50 });
  const secure = new InMemorySecureStorageService();

  await storage.initialize();
  await cache.initialize();

  // Store a mock API key (in real app, this would be user-provided)
  await secure.setApiKey('openai', 'sk-mock-key-for-demo');

  console.log('   ✓ Services initialized\n');

  // Step 2: Register components
  console.log('2. Registering components...');
  registerBuiltInComponents();
  console.log('   ✓ Components registered\n');

  // Step 3: Create a session
  console.log('3. Creating chat session...');
  const session = sessions.createSession('chat-flow', {
    username: 'demo-user',
  });
  console.log(`   ✓ Session created: ${session.id}\n`);

  // Step 4: Create a simple chat workflow
  console.log('4. Creating chat workflow...');
  const graph = new Graph({
    name: 'Chat Workflow',
    description: 'A simple chat workflow with session history',
    nodes: [
      {
        id: 'input',
        type: 'input',
        data: { type: 'text' },
      },
      {
        id: 'output',
        type: 'output',
        data: { format: 'text' },
      },
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'input',
        target: 'output',
        targetHandle: 'value',
      },
    ],
  });
  console.log('   ✓ Workflow created\n');

  // Step 5: Simulate a conversation
  console.log('5. Simulating conversation...\n');
  
  const conversation = [
    { role: 'user' as const, message: 'Hello! My name is Alice.' },
    { role: 'assistant' as const, message: 'Hello Alice! Nice to meet you. How can I help you today?' },
    { role: 'user' as const, message: 'What is my name?' },
    { role: 'assistant' as const, message: 'Your name is Alice.' },
  ];

  const executor = new GraphExecutor();

  for (const turn of conversation) {
    // Add message to session
    sessions.addMessage(session.id, turn.role, turn.message);

    console.log(`   ${turn.role === 'user' ? '👤 User' : '🤖 Assistant'}: ${turn.message}`);

    // Execute workflow if it's a user message
    if (turn.role === 'user') {
      // Get session context (for a real LLM, we'd pass this as history)
      const context = sessions.getContext(session.id);

      // Cache check
      const cacheKey = CacheService.createKey('response', turn.message);
      let response = cache.get(cacheKey);

      if (!response) {
        // Execute workflow
        const result = await executor.execute(graph, {
          value: turn.message,
          history: context?.messages.slice(-10), // Last 10 messages
        });

        response = result.results.get('output');
        
        // Cache the response
        cache.set(cacheKey, response);
      } else {
        console.log('   💾 (from cache)');
      }
    }

    console.log('');
  }

  // Step 6: Display session statistics
  console.log('6. Session Statistics:');
  const messages = sessions.getMessages(session.id);
  console.log(`   Total messages: ${messages.length}`);
  console.log(`   User messages: ${messages.filter(m => m.role === 'user').length}`);
  console.log(`   Assistant messages: ${messages.filter(m => m.role === 'assistant').length}`);
  
  const sessionStats = sessions.getStats();
  console.log(`\n   Global stats:`);
  console.log(`   - Total sessions: ${sessionStats.totalSessions}`);
  console.log(`   - Total messages: ${sessionStats.totalMessages}`);
  console.log(`   - Avg messages/session: ${sessionStats.averageMessagesPerSession.toFixed(1)}`);

  const cacheStats = cache.getStats();
  console.log(`\n   Cache stats:`);
  console.log(`   - Entries: ${cacheStats.size}/${cacheStats.maxSize}`);

  // Step 7: Demonstrate storage
  console.log('\n7. Saving session to storage...');
  const sessionData = sessions.exportSession(session.id);
  await storage.saveData(`session-${session.id}`, JSON.parse(sessionData!));
  console.log('   ✓ Session saved');

  // Load it back
  const loadedData = await storage.loadData(`session-${session.id}`);
  console.log(`   ✓ Session loaded (${loadedData.messages.length} messages)`);

  // Step 8: Demonstrate secure storage
  console.log('\n8. Checking secure storage...');
  const apiKey = await secure.getApiKey('openai');
  console.log(`   ✓ API key retrieved: ${apiKey?.substring(0, 10)}...`);

  // Cleanup
  console.log('\n9. Cleanup...');
  cache.dispose();
  await storage.clear();
  sessions.clear();
  console.log('   ✓ Services cleaned up');

  console.log('\n✓ Example completed successfully!');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

