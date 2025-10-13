/**
 * StorageService - File system operations for React Native
 */

import { FlowId } from '@langflow-native/core';

export interface StorageConfig {
  basePath?: string;
  maxFileSize?: number; // in bytes
}

export interface FileInfo {
  path: string;
  name: string;
  size: number;
  mtime: number;
}

/**
 * Abstract StorageService for file operations
 * Platform-specific implementations will provide the actual file system access
 */
export abstract class StorageService {
  protected config: StorageConfig;

  constructor(config?: StorageConfig) {
    this.config = {
      basePath: config?.basePath || 'langflow-native',
      maxFileSize: config?.maxFileSize || 10 * 1024 * 1024, // 10MB default
    };
  }

  /**
   * Initialize storage (create directories if needed)
   */
  abstract initialize(): Promise<void>;

  /**
   * Write data to file
   */
  abstract writeFile(path: string, data: string): Promise<void>;

  /**
   * Read data from file
   */
  abstract readFile(path: string): Promise<string>;

  /**
   * Check if file exists
   */
  abstract exists(path: string): Promise<boolean>;

  /**
   * Delete file
   */
  abstract deleteFile(path: string): Promise<void>;

  /**
   * List files in directory
   */
  abstract listFiles(directory: string): Promise<FileInfo[]>;

  /**
   * Get file info
   */
  abstract getFileInfo(path: string): Promise<FileInfo | null>;

  /**
   * Save workflow to storage
   */
  async saveWorkflow(flowId: FlowId, data: any): Promise<void> {
    const path = this.getWorkflowPath(flowId);
    const json = JSON.stringify(data, null, 2);
    await this.writeFile(path, json);
  }

  /**
   * Load workflow from storage
   */
  async loadWorkflow(flowId: FlowId): Promise<any> {
    const path = this.getWorkflowPath(flowId);
    if (!(await this.exists(path))) {
      throw new Error(`Workflow ${flowId} not found`);
    }
    const json = await this.readFile(path);
    return JSON.parse(json);
  }

  /**
   * Delete workflow from storage
   */
  async deleteWorkflow(flowId: FlowId): Promise<void> {
    const path = this.getWorkflowPath(flowId);
    await this.deleteFile(path);
  }

  /**
   * List all workflows
   */
  async listWorkflows(): Promise<string[]> {
    const directory = `${this.config.basePath}/workflows`;
    try {
      const files = await this.listFiles(directory);
      return files
        .filter((f) => f.name.endsWith('.json'))
        .map((f) => f.name.replace('.json', ''));
    } catch (error) {
      return [];
    }
  }

  /**
   * Get workflow file path
   */
  protected getWorkflowPath(flowId: FlowId): string {
    return `${this.config.basePath}/workflows/${flowId}.json`;
  }

  /**
   * Get data file path
   */
  protected getDataPath(key: string): string {
    return `${this.config.basePath}/data/${key}`;
  }

  /**
   * Save arbitrary data
   */
  async saveData(key: string, data: any): Promise<void> {
    const path = this.getDataPath(key);
    const json = JSON.stringify(data);
    await this.writeFile(path, json);
  }

  /**
   * Load arbitrary data
   */
  async loadData(key: string): Promise<any> {
    const path = this.getDataPath(key);
    if (!(await this.exists(path))) {
      return null;
    }
    const json = await this.readFile(path);
    return JSON.parse(json);
  }

  /**
   * Clear all data
   */
  async clear(): Promise<void> {
    const workflows = await this.listWorkflows();
    for (const workflowId of workflows) {
      await this.deleteWorkflow(workflowId);
    }
  }
}

/**
 * In-Memory Storage Implementation (for testing and non-RN environments)
 */
export class InMemoryStorageService extends StorageService {
  private files: Map<string, string> = new Map();

  async initialize(): Promise<void> {
    // No-op for in-memory
  }

  async writeFile(path: string, data: string): Promise<void> {
    if (data.length > this.config.maxFileSize!) {
      throw new Error(`File size exceeds maximum: ${this.config.maxFileSize} bytes`);
    }
    this.files.set(path, data);
  }

  async readFile(path: string): Promise<string> {
    const data = this.files.get(path);
    if (!data) {
      throw new Error(`File not found: ${path}`);
    }
    return data;
  }

  async exists(path: string): Promise<boolean> {
    return this.files.has(path);
  }

  async deleteFile(path: string): Promise<void> {
    this.files.delete(path);
  }

  async listFiles(directory: string): Promise<FileInfo[]> {
    const files: FileInfo[] = [];
    this.files.forEach((data, path) => {
      if (path.startsWith(directory)) {
        const name = path.substring(directory.length + 1);
        if (!name.includes('/')) {
          files.push({
            path,
            name,
            size: data.length,
            mtime: Date.now(),
          });
        }
      }
    });
    return files;
  }

  async getFileInfo(path: string): Promise<FileInfo | null> {
    const data = this.files.get(path);
    if (!data) return null;

    const parts = path.split('/');
    const name = parts[parts.length - 1];

    return {
      path,
      name,
      size: data.length,
      mtime: Date.now(),
    };
  }

  async clear(): Promise<void> {
    this.files.clear();
  }
}

