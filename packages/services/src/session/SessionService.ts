/**
 * SessionService - Manages workflow sessions and conversation history
 */

import { FlowId } from '@langflow-native/core';

export interface SessionConfig {
  maxHistorySize?: number;
  autoSave?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface Session {
  id: string;
  flowId: FlowId;
  messages: Message[];
  variables: Record<string, any>;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
}

/**
 * SessionService - Manages conversation sessions
 */
export class SessionService {
  private sessions: Map<string, Session> = new Map();
  private config: Required<SessionConfig>;

  constructor(config?: SessionConfig) {
    this.config = {
      maxHistorySize: config?.maxHistorySize || 100,
      autoSave: config?.autoSave ?? true,
    };
  }

  /**
   * Create a new session
   */
  createSession(flowId: FlowId, metadata?: Record<string, any>): Session {
    const sessionId = this.generateSessionId();
    const session: Session = {
      id: sessionId,
      flowId,
      messages: [],
      variables: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata,
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): Session | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get all sessions for a flow
   */
  getSessionsByFlow(flowId: FlowId): Session[] {
    return Array.from(this.sessions.values()).filter((s) => s.flowId === flowId);
  }

  /**
   * Get all sessions
   */
  getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Update session
   */
  updateSession(sessionId: string, updates: Partial<Session>): Session | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const updated = {
      ...session,
      ...updates,
      id: session.id, // Prevent ID change
      updatedAt: Date.now(),
    };

    this.sessions.set(sessionId, updated);
    return updated;
  }

  /**
   * Delete session
   */
  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Add message to session
   */
  addMessage(
    sessionId: string,
    role: Message['role'],
    content: string,
    metadata?: Record<string, any>
  ): Message | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const message: Message = {
      id: this.generateMessageId(),
      role,
      content,
      timestamp: Date.now(),
      metadata,
    };

    session.messages.push(message);

    // Limit history size
    if (session.messages.length > this.config.maxHistorySize) {
      session.messages = session.messages.slice(-this.config.maxHistorySize);
    }

    session.updatedAt = Date.now();
    this.sessions.set(sessionId, session);

    return message;
  }

  /**
   * Get session messages
   */
  getMessages(sessionId: string, limit?: number): Message[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    if (limit) {
      return session.messages.slice(-limit);
    }

    return session.messages;
  }

  /**
   * Clear session messages
   */
  clearMessages(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.messages = [];
    session.updatedAt = Date.now();
    this.sessions.set(sessionId, session);

    return true;
  }

  /**
   * Set session variable
   */
  setVariable(sessionId: string, key: string, value: any): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.variables[key] = value;
    session.updatedAt = Date.now();
    this.sessions.set(sessionId, session);

    return true;
  }

  /**
   * Get session variable
   */
  getVariable(sessionId: string, key: string): any {
    const session = this.sessions.get(sessionId);
    return session?.variables[key];
  }

  /**
   * Get session context for workflow execution
   */
  getContext(sessionId: string): {
    messages: Message[];
    variables: Record<string, any>;
  } | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return {
      messages: session.messages,
      variables: session.variables,
    };
  }

  /**
   * Export session to JSON
   */
  exportSession(sessionId: string): string | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return JSON.stringify(session, null, 2);
  }

  /**
   * Import session from JSON
   */
  importSession(json: string): Session {
    const session = JSON.parse(json) as Session;
    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Clear all sessions
   */
  clear(): void {
    this.sessions.clear();
  }

  /**
   * Get session statistics
   */
  getStats(): {
    totalSessions: number;
    totalMessages: number;
    averageMessagesPerSession: number;
  } {
    const sessions = Array.from(this.sessions.values());
    const totalMessages = sessions.reduce((sum, s) => sum + s.messages.length, 0);

    return {
      totalSessions: sessions.length,
      totalMessages,
      averageMessagesPerSession:
        sessions.length > 0 ? totalMessages / sessions.length : 0,
    };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

