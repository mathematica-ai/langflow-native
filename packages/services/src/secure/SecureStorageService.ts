/**
 * SecureStorageService - Encrypted storage for sensitive data like API keys
 */

export interface SecureStorageConfig {
  namespace?: string;
}

/**
 * Abstract SecureStorageService for sensitive data
 * Platform-specific implementations will provide actual secure storage
 * (Keychain on iOS, KeyStore on Android)
 */
export abstract class SecureStorageService {
  protected config: Required<SecureStorageConfig>;

  constructor(config?: SecureStorageConfig) {
    this.config = {
      namespace: config?.namespace || 'langflow-native',
    };
  }

  /**
   * Store sensitive data securely
   */
  abstract setItem(key: string, value: string): Promise<void>;

  /**
   * Retrieve sensitive data
   */
  abstract getItem(key: string): Promise<string | null>;

  /**
   * Remove sensitive data
   */
  abstract removeItem(key: string): Promise<void>;

  /**
   * Check if key exists
   */
  abstract hasItem(key: string): Promise<boolean>;

  /**
   * Clear all secure storage
   */
  abstract clear(): Promise<void>;

  /**
   * Store API key
   */
  async setApiKey(provider: string, apiKey: string): Promise<void> {
    const key = this.getKeyName('api-key', provider);
    await this.setItem(key, apiKey);
  }

  /**
   * Get API key
   */
  async getApiKey(provider: string): Promise<string | null> {
    const key = this.getKeyName('api-key', provider);
    return this.getItem(key);
  }

  /**
   * Remove API key
   */
  async removeApiKey(provider: string): Promise<void> {
    const key = this.getKeyName('api-key', provider);
    await this.removeItem(key);
  }

  /**
   * Store credentials
   */
  async setCredentials(service: string, credentials: Record<string, string>): Promise<void> {
    const key = this.getKeyName('credentials', service);
    await this.setItem(key, JSON.stringify(credentials));
  }

  /**
   * Get credentials
   */
  async getCredentials(service: string): Promise<Record<string, string> | null> {
    const key = this.getKeyName('credentials', service);
    const json = await this.getItem(key);
    return json ? JSON.parse(json) : null;
  }

  /**
   * Remove credentials
   */
  async removeCredentials(service: string): Promise<void> {
    const key = this.getKeyName('credentials', service);
    await this.removeItem(key);
  }

  /**
   * Generate namespaced key
   */
  protected getKeyName(...parts: string[]): string {
    return [this.config.namespace, ...parts].join(':');
  }
}

/**
 * In-Memory Secure Storage Implementation (for testing and non-RN environments)
 * WARNING: Not actually secure! For testing purposes only.
 */
export class InMemorySecureStorageService extends SecureStorageService {
  private storage: Map<string, string> = new Map();

  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async hasItem(key: string): Promise<boolean> {
    return this.storage.has(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }
}

