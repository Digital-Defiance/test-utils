import {
  withDirectLogMocks,
  directLogContains,
  getDirectLogMessages,
} from '../src/lib/direct-log';
import * as fs from 'fs';

describe('direct-log mocks', () => {
  describe('withDirectLogMocks', () => {
    it('should spy on fs.writeSync with mute=true', async () => {
      await withDirectLogMocks({ mute: true }, async (spies) => {
        const buffer1 = Buffer.from('stdout message\n', 'utf8');
        const buffer2 = Buffer.from('stderr message\n', 'utf8');
        
        fs.writeSync(1, buffer1);
        fs.writeSync(2, buffer2);

        expect(spies.writeSync).toHaveBeenCalledWith(1, buffer1);
        expect(spies.writeSync).toHaveBeenCalledWith(2, buffer2);
        expect(spies.writeSync).toHaveBeenCalledTimes(2);
      });
    });

    it('should spy on fs.writeSync with mute=false', async () => {
      await withDirectLogMocks({ mute: false }, async (spies) => {
        expect(spies.writeSync).toBeDefined();
        // With mute=false, the spy passes through to the original implementation
        expect(spies.writeSync.mock).toBeDefined();
      });
    });

    it('should restore spy after execution', async () => {
      const originalWriteSync = fs.writeSync;
      await withDirectLogMocks({ mute: true }, async () => {
        // inside mock
      });
      expect(fs.writeSync).toBe(originalWriteSync);
    });

    it('should restore spy even if function throws', async () => {
      const originalWriteSync = fs.writeSync;
      try {
        await withDirectLogMocks({ mute: true }, async () => {
          throw new Error('test error');
        });
      } catch {
        // expected
      }
      expect(fs.writeSync).toBe(originalWriteSync);
    });

    it('should return function result', async () => {
      const result = await withDirectLogMocks({ mute: true }, async () => {
        return 'test result';
      });
      expect(result).toBe('test result');
    });

    it('should handle sync functions', async () => {
      const result = await withDirectLogMocks({ mute: true }, (spies) => {
        const buffer = Buffer.from('sync write\n', 'utf8');
        fs.writeSync(1, buffer);
        expect(spies.writeSync).toHaveBeenCalledWith(1, buffer);
        return 42;
      });
      expect(result).toBe(42);
    });

    it('should default mute to true when not specified', async () => {
      await withDirectLogMocks({}, async (spies) => {
        const buffer = Buffer.from('test\n', 'utf8');
        fs.writeSync(1, buffer);
        expect(spies.writeSync).toHaveBeenCalled();
      });
    });
  });

  describe('directLogContains', () => {
    it('should return true when writeSync contains all needles for stdout', async () => {
      await withDirectLogMocks({ mute: true }, async (spies) => {
        const buffer = Buffer.from('hello world test\n', 'utf8');
        fs.writeSync(1, buffer);
        expect(directLogContains(spies.writeSync, 1, 'hello', 'world')).toBe(
          true,
        );
      });
    });

    it('should return true when writeSync contains all needles for stderr', async () => {
      await withDirectLogMocks({ mute: true }, async (spies) => {
        const buffer = Buffer.from('error message\n', 'utf8');
        fs.writeSync(2, buffer);
        expect(directLogContains(spies.writeSync, 2, 'error')).toBe(true);
      });
    });

    it('should return false when writeSync does not contain all needles', async () => {
      await withDirectLogMocks({ mute: true }, async (spies) => {
        const buffer = Buffer.from('hello world\n', 'utf8');
        fs.writeSync(1, buffer);
        expect(directLogContains(spies.writeSync, 1, 'hello', 'missing')).toBe(
          false,
        );
      });
    });

    it('should return false when file descriptor does not match', async () => {
      await withDirectLogMocks({ mute: true }, async (spies) => {
        const buffer = Buffer.from('stdout message\n', 'utf8');
        fs.writeSync(1, buffer);
        expect(directLogContains(spies.writeSync, 2, 'stdout')).toBe(false);
      });
    });

    it('should handle multiple calls', async () => {
      await withDirectLogMocks({ mute: true }, async (spies) => {
        const buffer1 = Buffer.from('first call\n', 'utf8');
        const buffer2 = Buffer.from('second call with target\n', 'utf8');
        fs.writeSync(1, buffer1);
        fs.writeSync(1, buffer2);
        expect(directLogContains(spies.writeSync, 1, 'target')).toBe(true);
      });
    });

    it('should handle string buffers', async () => {
      await withDirectLogMocks({ mute: true }, async (spies) => {
        fs.writeSync(1, 'string message\n' as any);
        expect(directLogContains(spies.writeSync, 1, 'string')).toBe(true);
      });
    });

    it('should return false for empty spy', async () => {
      await withDirectLogMocks({ mute: true }, async (spies) => {
        expect(directLogContains(spies.writeSync, 1, 'anything')).toBe(false);
      });
    });

    it('should handle mixed file descriptors', async () => {
      await withDirectLogMocks({ mute: true }, async (spies) => {
        const buffer1 = Buffer.from('stdout\n', 'utf8');
        const buffer2 = Buffer.from('stderr\n', 'utf8');
        fs.writeSync(1, buffer1);
        fs.writeSync(2, buffer2);
        expect(directLogContains(spies.writeSync, 1, 'stdout')).toBe(true);
        expect(directLogContains(spies.writeSync, 2, 'stderr')).toBe(true);
        expect(directLogContains(spies.writeSync, 1, 'stderr')).toBe(false);
        expect(directLogContains(spies.writeSync, 2, 'stdout')).toBe(false);
      });
    });
  });

  describe('getDirectLogMessages', () => {
    it('should return messages for specific file descriptor', async () => {
      await withDirectLogMocks({ mute: true }, async (spies) => {
        const buffer1 = Buffer.from('message 1\n', 'utf8');
        const buffer2 = Buffer.from('message 2\n', 'utf8');
        fs.writeSync(1, buffer1);
        fs.writeSync(1, buffer2);

        const messages = getDirectLogMessages(spies.writeSync, 1);
        expect(messages).toEqual(['message 1\n', 'message 2\n']);
      });
    });

    it('should filter by file descriptor', async () => {
      await withDirectLogMocks({ mute: true }, async (spies) => {
        const buffer1 = Buffer.from('stdout\n', 'utf8');
        const buffer2 = Buffer.from('stderr\n', 'utf8');
        const buffer3 = Buffer.from('stdout 2\n', 'utf8');
        fs.writeSync(1, buffer1);
        fs.writeSync(2, buffer2);
        fs.writeSync(1, buffer3);

        const stdoutMessages = getDirectLogMessages(spies.writeSync, 1);
        const stderrMessages = getDirectLogMessages(spies.writeSync, 2);

        expect(stdoutMessages).toEqual(['stdout\n', 'stdout 2\n']);
        expect(stderrMessages).toEqual(['stderr\n']);
      });
    });

    it('should return empty array when no messages for fd', async () => {
      await withDirectLogMocks({ mute: true }, async (spies) => {
        const buffer = Buffer.from('stdout\n', 'utf8');
        fs.writeSync(1, buffer);

        const messages = getDirectLogMessages(spies.writeSync, 2);
        expect(messages).toEqual([]);
      });
    });

    it('should handle string buffers', async () => {
      await withDirectLogMocks({ mute: true }, async (spies) => {
        fs.writeSync(1, 'string message\n' as any);

        const messages = getDirectLogMessages(spies.writeSync, 1);
        expect(messages).toEqual(['string message\n']);
      });
    });

    it('should return empty array for empty spy', async () => {
      await withDirectLogMocks({ mute: true }, async (spies) => {
        const messages = getDirectLogMessages(spies.writeSync, 1);
        expect(messages).toEqual([]);
      });
    });

    it('should handle multiple file descriptors correctly', async () => {
      await withDirectLogMocks({ mute: true }, async (spies) => {
        const messages = [
          { fd: 1, text: 'stdout 1\n' },
          { fd: 2, text: 'stderr 1\n' },
          { fd: 1, text: 'stdout 2\n' },
          { fd: 2, text: 'stderr 2\n' },
          { fd: 1, text: 'stdout 3\n' },
        ];

        messages.forEach((msg) => {
          fs.writeSync(msg.fd, Buffer.from(msg.text, 'utf8'));
        });

        const stdoutMessages = getDirectLogMessages(spies.writeSync, 1);
        const stderrMessages = getDirectLogMessages(spies.writeSync, 2);

        expect(stdoutMessages).toEqual([
          'stdout 1\n',
          'stdout 2\n',
          'stdout 3\n',
        ]);
        expect(stderrMessages).toEqual(['stderr 1\n', 'stderr 2\n']);
      });
    });
  });
});
