import * as fs from 'fs';

/**
 * Spies returned from withDirectLogMocks
 */
export interface DirectLogSpies {
  writeSync: jest.Mock;
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
 * 
 * Note: Requires fs module to be mocked at module level with jest.mock('fs')
 */
export async function withDirectLogMocks<T = unknown>(
  options: WithDirectLogOptions,
  fn: (spies: DirectLogSpies) => Promise<T> | T,
): Promise<T> {
  const mute = options?.mute !== false; // default true
  
  // Get the mocked writeSync function
  const writeSync = fs.writeSync as unknown as jest.Mock;
  
  // Store previous mock implementation if any
  const previousImpl = writeSync.getMockImplementation();
  
  // Set implementation based on mute option
  if (mute) {
    writeSync.mockImplementation(() => undefined);
  } else {
    // Pass through - requires original implementation to be available
    writeSync.mockImplementation((...args: any[]) => {
      // In test environment, we can't easily call the real fs.writeSync
      // so we just no-op but track the calls
      return args[1]?.length || 0;
    });
  }
  
  const spies: DirectLogSpies = { writeSync };
  
  try {
    return await fn(spies);
  } finally {
    // Clear calls and restore previous implementation
    writeSync.mockClear();
    if (previousImpl) {
      writeSync.mockImplementation(previousImpl);
    }
  }
}

/**
 * Helper to check if writeSync was called with a specific file descriptor and message.
 * @param spy The writeSync mock
 * @param fd The file descriptor (1 for stdout, 2 for stderr)
 * @param needles Substrings to search for in the buffer content
 */
export function directLogContains(
  spy: jest.Mock,
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
 * @param spy The writeSync mock
 * @param fd The file descriptor (1 for stdout, 2 for stderr)
 */
export function getDirectLogMessages(
  spy: jest.Mock,
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
