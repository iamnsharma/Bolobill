type StorageAdapter = {
  set: (key: string, value: string | number | boolean) => void;
  getString: (key: string) => string | undefined;
  getBoolean: (key: string) => boolean | undefined;
  delete: (key: string) => void;
};

const memoryStore = new Map<string, string | number | boolean>();

const memoryStorage: StorageAdapter = {
  set: (key, value) => {
    memoryStore.set(key, value);
  },
  getString: key => {
    const value = memoryStore.get(key);
    return typeof value === 'string' ? value : undefined;
  },
  getBoolean: key => {
    const value = memoryStore.get(key);
    return typeof value === 'boolean' ? value : undefined;
  },
  delete: key => {
    memoryStore.delete(key);
  },
};

const createStorage = (): StorageAdapter => {
  try {
    // Handle both MMKV APIs across versions/environments.
    const mmkvModule = require('react-native-mmkv');
    const nativeStorage =
      typeof mmkvModule.createMMKV === 'function'
        ? mmkvModule.createMMKV({id: 'bolobill-storage'})
        : typeof mmkvModule.MMKV === 'function'
        ? new mmkvModule.MMKV({id: 'bolobill-storage'})
        : undefined;

    if (!nativeStorage) {
      throw new Error('MMKV API not available');
    }

    return {
      set: (key, value) => nativeStorage.set(key, value),
      getString: key => nativeStorage.getString(key),
      getBoolean: key => nativeStorage.getBoolean(key),
      delete: key => {
        if (typeof nativeStorage.remove === 'function') {
          nativeStorage.remove(key);
        } else if (typeof nativeStorage.delete === 'function') {
          nativeStorage.delete(key);
        }
      },
    };
  } catch (error) {
    console.warn('MMKV unavailable, using in-memory storage fallback.', error);
    return memoryStorage;
  }
};

export const storage = createStorage();
