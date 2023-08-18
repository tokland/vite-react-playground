export interface KeyValueStorage {
    get<T>(key: string): T | undefined;
    set<T>(key: string, value: T): void;
}

export class InMemoryKeyValueStorage implements KeyValueStorage {
    private cache: Map<string, string> = new Map();

    get<T>(key: string): T {
        const value = this.cache.get(key);
        return value ? JSON.parse(value) : undefined;
    }

    set<T>(key: string, value: T): void {
        this.cache.set(key, JSON.stringify(value));
    }
}

export class BrowserKeyValueStorage implements KeyValueStorage {
    get<T>(key: string): T | undefined {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : undefined;
    }

    set<T>(key: string, value: T): void {
        localStorage.setItem(key, JSON.stringify(value));
    }
}
