/**
 * Mock utilities for React component testing
 */

/**
 * Mock timezones for testing
 */
export const mockTimezones = [
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'UTC',
];

/**
 * Get initial timezone mock
 */
export const mockGetInitialTimezone = (): string => 'UTC';

/**
 * Mock RegisterForm props
 */
export const mockRegisterFormProps = {
  timezones: mockTimezones,
  getInitialTimezone: mockGetInitialTimezone,
  onSubmit: jest.fn().mockResolvedValue({ success: true, message: 'Success' }),
};
