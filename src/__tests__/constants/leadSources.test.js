import { LEAD_SOURCES, LEAD_SOURCE_OPTIONS } from '@/constants/leadSources';

describe('leadSources constants', () => {
  it('has the expected source keys and values', () => {
    expect(LEAD_SOURCES.WEBSITE).toBe('website');
    expect(LEAD_SOURCES.MANUAL).toBe('manual');
    expect(LEAD_SOURCES.CSV).toBe('csv');
    expect(LEAD_SOURCES.API_WEBHOOK).toBe('api/webhook');
  });

  it('LEAD_SOURCE_OPTIONS contains all source values', () => {
    expect(Array.isArray(LEAD_SOURCE_OPTIONS)).toBe(true);
    expect(LEAD_SOURCE_OPTIONS).toEqual(Object.values(LEAD_SOURCES));
  });
});
