import {
  PROPERTY_TYPES,
  BUDGET_RANGES,
  LEAD_PURPOSES,
  CONTACT_METHODS,
} from '@/constants/leadFormOptions';

describe('leadFormOptions constants', () => {
  it('PROPERTY_TYPES is a non-empty array of strings', () => {
    expect(Array.isArray(PROPERTY_TYPES)).toBe(true);
    expect(PROPERTY_TYPES.length).toBeGreaterThan(0);
    PROPERTY_TYPES.forEach((t) => expect(typeof t).toBe('string'));
  });

  it('BUDGET_RANGES is a non-empty array of strings', () => {
    expect(Array.isArray(BUDGET_RANGES)).toBe(true);
    expect(BUDGET_RANGES.length).toBeGreaterThan(0);
    BUDGET_RANGES.forEach((r) => expect(typeof r).toBe('string'));
  });

  it('LEAD_PURPOSES contains Buy and Invest', () => {
    expect(LEAD_PURPOSES).toContain('Buy');
    expect(LEAD_PURPOSES).toContain('Invest');
  });

  it('CONTACT_METHODS each have a label and a value', () => {
    expect(Array.isArray(CONTACT_METHODS)).toBe(true);
    CONTACT_METHODS.forEach((method) => {
      expect(typeof method.label).toBe('string');
      expect(typeof method.value).toBe('string');
    });
  });
});
