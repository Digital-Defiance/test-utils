import { LocalStorageMock } from '../src/lib/localStorage-mock';

describe('LocalStorageMock', () => {
  let storage: LocalStorageMock;

  beforeEach(() => {
    storage = new LocalStorageMock();
  });

  describe('setItem and getItem', () => {
    it('should store and retrieve a value', () => {
      storage.setItem('key1', 'value1');
      expect(storage.getItem('key1')).toBe('value1');
    });

    it('should return null for non-existent key', () => {
      expect(storage.getItem('nonexistent')).toBeNull();
    });

    it('should overwrite existing value', () => {
      storage.setItem('key1', 'value1');
      storage.setItem('key1', 'value2');
      expect(storage.getItem('key1')).toBe('value2');
    });
  });

  describe('removeItem', () => {
    it('should remove an item', () => {
      storage.setItem('key1', 'value1');
      storage.removeItem('key1');
      expect(storage.getItem('key1')).toBeNull();
    });

    it('should not throw when removing non-existent key', () => {
      expect(() => storage.removeItem('nonexistent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should remove all items', () => {
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      storage.clear();
      expect(storage.getItem('key1')).toBeNull();
      expect(storage.getItem('key2')).toBeNull();
      expect(storage.length).toBe(0);
    });
  });

  describe('length', () => {
    it('should return 0 for empty storage', () => {
      expect(storage.length).toBe(0);
    });

    it('should return correct count', () => {
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      expect(storage.length).toBe(2);
    });

    it('should update after removal', () => {
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      storage.removeItem('key1');
      expect(storage.length).toBe(1);
    });
  });

  describe('key', () => {
    it('should return key at index', () => {
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      const key = storage.key(0);
      expect(key).toBeTruthy();
      expect(['key1', 'key2']).toContain(key);
    });

    it('should return null for out of bounds index', () => {
      storage.setItem('key1', 'value1');
      expect(storage.key(5)).toBeNull();
    });

    it('should return null for negative index', () => {
      storage.setItem('key1', 'value1');
      expect(storage.key(-1)).toBeNull();
    });
  });

  describe('global localStorage', () => {
    it('should be defined', () => {
      expect(globalThis.localStorage).toBeDefined();
    });

    it('should be an instance of LocalStorageMock', () => {
      expect(globalThis.localStorage).toBeInstanceOf(LocalStorageMock);
    });
  });
});
