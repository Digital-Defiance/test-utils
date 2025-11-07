# @digitaldefiance/express-suite-test-utils

Test utilities for Digital Defiance Express Suite projects.

## Installation

```bash
npm install @digitaldefiance/express-suite-test-utils
# or
yarn add @digitaldefiance/express-suite-test-utils
```

## Usage

### toThrowType Matcher

Custom Jest matcher for testing error types with optional validation:

```typescript
import '@digitaldefiance/express-suite-test-utils';

class CustomError extends Error {
  constructor(public code: number) {
    super('Custom error');
  }
}

// Basic usage
expect(() => {
  throw new CustomError(404);
}).toThrowType(CustomError);

// With validator
expect(() => {
  throw new CustomError(404);
}).toThrowType(CustomError, (error) => {
  expect(error.code).toBe(404);
});
```

### ErrorClass Type

```typescript
import { ErrorClass } from '@digitaldefiance/express-suite-test-utils';

function testError<E extends Error>(ErrorType: ErrorClass<E>) {
  // Use ErrorType constructor
}
```

### Console Mocks

Mock console methods in tests:

```typescript
import { withConsoleMocks, spyContains } from '@digitaldefiance/express-suite-test-utils';

it('should log message', async () => {
  await withConsoleMocks({ mute: true }, async (spies) => {
    console.log('test message');
    expect(spies.log).toHaveBeenCalledWith('test message');
    expect(spyContains(spies.log, 'test', 'message')).toBe(true);
  });
});
```

## License

MIT

## ChangeLog

### v1.0.5

- Add secp256k to BSON mock

### v1.0.4

- Add BSON mock

### v1.0.3

- Add jest global declaration for toThrowType

### v1.0.2

- Add LocalStorageMock

### v1.0.1

- Bugfix release, fixing lack of js files in tarball

### v1.0.0

- Initial Release
