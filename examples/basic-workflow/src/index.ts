/**
 * Basic Workflow Example
 * 
 * This example demonstrates how to create and execute a simple workflow
 * that takes text input, processes it, and produces output.
 */

import { Graph } from '@langflow-native/core';
import { GraphExecutor } from '@langflow-native/runtime';
import { registerBuiltInComponents } from '@langflow-native/components';

async function main() {
  console.log('=== Langflow Native - Basic Workflow Example ===\n');

  // Step 1: Register built-in components
  console.log('1. Registering components...');
  registerBuiltInComponents();
  console.log('   ✓ Components registered\n');

  // Step 2: Create a simple workflow
  console.log('2. Creating workflow...');
  const graph = new Graph({
    name: 'Text Processing Workflow',
    description: 'A simple workflow that transforms text',
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        data: {
          type: 'text',
          defaultValue: 'Hello, Langflow Native!',
        },
      },
      {
        id: 'transform-1',
        type: 'text-transform',
        data: {
          operation: 'uppercase',
        },
      },
      {
        id: 'output-1',
        type: 'output',
        data: {
          format: 'text',
        },
      },
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'input-1',
        target: 'transform-1',
        sourceHandle: 'output',
        targetHandle: 'text',
      },
      {
        id: 'edge-2',
        source: 'transform-1',
        target: 'output-1',
        sourceHandle: 'result',
        targetHandle: 'value',
      },
    ],
  });
  console.log('   ✓ Workflow created\n');

  // Step 3: Execute the workflow
  console.log('3. Executing workflow...');
  const executor = new GraphExecutor();

  // Add event listeners to track progress
  executor.on((event) => {
    switch (event.type) {
      case 'start':
        console.log('   → Execution started');
        break;
      case 'node-start':
        console.log(`   → Executing node: ${event.nodeId}`);
        break;
      case 'node-complete':
        console.log(`   ✓ Node complete: ${event.nodeId}`);
        break;
      case 'node-error':
        console.log(`   ✗ Node error: ${event.nodeId} - ${event.error?.message}`);
        break;
      case 'complete':
        console.log('   ✓ Execution complete');
        break;
      case 'error':
        console.log(`   ✗ Execution error: ${event.error?.message}`);
        break;
    }
  });

  try {
    const state = await executor.execute(graph, {
      value: 'hello world',
    });

    console.log('\n4. Results:');
    console.log(`   Status: ${state.status}`);
    console.log(`   Duration: ${state.endTime! - state.startTime}ms`);
    console.log(`   Nodes executed: ${state.nodeStates.size}`);
    console.log('\n   Output:');
    
    state.results.forEach((result, nodeId) => {
      console.log(`   ${nodeId}: ${JSON.stringify(result)}`);
    });

    console.log('\n✓ Example completed successfully!');
  } catch (error) {
    console.error('\n✗ Example failed:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

