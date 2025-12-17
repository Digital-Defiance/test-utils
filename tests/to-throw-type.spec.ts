import '../src/lib/to-throw-type';

class CustomError extends Error {
  constructor(public code: number) {
    super('Custom error');
    this.name = 'CustomError';
  }
}

describe('toThrowType', () => {
  it('should pass when function throws expected error type', () => {
    expect(() => {
      throw new CustomError(404);
    }).toThrowType(CustomError);
  });

  it('should pass with validator', () => {
    expect(() => {
      throw new CustomError(404);
    }).toThrowType(CustomError, (error) => {
      expect(error.code).toBe(404);
    });
  });

  it('should handle async functions', async () => {
    await expect(async () => {
      throw new CustomError(404);
    }).toThrowType(CustomError);
  });

  it('should handle async validator', async () => {
    await expect(async () => {
      throw new CustomError(404);
    }).toThrowType(CustomError, async (error) => {
      expect(error.code).toBe(404);
    });
  });

  it('should handle promise rejection', async () => {
    await expect(Promise.reject(new CustomError(404))).rejects.toThrow(
      CustomError
    );
  });

  it('should handle isNot flag', () => {
    expect(() => {
      // no throw
    }).not.toThrowType(CustomError);
  });

  it('should handle error without stack', () => {
    const errorWithoutStack = new CustomError(404);
    delete (errorWithoutStack as Error & { stack?: string }).stack;
    expect(() => {
      throw errorWithoutStack;
    }).toThrowType(CustomError);
  });
});
