interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_MEMORY_CACHE_SIZE = 10;

class QueryCache {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();

  private generateKey(query: string, type: 'property' | 'contractor'): string {
    return `${type}:${query.toLowerCase().trim()}`;
  }

  get<T>(query: string, type: 'property' | 'contractor'): T | null {
    const key = this.generateKey(query, type);

    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && Date.now() - memoryEntry.timestamp < CACHE_DURATION) {
      return memoryEntry.data as T;
    }

    // Check sessionStorage
    try {
      const sessionData = sessionStorage.getItem(key);
      if (sessionData) {
        const entry: CacheEntry<T> = JSON.parse(sessionData);
        if (Date.now() - entry.timestamp < CACHE_DURATION) {
          // Restore to memory cache
          this.memoryCache.set(key, entry);
          return entry.data;
        } else {
          sessionStorage.removeItem(key);
        }
      }
    } catch (error) {
      // sessionStorage might be full or unavailable
    }

    return null;
  }

  set<T>(query: string, type: 'property' | 'contractor', data: T): void {
    const key = this.generateKey(query, type);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };

    // Update memory cache (with LRU eviction)
    if (this.memoryCache.size >= MAX_MEMORY_CACHE_SIZE) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }
    this.memoryCache.set(key, entry);

    // Store in sessionStorage
    try {
      sessionStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      // sessionStorage might be full, clear old entries
      this.clearOldEntries();
      try {
        sessionStorage.setItem(key, JSON.stringify(entry));
      } catch {
        // Still failing, skip sessionStorage
      }
    }
  }

  private clearOldEntries(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith('property:') || key.startsWith('contractor:'))) {
          const data = sessionStorage.getItem(key);
          if (data) {
            try {
              const entry = JSON.parse(data);
              if (Date.now() - entry.timestamp >= CACHE_DURATION) {
                keysToRemove.push(key);
              }
            } catch {
              keysToRemove.push(key);
            }
          }
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
    } catch (error) {
      // Ignore errors
    }
  }

  clear(): void {
    this.memoryCache.clear();
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith('property:') || key.startsWith('contractor:'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
    } catch (error) {
      // Ignore errors
    }
  }
}

export const queryCache = new QueryCache();
