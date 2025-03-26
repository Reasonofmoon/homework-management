/**
 * This adapter provides a consistent interface for data storage
 * whether the application is running locally or on a server
 */

export interface StorageAdapter {
  getItem: (key: string) => Promise<any>
  setItem: (key: string, value: any) => Promise<void>
  removeItem: (key: string) => Promise<void>
  clear: () => Promise<void>
  keys: () => Promise<string[]>
}

class LocalStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<any> {
    if (typeof window === "undefined") return null

    const item = window.localStorage.getItem(key)
    if (!item) return null

    try {
      return JSON.parse(item)
    } catch (e) {
      return item
    }
  }

  async setItem(key: string, value: any): Promise<void> {
    if (typeof window === "undefined") return

    const valueToStore = typeof value === "string" ? value : JSON.stringify(value)
    window.localStorage.setItem(key, valueToStore)
  }

  async removeItem(key: string): Promise<void> {
    if (typeof window === "undefined") return
    window.localStorage.removeItem(key)
  }

  async clear(): Promise<void> {
    if (typeof window === "undefined") return
    window.localStorage.clear()
  }

  async keys(): Promise<string[]> {
    if (typeof window === "undefined") return []
    return Object.keys(window.localStorage)
  }
}

// Export a singleton instance
const storageAdapter: StorageAdapter = new LocalStorageAdapter()
export default storageAdapter

