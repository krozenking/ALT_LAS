/**
 * Memory optimization utilities for the chat application
 */

/**
 * LRU (Least Recently Used) Cache implementation
 */
export class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;
  
  /**
   * Create a new LRU cache
   * 
   * @param capacity - Maximum number of items to store
   */
  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map<K, V>();
  }
  
  /**
   * Get an item from the cache
   * 
   * @param key - Key to get
   * @returns Value or undefined if not found
   */
  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }
    
    // Move the item to the end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }
  
  /**
   * Put an item in the cache
   * 
   * @param key - Key to set
   * @param value - Value to set
   */
  put(key: K, value: V): void {
    // If the key exists, delete it first
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // If the cache is full, delete the least recently used item
    else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    // Add the new item
    this.cache.set(key, value);
  }
  
  /**
   * Check if the cache has a key
   * 
   * @param key - Key to check
   * @returns Whether the key exists
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }
  
  /**
   * Delete an item from the cache
   * 
   * @param key - Key to delete
   * @returns Whether the key was deleted
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * Clear the cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get the number of items in the cache
   * 
   * @returns Number of items
   */
  size(): number {
    return this.cache.size;
  }
  
  /**
   * Get all keys in the cache
   * 
   * @returns Array of keys
   */
  keys(): K[] {
    return Array.from(this.cache.keys());
  }
  
  /**
   * Get all values in the cache
   * 
   * @returns Array of values
   */
  values(): V[] {
    return Array.from(this.cache.values());
  }
  
  /**
   * Get all entries in the cache
   * 
   * @returns Array of entries
   */
  entries(): [K, V][] {
    return Array.from(this.cache.entries());
  }
}

/**
 * Object pool for reusing objects
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;
  
  /**
   * Create a new object pool
   * 
   * @param factory - Function to create new objects
   * @param reset - Function to reset objects
   * @param initialSize - Initial pool size
   */
  constructor(factory: () => T, reset: (obj: T) => void, initialSize: number = 0) {
    this.factory = factory;
    this.reset = reset;
    
    // Initialize the pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory());
    }
  }
  
  /**
   * Get an object from the pool
   * 
   * @returns Object from the pool
   */
  get(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    
    return this.factory();
  }
  
  /**
   * Return an object to the pool
   * 
   * @param obj - Object to return
   */
  release(obj: T): void {
    this.reset(obj);
    this.pool.push(obj);
  }
  
  /**
   * Get the current pool size
   * 
   * @returns Pool size
   */
  size(): number {
    return this.pool.length;
  }
  
  /**
   * Clear the pool
   */
  clear(): void {
    this.pool = [];
  }
}

/**
 * Weak reference cache
 */
export class WeakCache<K extends object, V> {
  private cache: WeakMap<K, V>;
  
  /**
   * Create a new weak cache
   */
  constructor() {
    this.cache = new WeakMap<K, V>();
  }
  
  /**
   * Get an item from the cache
   * 
   * @param key - Key to get
   * @returns Value or undefined if not found
   */
  get(key: K): V | undefined {
    return this.cache.get(key);
  }
  
  /**
   * Put an item in the cache
   * 
   * @param key - Key to set
   * @param value - Value to set
   */
  put(key: K, value: V): void {
    this.cache.set(key, value);
  }
  
  /**
   * Check if the cache has a key
   * 
   * @param key - Key to check
   * @returns Whether the key exists
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }
  
  /**
   * Delete an item from the cache
   * 
   * @param key - Key to delete
   * @returns Whether the key was deleted
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }
}

/**
 * Memory-efficient set for primitive values
 */
export class PrimitiveSet<T extends string | number> {
  private set: Set<T>;
  
  /**
   * Create a new primitive set
   * 
   * @param values - Initial values
   */
  constructor(values?: T[]) {
    this.set = new Set<T>(values);
  }
  
