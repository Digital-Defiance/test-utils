import { mockTimezones, mockGetInitialTimezone, mockRegisterFormProps } from '../src/lib/react-mocks';

describe('react-mocks', () => {
  describe('mockTimezones', () => {
    it('should provide an array of timezone strings', () => {
      expect(Array.isArray(mockTimezones)).toBe(true);
      expect(mockTimezones.length).toBeGreaterThan(0);
      expect(mockTimezones).toContain('UTC');
    });
  });

  describe('mockGetInitialTimezone', () => {
    it('should return UTC as default timezone', () => {
      expect(mockGetInitialTimezone()).toBe('UTC');
    });
  });

  describe('mockRegisterFormProps', () => {
    it('should provide complete RegisterForm props', () => {
      expect(mockRegisterFormProps).toHaveProperty('timezones');
      expect(mockRegisterFormProps).toHaveProperty('getInitialTimezone');
      expect(mockRegisterFormProps).toHaveProperty('onSubmit');
    });

    it('should have timezones array', () => {
      expect(Array.isArray(mockRegisterFormProps.timezones)).toBe(true);
    });

    it('should have getInitialTimezone function', () => {
      expect(typeof mockRegisterFormProps.getInitialTimezone).toBe('function');
      expect(mockRegisterFormProps.getInitialTimezone()).toBe('UTC');
    });

    it('should have onSubmit mock function', () => {
      expect(jest.isMockFunction(mockRegisterFormProps.onSubmit)).toBe(true);
    });
  });
});
