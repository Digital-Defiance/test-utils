/**
 * Integration test for createI18nSetup factory across the full monorepo dependency chain.
 *
 * Validates that all components (core, suite-core, ecies, node-ecies) can be registered
 * via the factory and that branded enum translateStringKey works for every component.
 *
 * Lives in express-suite-test-utils to avoid circular dependencies — this package
 * sits at the top of the dependency chain and can import from all library packages.
 *
 * Uses dynamic require() so Nx does not detect static imports and create a
 * build-graph circular dependency (i18n-lib → test-utils → i18n-lib).
 */

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

// Build module names dynamically so Nx static analysis does not detect them
// as build-time dependencies (avoids circular dependency in the task graph).
const org = '@digitaldefiance';
const i18nLib = require(`${org}/i18n-lib`);
const suiteCoreLib = require(`${org}/suite-core-lib`);
const eciesLib = require(`${org}/ecies-lib`);
const nodeEciesLib = require(`${org}/node-ecies-lib`);

const {
  createI18nSetup,
  I18nEngine,
  LanguageCodes,
  createI18nStringKeys,
} = i18nLib;

const {
  createSuiteCoreComponentPackage,
  SuiteCoreStringKey,
  SuiteCoreComponentId,
} = suiteCoreLib;

const {
  createEciesComponentPackage,
  EciesStringKey,
  EciesComponentId,
} = eciesLib;

const {
  createNodeEciesComponentPackage,
  NodeEciesStringKey,
  NodeEciesComponentId,
} = nodeEciesLib;

// A fake "app" component to act as the consumer
const AppComponentId = 'test-app' as const;
const AppStringKey = createI18nStringKeys(AppComponentId, {
  Greeting: 'greeting',
  Farewell: 'farewell',
} as const);

const appStrings = {
  [LanguageCodes.EN_US]: {
    [AppStringKey.Greeting]: 'Hello',
    [AppStringKey.Farewell]: 'Goodbye',
  },
  [LanguageCodes.FR]: {
    [AppStringKey.Greeting]: 'Bonjour',
    [AppStringKey.Farewell]: 'Au revoir',
  },
};

