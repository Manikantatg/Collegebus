// Utility to manage Firebase quota usage
class QuotaManager {
  private static instance: QuotaManager;
  private lastUpdate: number = 0;
  private updateQueue: Array<() => Promise<any>> = [];
  private isProcessing: boolean = false;
  private readonly MIN_UPDATE_INTERVAL: number = 3000; // 3 seconds minimum between updates

  private constructor() {}

  static getInstance(): QuotaManager {
    if (!QuotaManager.instance) {
      QuotaManager.instance = new QuotaManager();
    }
    return QuotaManager.instance;
  }

  // Add an update operation to the queue
  async queueUpdate(operation: () => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.updateQueue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  // Process the update queue with rate limiting
  private async processQueue(): Promise<void> {
    if (this.updateQueue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    
    // Check if we need to wait before processing the next update
    const now = Date.now();
    const timeSinceLastUpdate = now - this.lastUpdate;
    
    if (timeSinceLastUpdate < this.MIN_UPDATE_INTERVAL) {
      const waitTime = this.MIN_UPDATE_INTERVAL - timeSinceLastUpdate;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Process the next update in the queue
    const nextUpdate = this.updateQueue.shift();
    if (nextUpdate) {
      try {
        await nextUpdate();
        this.lastUpdate = Date.now();
      } catch (error) {
        console.error('Error processing queued update:', error);
      }
    }
    
    // Continue processing the queue
    this.processQueue();
  }

  // Clear the update queue (useful for error recovery)
  clearQueue(): void {
    this.updateQueue = [];
    this.isProcessing = false;
  }
}

export default QuotaManager.getInstance();