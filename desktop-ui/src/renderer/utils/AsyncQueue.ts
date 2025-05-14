/**
 * Options for the AsyncQueue
 */
interface AsyncQueueOptions {
  /**
   * The maximum number of concurrent tasks
   * @default 1
   */
  concurrency?: number;
  
  /**
   * The delay between tasks in milliseconds
   * @default 0
   */
  delay?: number;
  
  /**
   * Whether to enable debug logging
   * @default false
   */
  debug?: boolean;
  
  /**
   * A callback to handle errors
   * @default console.error
   */
  onError?: (error: Error, taskId: string) => void;
}

/**
 * A task in the queue
 */
interface QueueTask<T> {
  /**
   * The unique ID of the task
   */
  id: string;
  
  /**
   * The function to execute
   */
  fn: () => Promise<T>;
  
  /**
   * The resolve function for the task's promise
   */
  resolve: (value: T) => void;
  
  /**
   * The reject function for the task's promise
   */
  reject: (reason: any) => void;
  
  /**
   * The priority of the task (higher values have higher priority)
   */
  priority: number;
  
  /**
   * The timestamp when the task was added to the queue
   */
  timestamp: number;
}

/**
 * A queue for executing asynchronous tasks with concurrency control
 */
export class AsyncQueue {
  private queue: QueueTask<any>[] = [];
  private running: Set<string> = new Set();
  private concurrency: number;
  private delay: number;
  private debug: boolean;
  private onError: (error: Error, taskId: string) => void;
  private paused: boolean = false;
  private taskCounter: number = 0;
  
  /**
   * Creates a new AsyncQueue
   * @param options Options for the queue
   */
  constructor(options: AsyncQueueOptions = {}) {
    this.concurrency = options.concurrency || 1;
    this.delay = options.delay || 0;
    this.debug = options.debug || false;
    this.onError = options.onError || console.error;
  }
  
  /**
   * Adds a task to the queue
   * @param fn The function to execute
   * @param priority The priority of the task (higher values have higher priority)
   * @returns A promise that resolves with the result of the task
   */
  add<T>(fn: () => Promise<T>, priority: number = 0): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const id = `task-${++this.taskCounter}`;
      
      const task: QueueTask<T> = {
        id,
        fn,
        resolve,
        reject,
        priority,
        timestamp: Date.now(),
      };
      
      this.queue.push(task);
      this.logDebug(`Task ${id} added to queue with priority ${priority}`);
      
      // Sort the queue by priority (descending) and then by timestamp (ascending)
      this.queue.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return a.timestamp - b.timestamp;
      });
      
      this.processQueue();
    });
  }
  
  /**
   * Pauses the queue
   */
  pause(): void {
    this.paused = true;
    this.logDebug('Queue paused');
  }
  
  /**
   * Resumes the queue
   */
  resume(): void {
    this.paused = false;
    this.logDebug('Queue resumed');
    this.processQueue();
  }
  
  /**
   * Clears the queue
   */
  clear(): void {
    this.queue = [];
    this.logDebug('Queue cleared');
  }
  
  /**
   * Gets the number of tasks in the queue
   */
  get size(): number {
    return this.queue.length;
  }
  
  /**
   * Gets the number of running tasks
   */
  get runningCount(): number {
    return this.running.size;
  }
  
  /**
   * Gets whether the queue is paused
   */
  get isPaused(): boolean {
    return this.paused;
  }
  
  /**
   * Processes the queue
   * @private
   */
  private processQueue(): void {
    if (this.paused) {
      this.logDebug('Queue is paused, not processing');
      return;
    }
    
    while (this.running.size < this.concurrency && this.queue.length > 0) {
      const task = this.queue.shift()!;
      this.running.add(task.id);
      
      this.logDebug(`Starting task ${task.id}, running: ${this.running.size}, queued: ${this.queue.length}`);
      
      setTimeout(() => {
        this.executeTask(task);
      }, this.delay);
    }
  }
  
  /**
   * Executes a task
   * @param task The task to execute
   * @private
   */
  private async executeTask<T>(task: QueueTask<T>): Promise<void> {
    try {
      const result = await task.fn();
      task.resolve(result);
      this.logDebug(`Task ${task.id} completed successfully`);
    } catch (error) {
      task.reject(error);
      this.onError(error as Error, task.id);
      this.logDebug(`Task ${task.id} failed: ${error}`);
    } finally {
      this.running.delete(task.id);
      this.processQueue();
    }
  }
  
  /**
   * Logs a debug message
   * @param message The message to log
   * @private
   */
  private logDebug(message: string): void {
    if (this.debug) {
      console.log(`[AsyncQueue] ${message}`);
    }
  }
}