  /**
   * Add a value to the set
   * 
   * @param value - Value to add
   * @returns The set
   */
  add(value: T): this {
    this.set.add(value);
    return this;
  }
  
  /**
   * Check if the set has a value
   * 
   * @param value - Value to check
   * @returns Whether the value exists
   */
  has(value: T): boolean {
    return this.set.has(value);
  }
  
  /**
   * Delete a value from the set
   * 
   * @param value - Value to delete
   * @returns Whether the value was deleted
   */
  delete(value: T): boolean {
    return this.set.delete(value);
  }
  
  /**
   * Clear the set
   */
  clear(): void {
    this.set.clear();
  }
  
  /**
   * Get the number of values in the set
   * 
   * @returns Number of values
   */
  size(): number {
    return this.set.size;
  }
  
  /**
   * Get all values in the set
   * 
   * @returns Array of values
   */
  values(): T[] {
    return Array.from(this.set.values());
  }
}

/**
 * Memory-efficient map for primitive keys
 */
export class PrimitiveMap<K extends string | number, V> {
  private map: Map<K, V>;
  
  /**
   * Create a new primitive map
   * 
   * @param entries - Initial entries
   */
  constructor(entries?: [K, V][]) {
    this.map = new Map<K, V>(entries);
  }
  
  /**
   * Get a value from the map
   * 
   * @param key - Key to get
   * @returns Value or undefined if not found
   */
  get(key: K): V | undefined {
    return this.map.get(key);
  }
  
  /**
   * Set a value in the map
   * 
   * @param key - Key to set
   * @param value - Value to set
   * @returns The map
   */
  set(key: K, value: V): this {
    this.map.set(key, value);
    return this;
  }
  
  /**
   * Check if the map has a key
   * 
   * @param key - Key to check
   * @returns Whether the key exists
   */
  has(key: K): boolean {
    return this.map.has(key);
  }
  
  /**
   * Delete a key from the map
   * 
   * @param key - Key to delete
   * @returns Whether the key was deleted
   */
  delete(key: K): boolean {
    return this.map.delete(key);
  }
  
  /**
   * Clear the map
   */
  clear(): void {
    this.map.clear();
  }
  
  /**
   * Get the number of entries in the map
   * 
   * @returns Number of entries
   */
  size(): number {
    return this.map.size;
  }
  
  /**
   * Get all keys in the map
   * 
   * @returns Array of keys
   */
  keys(): K[] {
    return Array.from(this.map.keys());
  }
  
  /**
   * Get all values in the map
   * 
   * @returns Array of values
   */
  values(): V[] {
    return Array.from(this.map.values());
  }
  
  /**
   * Get all entries in the map
   * 
   * @returns Array of entries
   */
  entries(): [K, V][] {
    return Array.from(this.map.entries());
  }
}

/**
 * Dispose pattern for cleaning up resources
 */
export interface Disposable {
  dispose(): void;
}

/**
 * Create a disposable object
 * 
 * @param disposeFunction - Function to call when disposing
 * @returns Disposable object
 */
export function createDisposable(disposeFunction: () => void): Disposable {
  return {
    dispose: disposeFunction,
  };
}

/**
 * Dispose multiple disposable objects
 * 
 * @param disposables - Disposable objects to dispose
 */
export function disposeAll(disposables: Disposable[]): void {
  for (const disposable of disposables) {
    disposable.dispose();
  }
}

/**
 * Track disposable objects and dispose them when needed
 */
export class DisposableTracker {
  private disposables: Disposable[] = [];
  
  /**
   * Add a disposable object
   * 
   * @param disposable - Disposable object to add
   * @returns The disposable object
   */
  add<T extends Disposable>(disposable: T): T {
    this.disposables.push(disposable);
    return disposable;
  }
  
  /**
   * Dispose all tracked objects
   */
  dispose(): void {
    disposeAll(this.disposables);
    this.disposables = [];
  }
}
