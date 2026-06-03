import { ACTIVITY_TYPES, MANUAL_ACTIVITY_OPTIONS } from '@/constants/activityTypes';

describe('activityTypes constants', () => {
  it('has the expected activity type values', () => {
    expect(ACTIVITY_TYPES.NOTE).toBe('Note');
    expect(ACTIVITY_TYPES.CALL).toBe('Call');
    expect(ACTIVITY_TYPES.EMAIL).toBe('Email');
    expect(ACTIVITY_TYPES.MEETING).toBe('Meeting');
    expect(ACTIVITY_TYPES.STATUS_CHANGE).toBe('Status change');
    expect(ACTIVITY_TYPES.FOLLOW_UP).toBe('Follow Up');
    expect(ACTIVITY_TYPES.ASSIGNMENT).toBe('Assignment');
  });

  it('MANUAL_ACTIVITY_OPTIONS only exposes user-facing actions', () => {
    const values = MANUAL_ACTIVITY_OPTIONS.map((o) => o.value);
    expect(values).toContain(ACTIVITY_TYPES.CALL);
    expect(values).toContain(ACTIVITY_TYPES.EMAIL);
    expect(values).toContain(ACTIVITY_TYPES.MEETING);
    // system-only types must not appear in the manual options list
    expect(values).not.toContain(ACTIVITY_TYPES.STATUS_CHANGE);
    expect(values).not.toContain(ACTIVITY_TYPES.FOLLOW_UP);
    expect(values).not.toContain(ACTIVITY_TYPES.ASSIGNMENT);
    expect(values).not.toContain(ACTIVITY_TYPES.NOTE);
  });

  it('each MANUAL_ACTIVITY_OPTIONS entry has a label and a value', () => {
    MANUAL_ACTIVITY_OPTIONS.forEach((option) => {
      expect(typeof option.label).toBe('string');
      expect(typeof option.value).toBe('string');
    });
  });
});
