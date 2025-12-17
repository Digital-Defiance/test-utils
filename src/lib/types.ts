/// <reference types="jest" />

export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toThrowType<E extends Error, T extends new (...args: any[]) => E>(
        errorType: T,
        validator?: (error: E) => void
      ): R;
    }
  }
}

declare module 'expect' {
  interface ExpectExtendMap {
    toThrowType: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <E extends Error, T extends new (...args: any[]) => E>(
        this: jest.MatcherContext,
        received: () => unknown,
        errorType: T,
        validator?: (error: E) => void
      ): jest.CustomMatcherResult;
    };
  }
}
