import { LEAD_STATUSES, LEAD_STATUS_OPTIONS } from '@/constants/leadStatuses';

describe('smoke — test runner is working', () => {
  it('LEAD_STATUSES has the expected values', () => {
    expect(LEAD_STATUSES.NEW).toBe('New');
    expect(LEAD_STATUSES.WON).toBe('Won');
    expect(LEAD_STATUSES.LOST).toBe('Lost');
  });

  it('LEAD_STATUS_OPTIONS is an array derived from LEAD_STATUSES', () => {
    expect(Array.isArray(LEAD_STATUS_OPTIONS)).toBe(true);
    expect(LEAD_STATUS_OPTIONS).toContain('New');
    expect(LEAD_STATUS_OPTIONS.length).toBe(Object.keys(LEAD_STATUSES).length);
  });
});
