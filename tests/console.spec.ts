import { withConsoleMocks, spyContains } from '../src/lib/console';

describe('console mocks', () => {
  describe('withConsoleMocks', () => {
    it('should spy on console methods with mute=true', async () => {
      await withConsoleMocks({ mute: true }, async (spies) => {
        console.log('test log');
        console.info('test info');
        console.warn('test warn');
        console.error('test error');
        console.debug('test debug');

        expect(spies.log).toHaveBeenCalledWith('test log');
        expect(spies.info).toHaveBeenCalledWith('test info');
        expect(spies.warn).toHaveBeenCalledWith('test warn');
        expect(spies.error).toHaveBeenCalledWith('test error');
        expect(spies.debug).toHaveBeenCalledWith('test debug');
      });
    });

    it('should spy on console methods with mute=false', async () => {
      const originalLog = console.log;
      const logSpy = jest.fn();
      console.log = logSpy;
      
      await withConsoleMocks({ mute: false }, async (spies) => {
        expect(spies.log).toBeDefined();
      });
      
      console.log = originalLog;
    });

    it('should restore spies after execution', async () => {
      const originalLog = console.log;
      await withConsoleMocks({ mute: true }, async () => {
        // inside mock
      });
      expect(console.log).toBe(originalLog);
    });

    it('should restore spies even if function throws', async () => {
      const originalLog = console.log;
      try {
        await withConsoleMocks({ mute: true }, async () => {
          throw new Error('test error');
        });
      } catch {
        // expected
      }
      expect(console.log).toBe(originalLog);
    });

    it('should return function result', async () => {
      const result = await withConsoleMocks({ mute: true }, async () => {
        return 'test result';
      });
      expect(result).toBe('test result');
    });

    it('should handle sync functions', async () => {
      const result = await withConsoleMocks({ mute: true }, (spies) => {
        console.log('sync');
        expect(spies.log).toHaveBeenCalledWith('sync');
        return 42;
      });
      expect(result).toBe(42);
    });
  });

  describe('spyContains', () => {
    it('should return true when spy contains all needles', async () => {
      await withConsoleMocks({ mute: true }, async (spies) => {
        console.log('hello world test');
        expect(spyContains(spies.log, 'hello', 'world')).toBe(true);
      });
    });

    it('should return false when spy does not contain all needles', async () => {
      await withConsoleMocks({ mute: true }, async (spies) => {
        console.log('hello world');
        expect(spyContains(spies.log, 'hello', 'missing')).toBe(false);
      });
    });

    it('should handle multiple calls', async () => {
      await withConsoleMocks({ mute: true }, async (spies) => {
        console.log('first call');
        console.log('second call with target');
        expect(spyContains(spies.log, 'target')).toBe(true);
      });
    });

    it('should handle non-string arguments', async () => {
      await withConsoleMocks({ mute: true }, async (spies) => {
        console.log('text', 123, { obj: 'value' });
        expect(spyContains(spies.log, 'text')).toBe(true);
      });
    });

    it('should return false for empty spy', async () => {
      await withConsoleMocks({ mute: true }, async (spies) => {
        expect(spyContains(spies.log, 'anything')).toBe(false);
      });
    });


  });
});
