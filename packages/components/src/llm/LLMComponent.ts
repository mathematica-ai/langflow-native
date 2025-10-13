/**
 * LLM component - base class for language model components
 */

import {
  BaseComponent,
  ExecutionContext,
  PortDefinition,
  ComponentMetadata,
} from '@langflow-native/core';

export interface LLMConfig {
  model: string;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  systemPrompt?: string;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Base LLM Component - abstract class for LLM implementations
 */
export abstract class LLMComponent extends BaseComponent {
  protected config: LLMConfig;

  constructor(config: LLMConfig) {
    super(config);
    this.config = config;
  }

  get metadata(): ComponentMetadata {
    return {
      name: 'LLM',
      description: 'Language Model component for text generation',
      category: 'LLM',
      version: '1.0.0',
      tags: ['llm', 'ai', 'text-generation'],
    };
  }

  get inputs(): PortDefinition[] {
    return [
      {
        name: 'prompt',
        type: 'string',
        required: true,
        description: 'Input prompt for the language model',
      },
      {
        name: 'messages',
        type: 'array',
        required: false,
        description: 'Optional message history for chat models',
      },
    ];
  }

  get outputs(): PortDefinition[] {
    return [
      {
        name: 'response',
        type: 'string',
        required: true,
        description: 'Generated response from the language model',
      },
      {
        name: 'metadata',
        type: 'object',
        required: false,
        description: 'Response metadata (tokens, model, etc.)',
      },
    ];
  }

  async executeImpl(context: ExecutionContext): Promise<any> {
    const prompt = this.getInput<string>(context, 'prompt');
    const messages = context.inputs.messages as Message[] | undefined;

    // Build messages array
    const messageList: Message[] = [];

    if (this.config.systemPrompt) {
      messageList.push({
        role: 'system',
        content: this.config.systemPrompt,
      });
    }

    if (messages && messages.length > 0) {
      messageList.push(...messages);
    }

    messageList.push({
      role: 'user',
      content: prompt,
    });

    // Call LLM API (implemented by subclasses)
    const response = await this.callLLM(messageList);

    return response;
  }

  /**
   * Abstract method to be implemented by specific LLM providers
   */
  protected abstract callLLM(messages: Message[]): Promise<{
    response: string;
    metadata?: any;
  }>;

  /**
   * Helper to build request options
   */
  protected getRequestOptions() {
    return {
      temperature: this.config.temperature ?? 0.7,
      maxTokens: this.config.maxTokens ?? 1000,
      topP: this.config.topP ?? 1,
      frequencyPenalty: this.config.frequencyPenalty ?? 0,
      presencePenalty: this.config.presencePenalty ?? 0,
    };
  }
}

