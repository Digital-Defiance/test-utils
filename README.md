# @digitaldefiance/express-suite-test-utils

Test utilities for Digital Defiance Express Suite projects.

Part of [Express Suite](https://github.com/Digital-Defiance/express-suite)

## Installation

```bash
npm install @digitaldefiance/express-suite-test-utils
# or
yarn add @digitaldefiance/express-suite-test-utils
```

## Usage

### Importing Test Utilities from Express Suite Packages

Test helpers and mocks are available via separate `/testing` entry points:

```typescript
// node-express-suite test helpers
import { 
  createApplicationMock,
  setupTestEnv
} from '@digitaldefiance/node-express-suite/testing';

// node-ecies-lib test mocks
import { mockBackendMember } from '@digitaldefiance/node-ecies-lib/testing';

// ecies-lib test mocks
import { mockFrontendMember } from '@digitaldefiance/ecies-lib/testing';

// Use in your tests
beforeAll(async () => {
  await setupTestEnv();
});
```

**Note:** All `/testing` entry points require `@faker-js/faker` as a peer dependency:

```bash
npm install -D @faker-js/faker
# or
yarn add -D @faker-js/faker
```

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

### Direct Log Mocks

Mock `fs.writeSync` for testing direct console output:

```typescript
import { withDirectLogMocks, directLogContains, getDirectLogMessages } from '@digitaldefiance/express-suite-test-utils';
import * as fs from 'fs';

// Important: Mock fs module at module level before importing
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeSync: jest.fn(),
}));

it('should capture direct writes to stdout', async () => {
  await withDirectLogMocks({ mute: true }, async (spies) => {
    const buffer = Buffer.from('hello world\n', 'utf8');
    fs.writeSync(1, buffer); // stdout
    
    expect(directLogContains(spies.writeSync, 1, 'hello', 'world')).toBe(true);
    expect(getDirectLogMessages(spies.writeSync, 1)).toEqual(['hello world\n']);
  });
});
```

### Mongoose Memory Database

In-memory MongoDB testing utilities using mongodb-memory-server:

```typescript
import { connectMemoryDB, disconnectMemoryDB, clearMemoryDB } from '@digitaldefiance/express-suite-test-utils';
import { User } from './models/user';

describe('User model', () => {
  beforeAll(async () => {
    await connectMemoryDB();
  });

  afterAll(async () => {
    await disconnectMemoryDB();
  });

  afterEach(async () => {
    await clearMemoryDB();
  });

  it('should validate user schema', async () => {
    const user = new User({ username: 'test', email: 'test@example.com' });
    await user.validate(); // Real Mongoose validation!
    
    await expect(async () => {
      const invalid = new User({ username: 'ab' }); // too short
      await invalid.validate();
    }).rejects.toThrow();
  });
});
```

**Note:** Requires `mongoose` as a peer dependency and `mongodb-memory-server` as a dependency (already included).

## License

MIT

## ChangeLog

### v1.0.10

- Fix direct-log mocks to work with non-configurable fs.writeSync in newer Node.js versions
- Add comprehensive mongoose memory database testing utilities
- Fix memory mongoose connectMemoryDB


### v1.0.9

- Add mongoose memory helpers

### v1.0.8

- Add directLog mocks

### v1.0.6

- Add react mocks

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
