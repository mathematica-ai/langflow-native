/**
 * Component registry - manages available component types
 */

import {
  IComponent,
  ComponentConstructor,
  ComponentRegistration,
  ComponentFactory,
  ComponentOptions,
} from '../types';

/**
 * Global registry for managing component types
 */
export class ComponentRegistry {
  private static instance: ComponentRegistry;
  private components: Map<string, ComponentRegistration> = new Map();
  private factories: Map<string, ComponentFactory> = new Map();

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry();
    }
    return ComponentRegistry.instance;
  }

  /**
   * Register a component class
   */
  register(type: string, constructor: ComponentConstructor): void {
    if (this.components.has(type)) {
      throw new Error(`Component type '${type}' is already registered`);
    }

    // Create a temporary instance to get metadata
    const tempInstance = new constructor();

    const registration: ComponentRegistration = {
      type,
      constructor,
      metadata: tempInstance.metadata,
    };

    this.components.set(type, registration);
  }

  /**
   * Register a component factory function
   */
  registerFactory(type: string, factory: ComponentFactory): void {
    if (this.factories.has(type)) {
      throw new Error(`Component factory for type '${type}' is already registered`);
    }

    this.factories.set(type, factory);
  }

  /**
   * Unregister a component
   */
  unregister(type: string): void {
    this.components.delete(type);
    this.factories.delete(type);
  }

  /**
   * Check if a component type is registered
   */
  has(type: string): boolean {
    return this.components.has(type) || this.factories.has(type);
  }

  /**
   * Get component registration info
   */
  getRegistration(type: string): ComponentRegistration | undefined {
    return this.components.get(type);
  }

  /**
   * Create a component instance
   */
  create(type: string, config?: any, options?: ComponentOptions): IComponent {
    // Try factory first
    const factory = this.factories.get(type);
    if (factory) {
      return factory(config, options);
    }

    // Try constructor
    const registration = this.components.get(type);
    if (registration) {
      return new registration.constructor(config, options);
    }

    throw new Error(`Component type '${type}' is not registered`);
  }

  /**
   * Get all registered component types
   */
  getRegisteredTypes(): string[] {
    const constructorTypes = Array.from(this.components.keys());
    const factoryTypes = Array.from(this.factories.keys());
    return Array.from(new Set([...constructorTypes, ...factoryTypes]));
  }

  /**
   * Get all component registrations
   */
  getAllRegistrations(): ComponentRegistration[] {
    return Array.from(this.components.values());
  }

  /**
   * Clear all registrations (useful for testing)
   */
  clear(): void {
    this.components.clear();
    this.factories.clear();
  }
}

/**
 * Convenience function to get the registry instance
 */
export function getRegistry(): ComponentRegistry {
  return ComponentRegistry.getInstance();
}