describe('createI18nSetup factory - full monorepo integration', () => {
  beforeEach(() => {
    I18nEngine.resetAll();
  });

  afterAll(() => {
    I18nEngine.resetAll();
  });

  it('should register all components and translate via branded enums', () => {
    const result = createI18nSetup({
      componentId: AppComponentId,
      stringKeyEnum: AppStringKey,
      strings: appStrings,
      libraryComponents: [
        createSuiteCoreComponentPackage(),
        createEciesComponentPackage(),
        createNodeEciesComponentPackage(),
      ],
    });

    const engine = result.engine;

    // All components registered
    expect(engine.hasComponent(SuiteCoreComponentId)).toBe(true);
    expect(engine.hasComponent(EciesComponentId)).toBe(true);
    expect(engine.hasComponent(NodeEciesComponentId)).toBe(true);
    expect(engine.hasComponent(AppComponentId)).toBe(true);

    // All branded enums registered
    expect(engine.hasStringKeyEnum(SuiteCoreStringKey)).toBe(true);
    expect(engine.hasStringKeyEnum(EciesStringKey)).toBe(true);
    expect(engine.hasStringKeyEnum(NodeEciesStringKey)).toBe(true);
    expect(engine.hasStringKeyEnum(AppStringKey)).toBe(true);

    // translateStringKey works for each component's branded enum
    const suiteCoreResult = engine.translateStringKey(
      SuiteCoreStringKey.Auth_UserNotFound,
      undefined,
      LanguageCodes.EN_US,
    );
    expect(typeof suiteCoreResult).toBe('string');
    expect(suiteCoreResult.length).toBeGreaterThan(0);

    const eciesResult = engine.translateStringKey(
      EciesStringKey.Error_ECIESError_InvalidECIESPublicKeyLength,
      undefined,
      LanguageCodes.EN_US,
    );
    expect(typeof eciesResult).toBe('string');
    expect(eciesResult.length).toBeGreaterThan(0);

    const nodeEciesResult = engine.translateStringKey(
      NodeEciesStringKey.Error_Member_MissingMemberName,
      undefined,
      LanguageCodes.EN_US,
    );
    expect(typeof nodeEciesResult).toBe('string');
    expect(nodeEciesResult.length).toBeGreaterThan(0);

    const appResult = engine.translateStringKey(
      AppStringKey.Greeting,
      undefined,
      LanguageCodes.EN_US,
    );
    expect(appResult).toBe('Hello');
  });

  it('should handle re-registration gracefully when a superset consumer overlaps with a subset', () => {
    // Simulate "lib" registering suite-core only
    const libResult = createI18nSetup({
      componentId: AppComponentId,
      stringKeyEnum: AppStringKey,
      strings: appStrings,
      libraryComponents: [createSuiteCoreComponentPackage()],
      instanceKey: 'shared',
    });

    // Simulate "api-lib" registering suite-core + ecies + node-ecies (superset, re-registers suite-core)
    const ApiComponentId = 'test-api' as const;
    const ApiStringKey = createI18nStringKeys(ApiComponentId, {
      ApiStatus: 'api_status',
    } as const);

    const apiResult = createI18nSetup({
      componentId: ApiComponentId,
      stringKeyEnum: ApiStringKey,
      strings: {
        [LanguageCodes.EN_US]: { [ApiStringKey.ApiStatus]: 'OK' },
      },
      libraryComponents: [
        createSuiteCoreComponentPackage(), // re-registration
        createEciesComponentPackage(),
        createNodeEciesComponentPackage(),
      ],
      instanceKey: 'shared',
    });

    // Same engine instance
    expect(libResult.engine).toBe(apiResult.engine);

    const engine = apiResult.engine;

    // All components present (original + superset additions)
    expect(engine.hasComponent(SuiteCoreComponentId)).toBe(true);
    expect(engine.hasComponent(EciesComponentId)).toBe(true);
    expect(engine.hasComponent(NodeEciesComponentId)).toBe(true);
    expect(engine.hasComponent(AppComponentId)).toBe(true);
    expect(engine.hasComponent(ApiComponentId)).toBe(true);

    // All branded enums work
    expect(engine.hasStringKeyEnum(SuiteCoreStringKey)).toBe(true);
    expect(engine.hasStringKeyEnum(EciesStringKey)).toBe(true);
    expect(engine.hasStringKeyEnum(NodeEciesStringKey)).toBe(true);
    expect(engine.hasStringKeyEnum(AppStringKey)).toBe(true);
    expect(engine.hasStringKeyEnum(ApiStringKey)).toBe(true);

    // Translations from every component still work
    expect(
      engine.translateStringKey(SuiteCoreStringKey.Auth_UserNotFound, undefined, LanguageCodes.EN_US),
    ).toBe('User account not found');

    expect(
      engine.translateStringKey(EciesStringKey.Error_ECIESError_InvalidECIESPublicKeyLength, undefined, LanguageCodes.EN_US),
    ).toBe('Invalid ECIES public key length');

    expect(
      engine.translateStringKey(NodeEciesStringKey.Error_Member_MissingMemberName, undefined, LanguageCodes.EN_US),
    ).toBe('Member name is required');

    expect(
      engine.translateStringKey(AppStringKey.Greeting, undefined, LanguageCodes.EN_US),
    ).toBe('Hello');

    expect(
      engine.translateStringKey(ApiStringKey.ApiStatus, undefined, LanguageCodes.EN_US),
    ).toBe('OK');
  });

  it('should support safeTranslateStringKey across all components', () => {
    const result = createI18nSetup({
      componentId: AppComponentId,
      stringKeyEnum: AppStringKey,
      strings: appStrings,
      libraryComponents: [
        createSuiteCoreComponentPackage(),
        createEciesComponentPackage(),
        createNodeEciesComponentPackage(),
      ],
    });

    const engine = result.engine;

    // safeTranslateStringKey returns translations, not placeholders
    const safe1 = engine.safeTranslateStringKey(SuiteCoreStringKey.Auth_UserNotFound, undefined, LanguageCodes.EN_US);
    expect(safe1).not.toContain('[unknown.');
    expect(safe1).toBe('User account not found');

    const safe2 = engine.safeTranslateStringKey(EciesStringKey.Error_ECIESError_InvalidECIESPublicKeyLength, undefined, LanguageCodes.EN_US);
    expect(safe2).not.toContain('[unknown.');

    const safe3 = engine.safeTranslateStringKey(NodeEciesStringKey.Error_Member_MissingMemberName, undefined, LanguageCodes.EN_US);
    expect(safe3).not.toContain('[unknown.');

    const safe4 = engine.safeTranslateStringKey(AppStringKey.Greeting, undefined, LanguageCodes.EN_US);
    expect(safe4).toBe('Hello');
  });

  it('should translate non-English languages across all components', () => {
    const result = createI18nSetup({
      componentId: AppComponentId,
      stringKeyEnum: AppStringKey,
      strings: appStrings,
      libraryComponents: [
        createSuiteCoreComponentPackage(),
        createEciesComponentPackage(),
        createNodeEciesComponentPackage(),
      ],
    });

    // App component French
    expect(
      result.engine.translateStringKey(AppStringKey.Greeting, undefined, LanguageCodes.FR),
    ).toBe('Bonjour');

    // SuiteCore French — just verify it returns a non-empty string (not a placeholder)
    const suiteFr = result.engine.translateStringKey(
      SuiteCoreStringKey.Auth_UserNotFound,
      undefined,
      LanguageCodes.FR,
    );
    expect(typeof suiteFr).toBe('string');
    expect(suiteFr.length).toBeGreaterThan(0);
  });

  it('should use the factory result translate/safeTranslate helpers', () => {
    const result = createI18nSetup({
      componentId: AppComponentId,
      stringKeyEnum: AppStringKey,
      strings: appStrings,
      libraryComponents: [
        createSuiteCoreComponentPackage(),
        createEciesComponentPackage(),
      ],
    });

    // The result's translate helper uses the app's branded enum type
    expect(result.translate(AppStringKey.Greeting, undefined, LanguageCodes.EN_US)).toBe('Hello');
    expect(result.safeTranslate(AppStringKey.Farewell, undefined, LanguageCodes.FR)).toBe('Au revoir');
  });
});
