import * as fs from 'fs';

/**
 * Spies returned from withDirectLogMocks
 */
export interface DirectLogSpies {
  writeSync: jest.SpyInstance;
}

/**
 * Options for withDirectLogMocks
 */
export interface WithDirectLogOptions {
  /**
   * If false, do not mute the output (let it pass through).
   * By default (true), mutes output.
   */
  mute?: boolean;
}

/**
 * Wrap a test body with fs.writeSync spy for directLog testing.
 * By default mutes output (does nothing on write).
 * The spy will capture calls with file descriptor and buffer.
 */
export async function withDirectLogMocks<T = unknown>(
  options: WithDirectLogOptions,
  fn: (spies: DirectLogSpies) => Promise<T> | T,
): Promise<T> {
  const mute = options?.mute !== false; // default true
  const noop = () => undefined;
  const originalWriteSync = fs.writeSync;
  
  const writeSync = jest
    .spyOn(fs, 'writeSync')
    .mockImplementation(
      mute
        ? noop as any
        : (originalWriteSync as any)
    );
  
  const spies: DirectLogSpies = { writeSync };
  
  try {
    return await fn(spies);
  } finally {
    writeSync.mockRestore();
  }
}

/**
 * Helper to check if writeSync was called with a specific file descriptor and message.
 * @param spy The writeSync spy
 * @param fd The file descriptor (1 for stdout, 2 for stderr)
 * @param needles Substrings to search for in the buffer content
 */
export function directLogContains(
  spy: jest.SpyInstance,
  fd: number,
  ...needles: string[]
): boolean {
  return spy.mock.calls.some((args: unknown[]) => {
    const [calledFd, buffer] = args;
    if (calledFd !== fd) return false;
    
    const text = buffer instanceof Buffer 
      ? buffer.toString('utf8') 
      : String(buffer);
    
    return needles.every((n) => text.includes(n));
  });
}

/**
 * Get all messages written to a specific file descriptor.
 * @param spy The writeSync spy
 * @param fd The file descriptor (1 for stdout, 2 for stderr)
 */
export function getDirectLogMessages(
  spy: jest.SpyInstance,
  fd: number,
): string[] {
  return spy.mock.calls
    .filter((args: unknown[]) => args[0] === fd)
    .map((args: unknown[]) => {
      const buffer = args[1];
      return buffer instanceof Buffer 
        ? buffer.toString('utf8') 
        : String(buffer);
    });
}
