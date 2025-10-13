/**
 * OpenAI LLM component
 */

import { LLMComponent, LLMConfig, Message } from './LLMComponent';
import { ComponentMetadata } from '@langflow-native/core';

export interface OpenAIConfig extends LLMConfig {
  apiKey: string;
  organizationId?: string;
  apiBase?: string;
}

/**
 * OpenAI Component - uses OpenAI API for text generation
 */
export class OpenAIComponent extends LLMComponent {
  protected config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    super(config);
    this.config = config;

    if (!this.config.apiKey) {
      throw new Error('OpenAI API key is required');
    }
  }

  get metadata(): ComponentMetadata {
    return {
      name: 'OpenAI',
      description: 'OpenAI language model for text generation',
      category: 'LLM',
      version: '1.0.0',
      author: 'Langflow Native',
      tags: ['llm', 'openai', 'gpt'],
    };
  }

  protected async callLLM(messages: Message[]): Promise<{
    response: string;
    metadata?: any;
  }> {
    const apiBase = this.config.apiBase || 'https://api.openai.com/v1';
    const url = `${apiBase}/chat/completions`;
    const options = this.getRequestOptions();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
    };

    if (this.config.organizationId) {
      headers['OpenAI-Organization'] = this.config.organizationId;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: this.config.model,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        top_p: options.topP,
        frequency_penalty: options.frequencyPenalty,
        presence_penalty: options.presencePenalty,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(error)}`
      );
    }

    const data = await response.json();

    return {
      response: data.choices[0]?.message?.content || '',
      metadata: {
        model: data.model,
        usage: data.usage,
        finishReason: data.choices[0]?.finish_reason,
      },
    };
  }
}

