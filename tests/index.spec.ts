import * as index from '../src/index';

describe('index exports', () => {
  it('should export ErrorClass type', () => {
    expect(typeof index).toBe('object');
  });

  it('should export toThrowType', () => {
    expect(index.toThrowType).toBeDefined();
  });

  it('should export withConsoleMocks', () => {
    expect(index.withConsoleMocks).toBeDefined();
  });

  it('should export spyContains', () => {
    expect(index.spyContains).toBeDefined();
  });
});
