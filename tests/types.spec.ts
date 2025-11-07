import { ErrorClass } from '../src/lib/to-throw-type';

class TestError extends Error {
  constructor(public code: number) {
    super('Test error');
  }
}

describe('ErrorClass type', () => {
  it('should accept error constructor', () => {
    const ErrorType: ErrorClass<TestError> = TestError;
    const instance = new ErrorType(404);
    expect(instance).toBeInstanceOf(TestError);
    expect(instance.code).toBe(404);
  });

  it('should work with built-in Error', () => {
    const ErrorType: ErrorClass<Error> = Error;
    const instance = new ErrorType('test');
    expect(instance).toBeInstanceOf(Error);
    expect(instance.message).toBe('test');
  });
});
