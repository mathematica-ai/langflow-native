/**
 * CacheService - In-memory and persistent caching
 */

export interface CacheConfig {
  maxSize?: number; // Maximum number of entries
  ttl?: number; // Time to live in milliseconds
  persistKey?: string; // Key for persistent storage
}

export interface CacheEntry<T = any> {
  value: T;
  timestamp: number;
  ttl?: number;
}

/**
 * CacheService - Manages in-memory cache with optional persistence
 */
export class CacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private config: Required<CacheConfig>;
  private cleanupInterval?: NodeJS.Timer;

  constructor(config?: CacheConfig) {
    this.config = {
      maxSize: config?.maxSize || 1000,
      ttl: config?.ttl || 5 * 60 * 1000, // 5 minutes default
      persistKey: config?.persistKey || 'langflow-cache',
    };
  }

  /**
   * Initialize cache service
   */
  async initialize(): Promise<void> {
    // Start cleanup interval
    this.startCleanup();
  }

  /**
   * Set cache value
   */
  set<T = any>(key: string, value: T, ttl?: number): void {
    // Check cache size limit
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      // Evict oldest entry
      const oldestKey = this.getOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
    });
  }

  /**
   * Get cache value
   */
  get<T = any>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    let oldestTime = Infinity;
    let newestTime = 0;

    this.cache.forEach((entry) => {
      if (entry.timestamp < oldestTime) oldestTime = entry.timestamp;
      if (entry.timestamp > newestTime) newestTime = entry.timestamp;
    });

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      oldestEntry: oldestTime === Infinity ? null : oldestTime,
      newestEntry: newestTime === 0 ? null : newestTime,
    };
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    const ttl = entry.ttl || this.config.ttl;
    return Date.now() - entry.timestamp > ttl;
  }

  /**
   * Get oldest cache key
   */
  private getOldestKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    this.cache.forEach((entry, key) => {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    });

    return oldestKey;
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanup(): void {
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    let removed = 0;
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
      removed++;
    });

    return removed;
  }

  /**
   * Dispose cache service
   */
  dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }

  /**
   * Create cache key from parts
   */
  static createKey(...parts: any[]): string {
    return parts.map((p) => String(p)).join(':');
  }
}

