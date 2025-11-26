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

## Testing Approach

This package provides comprehensive testing utilities for Express Suite projects, including custom Jest matchers, console mocks, database helpers, and more.

### Test Utilities Overview

**Custom Matchers**: `toThrowType` for type-safe error testing  
**Console Mocks**: Mock and spy on console methods  
**Direct Log Mocks**: Mock `fs.writeSync` for stdout/stderr testing  
**Database Helpers**: MongoDB Memory Server integration  
**React Mocks**: Mock React components and hooks

### Usage Patterns

#### Using toThrowType Matcher

```typescript
import '@digitaldefiance/express-suite-test-utils';

class CustomError extends Error {
  constructor(public code: number) {
    super('Custom error');
  }
}

describe('Error Testing', () => {
  it('should throw specific error type', () => {
    expect(() => {
      throw new CustomError(404);
    }).toThrowType(CustomError);
  });

  it('should validate error properties', () => {
    expect(() => {
      throw new CustomError(404);
    }).toThrowType(CustomError, (error) => {
      expect(error.code).toBe(404);
    });
  });
});
```

#### Using Console Mocks

```typescript
import { withConsoleMocks, spyContains } from '@digitaldefiance/express-suite-test-utils';

describe('Console Output', () => {
  it('should capture console.log', async () => {
    await withConsoleMocks({ mute: true }, async (spies) => {
      console.log('test message');
      
      expect(spies.log).toHaveBeenCalledWith('test message');
      expect(spyContains(spies.log, 'test', 'message')).toBe(true);
    });
  });

  it('should capture console.error', async () => {
    await withConsoleMocks({ mute: true }, async (spies) => {
      console.error('error message');
      
      expect(spies.error).toHaveBeenCalledWith('error message');
    });
  });
});
```

#### Using Direct Log Mocks

```typescript
import { withDirectLogMocks, directLogContains, getDirectLogMessages } from '@digitaldefiance/express-suite-test-utils';
import * as fs from 'fs';

// Mock fs at module level
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeSync: jest.fn(),
}));

describe('Direct Logging', () => {
  it('should capture stdout writes', async () => {
    await withDirectLogMocks({ mute: true }, async (spies) => {
      const buffer = Buffer.from('hello world\n', 'utf8');
      fs.writeSync(1, buffer); // stdout
      
      expect(directLogContains(spies.writeSync, 1, 'hello', 'world')).toBe(true);
      expect(getDirectLogMessages(spies.writeSync, 1)).toEqual(['hello world\n']);
    });
  });
});
```

#### Using MongoDB Memory Server

```typescript
import { connectMemoryDB, disconnectMemoryDB, clearMemoryDB } from '@digitaldefiance/express-suite-test-utils';
import { User } from './models/user';

describe('Database Tests', () => {
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
    const user = new User({ 
      username: 'test', 
      email: 'test@example.com' 
    });
    
    await user.validate(); // Real Mongoose validation!
    await user.save();
    
    const found = await User.findOne({ username: 'test' });
    expect(found).toBeDefined();
  });

  it('should reject invalid data', async () => {
    const invalid = new User({ username: 'ab' }); // too short
    
    await expect(invalid.validate()).rejects.toThrow();
  });
});
```

### Testing Best Practices

1. **Always clean up** after tests (disconnect DB, restore mocks)
2. **Use memory database** for fast, isolated tests
3. **Mock external dependencies** to avoid side effects
4. **Test error conditions** with `toThrowType` matcher
5. **Capture console output** when testing logging behavior

### Cross-Package Testing

These utilities are designed to work seamlessly with all Express Suite packages:

```typescript
import { connectMemoryDB, disconnectMemoryDB } from '@digitaldefiance/express-suite-test-utils';
import { Application } from '@digitaldefiance/node-express-suite';
import { UserService } from '@digitaldefiance/node-express-suite';

describe('Integration Tests', () => {
  let app: Application;

  beforeAll(async () => {
    await connectMemoryDB();
    app = new Application({
      mongoUri: global.__MONGO_URI__,
      jwtSecret: 'test-secret'
    });
  });

  afterAll(async () => {
    await app.stop();
    await disconnectMemoryDB();
  });

  it('should create and find user', async () => {
    const userService = new UserService(app);
    const user = await userService.create({
      username: 'alice',
      email: 'alice@example.com'
    });
    
    const found = await userService.findByUsername('alice');
    expect(found).toBeDefined();
  });
});
```

## License

MIT

## ChangeLog

### v1.0.11

- Fix mongoose to use @digitaldefiance/mongoose-types

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
