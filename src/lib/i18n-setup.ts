/**
 * i18n Test Setup Helper
 *
 * Initializes all available i18n engines for testing.
 * Uses real i18n-lib implementations to expose real problems in tests.
 *
 * Usage:
 * ```typescript
 * import { setupI18nForTests } from '@digitaldefiance/express-suite-test-utils';
 *
 * let cleanupI18n: () => void;
 *
 * beforeAll(() => {
 *   cleanupI18n = setupI18nForTests();
 * });
 *
 * afterAll(() => {
 *   cleanupI18n();
 * });
 * ```
 */

// Type definitions for optional dependencies
type InitFunction = () => unknown;
type ResetFunction = () => void;

/**
 * Attempts to load and initialize an i18n module.
 * Returns the reset function if successful, undefined otherwise.
 */
function tryLoadModule(
  moduleName: string,
  initFnName: string,
  resetFnName: string,
): ResetFunction | undefined {
  try {
    // Dynamic require to handle optional dependencies
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const mod = require(moduleName);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const initFn = mod[initFnName] as InitFunction | undefined;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const resetFn = mod[resetFnName] as ResetFunction | undefined;

    if (initFn && typeof initFn === 'function') {
      initFn();
      return resetFn;
    }
  } catch {
    // Module not available, skip silently
  }
  return undefined;
}

/**
 * Initialize all available i18n engines for testing.
 *
 * This function attempts to initialize:
 * - suite-core-lib i18n engine (initSuiteCoreI18nEngine)
 * - ecies-lib i18n engine (getEciesI18nEngine)
 * - node-ecies-lib i18n engine (getNodeEciesI18nEngine)
 *
 * @returns A cleanup function that resets all initialized engines
 */
export function setupI18nForTests(): () => void {
  const resetFunctions: ResetFunction[] = [];

  // Try to initialize suite-core-lib
  const suiteCoreReset = tryLoadModule(
    '@digitaldefiance/suite-core-lib',
    'initSuiteCoreI18nEngine',
    'resetSuiteCoreI18nEngine',
  );
  if (suiteCoreReset) {
    resetFunctions.push(suiteCoreReset);
  }

  // Try to initialize ecies-lib
  const eciesReset = tryLoadModule(
    '@digitaldefiance/ecies-lib',
    'getEciesI18nEngine',
    'resetEciesI18nEngine',
  );
  if (eciesReset) {
    resetFunctions.push(eciesReset);
  }

  // Try to initialize node-ecies-lib
  const nodeEciesReset = tryLoadModule(
    '@digitaldefiance/node-ecies-lib',
    'getNodeEciesI18nEngine',
    'resetNodeEciesI18nEngine',
  );
  if (nodeEciesReset) {
    resetFunctions.push(nodeEciesReset);
  }

  // Return cleanup function
  return () => {
    for (const reset of resetFunctions) {
      try {
        reset();
      } catch {
        // Ignore cleanup errors
      }
    }
  };
}

/**
 * Initialize specific i18n engines for testing.
 *
 * @param engines - Array of engine names to initialize: 'suite-core', 'ecies', 'node-ecies'
 * @returns A cleanup function that resets the initialized engines
 */
export function setupSpecificI18nForTests(
  engines: Array<'suite-core' | 'ecies' | 'node-ecies'>,
): () => void {
  const resetFunctions: ResetFunction[] = [];

  const moduleMap: Record<
    string,
    { module: string; init: string; reset: string }
  > = {
    'suite-core': {
      module: '@digitaldefiance/suite-core-lib',
      init: 'initSuiteCoreI18nEngine',
      reset: 'resetSuiteCoreI18nEngine',
    },
    ecies: {
      module: '@digitaldefiance/ecies-lib',
      init: 'getEciesI18nEngine',
      reset: 'resetEciesI18nEngine',
    },
    'node-ecies': {
      module: '@digitaldefiance/node-ecies-lib',
      init: 'getNodeEciesI18nEngine',
      reset: 'resetNodeEciesI18nEngine',
    },
  };

  for (const engine of engines) {
    const config = moduleMap[engine];
    if (config) {
      const resetFn = tryLoadModule(config.module, config.init, config.reset);
      if (resetFn) {
        resetFunctions.push(resetFn);
      }
    }
  }

  return () => {
    for (const reset of resetFunctions) {
      try {
        reset();
      } catch {
        // Ignore cleanup errors
      }
    }
  };
}
