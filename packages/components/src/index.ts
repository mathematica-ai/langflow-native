/**
 * Langflow Native Components Package
 * 
 * Built-in components for workflow creation
 */

// I/O Components
export * from './io';

// LLM Components
export * from './llm';

// Tool Components
export * from './tools';

/**
 * Register all built-in components
 */
import { ComponentRegistry } from '@langflow-native/core';
import { InputComponent } from './io/InputComponent';
import { OutputComponent } from './io/OutputComponent';
import { OpenAIComponent } from './llm/OpenAIComponent';
import { HttpRequestComponent } from './tools/HttpRequestComponent';
import { TextTransformComponent } from './tools/TextTransformComponent';

export function registerBuiltInComponents(registry?: ComponentRegistry): void {
  const reg = registry || ComponentRegistry.getInstance();

  // Register I/O components
  reg.register('input', InputComponent);
  reg.register('output', OutputComponent);

  // Register LLM components
  reg.register('openai', OpenAIComponent);

  // Register tool components
  reg.register('http-request', HttpRequestComponent);
  reg.register('text-transform', TextTransformComponent);
}

