/**
 * Unit tests for uncovered leadService functions.
 *
 * Already covered elsewhere (leadFlow.test.js):
 *   createLead, updateLeadStatus, addLeadActivity
 *
 * Covered here:
 *   createInternalLead, updateLeadFollowUpDate, assignLeadToAgent,
 *   leadExists, importCsvLeads, getLeadActivities
 *
 * Firebase is fully mocked — no real network calls are made.
 */

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '@/lib/firebase/config';
import { LEAD_STATUSES } from '@/constants/leadStatuses';
import {
  createInternalLead,
  updateLeadFollowUpDate,
  assignLeadToAgent,
  leadExists,
  importCsvLeads,
  getLeadActivities,
} from '@/services/leads/leadService';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
  serverTimestamp: jest.fn(() => '<serverTimestamp>'),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  writeBatch: jest.fn(),
}));

jest.mock('@/lib/firebase/config', () => ({
  db: { app: { name: '[DEFAULT]' } },
}));

// ---------------------------------------------------------------------------
// Stable reference objects — used to assert by identity across tests
// ---------------------------------------------------------------------------

const mockLeadsCollection = { __ref: 'leads' };
const mockActivitiesCollection = { __ref: 'activities' };
const mockLeadDocRef = { __ref: 'leads/lead-123' };

beforeEach(() => {
  jest.clearAllMocks();

  collection.mockImplementation((_db, name) =>
    name === 'activities' ? mockActivitiesCollection : mockLeadsCollection
  );

  doc.mockReturnValue(mockLeadDocRef);
  updateDoc.mockResolvedValue(undefined);
});

// ---------------------------------------------------------------------------
// Shared fixture
// ---------------------------------------------------------------------------

const baseLeadData = {
  fullName: 'Jane Smith',
  email: 'jane@example.com',
  phone: '+61400000001',
  country: 'Australia',
  city: 'Sydney',
  propertyType: 'Apartment',
  location: 'CBD',
  budgetRange: '400K - 1M',
  purpose: 'Buy',
  preferredContactMethod: 'email',
};

// ---------------------------------------------------------------------------
// createInternalLead
// ---------------------------------------------------------------------------

describe('createInternalLead', () => {
  it('sets source to "manual"', async () => {
    addDoc.mockResolvedValueOnce({ id: 'lead-1' });

    await createInternalLead({ ...baseLeadData, createdBy: 'agent-1' });

    const written = addDoc.mock.calls[0][1];
    expect(written.source).toBe('manual');
  });

  it('uses createdBy as assignedAgentId when no assignedAgentId is given', async () => {
    addDoc.mockResolvedValueOnce({ id: 'lead-1' });

    await createInternalLead({ ...baseLeadData, createdBy: 'agent-1' });

    const written = addDoc.mock.calls[0][1];
    expect(written.assignedAgentId).toBe('agent-1');
  });

  it('uses the provided assignedAgentId over createdBy', async () => {
    addDoc.mockResolvedValueOnce({ id: 'lead-1' });

    await createInternalLead({
      ...baseLeadData,
      createdBy: 'agent-1',
      assignedAgentId: 'agent-2',
    });

    const written = addDoc.mock.calls[0][1];
    expect(written.assignedAgentId).toBe('agent-2');
  });

  it('sets assignedAgentId to null when neither assignedAgentId nor createdBy is given', async () => {
    addDoc.mockResolvedValueOnce({ id: 'lead-1' });

    await createInternalLead({ ...baseLeadData });

    const written = addDoc.mock.calls[0][1];
    expect(written.assignedAgentId).toBeNull();
  });

  it('defaults status to NEW', async () => {
    addDoc.mockResolvedValueOnce({ id: 'lead-1' });

    await createInternalLead({ ...baseLeadData });

    const written = addDoc.mock.calls[0][1];
    expect(written.status).toBe(LEAD_STATUSES.NEW);
  });
});

// ---------------------------------------------------------------------------
// updateLeadFollowUpDate
// ---------------------------------------------------------------------------

describe('updateLeadFollowUpDate', () => {
  it('updates nextFollowUpDate on the lead document', async () => {
    addDoc.mockResolvedValueOnce({ id: 'activity-1' });

    await updateLeadFollowUpDate('lead-123', '2026-12-01');

    expect(doc).toHaveBeenCalledWith(db, 'leads', 'lead-123');
    expect(updateDoc).toHaveBeenCalledWith(
      mockLeadDocRef,
      expect.objectContaining({ nextFollowUpDate: '2026-12-01' })
    );
  });

  it('writes a Follow Up activity to the activities collection', async () => {
    addDoc.mockResolvedValueOnce({ id: 'activity-1' });

    await updateLeadFollowUpDate('lead-123', '2026-12-01', {
      createdBy: 'agent-1',
      createdByName: 'Alice',
    });

    expect(addDoc).toHaveBeenCalledWith(
      mockActivitiesCollection,
      expect.objectContaining({
        leadId: 'lead-123',
        type: 'Follow Up',
        description: 'Next follow-up date set to 2026-12-01',
        createdBy: 'agent-1',
        createdByName: 'Alice',
      })
    );
  });

  it('touches the lead document twice: once for the date, once inside addLeadActivity', async () => {
    addDoc.mockResolvedValueOnce({ id: 'activity-1' });

    await updateLeadFollowUpDate('lead-123', '2026-12-01');

    expect(updateDoc).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// assignLeadToAgent
// ---------------------------------------------------------------------------

describe('assignLeadToAgent', () => {
  const agent = { id: 'agent-1', name: 'Alice' };

  it('writes assignedAgentId and assignedAgentName to the lead document', async () => {
    addDoc.mockResolvedValueOnce({ id: 'activity-1' });

    await assignLeadToAgent('lead-123', agent);

    expect(updateDoc).toHaveBeenCalledWith(
      mockLeadDocRef,
      expect.objectContaining({
        assignedAgentId: 'agent-1',
        assignedAgentName: 'Alice',
      })
    );
  });

  it('writes an Assignment activity with the agent name in the description', async () => {
    addDoc.mockResolvedValueOnce({ id: 'activity-1' });

    await assignLeadToAgent('lead-123', agent, {
      createdBy: 'manager-1',
      createdByName: 'Manager Bob',
    });

    expect(addDoc).toHaveBeenCalledWith(
      mockActivitiesCollection,
      expect.objectContaining({
        leadId: 'lead-123',
        type: 'Assignment',
        description: 'Lead assigned to Alice',
        createdBy: 'manager-1',
        createdByName: 'Manager Bob',
      })
    );
  });

  it('touches the lead document twice: once for assignment, once inside addLeadActivity', async () => {
    addDoc.mockResolvedValueOnce({ id: 'activity-1' });

    await assignLeadToAgent('lead-123', agent);

    expect(updateDoc).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// leadExists
// ---------------------------------------------------------------------------

describe('leadExists', () => {
  // leadExists always runs both queries (email + phone) regardless of the
  // email result — there is no short-circuit between the two getDocs calls.

  it('returns true when a lead with a matching email exists', async () => {
    getDocs
      .mockResolvedValueOnce({ empty: false }) // email snapshot → found
      .mockResolvedValueOnce({ empty: true });  // phone snapshot → not found

    const result = await leadExists('jane@example.com', '+61400000001');

    expect(result).toBe(true);
  });

  it('returns true when a lead with a matching phone exists', async () => {
    getDocs
      .mockResolvedValueOnce({ empty: true })   // email snapshot → not found
      .mockResolvedValueOnce({ empty: false });  // phone snapshot → found

    const result = await leadExists('new@example.com', '+61400000001');

    expect(result).toBe(true);
  });

  it('returns true when both email and phone match', async () => {
    getDocs
      .mockResolvedValueOnce({ empty: false })
      .mockResolvedValueOnce({ empty: false });

    const result = await leadExists('jane@example.com', '+61400000001');

    expect(result).toBe(true);
  });

  it('returns false when neither email nor phone matches', async () => {
    getDocs
      .mockResolvedValueOnce({ empty: true })
      .mockResolvedValueOnce({ empty: true });

    const result = await leadExists('new@example.com', '+61999999999');

    expect(result).toBe(false);
  });

  it('queries the leads collection by email', async () => {
    getDocs.mockResolvedValue({ empty: true });

    await leadExists('jane@example.com', '+61400000001');

    expect(where).toHaveBeenCalledWith('email', '==', 'jane@example.com');
  });

  it('queries the leads collection by phone', async () => {
    getDocs.mockResolvedValue({ empty: true });

    await leadExists('jane@example.com', '+61400000001');

    expect(where).toHaveBeenCalledWith('phone', '==', '+61400000001');
  });
});

// ---------------------------------------------------------------------------
// importCsvLeads
// ---------------------------------------------------------------------------

describe('importCsvLeads', () => {
  let mockBatch;

  beforeEach(() => {
    mockBatch = {
      set: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    };
    writeBatch.mockReturnValue(mockBatch);
  });

  it('skips rows that have no email and no phone', async () => {
    const result = await importCsvLeads([{ fullName: 'No Contact Info' }]);

    expect(mockBatch.set).not.toHaveBeenCalled();
    expect(result).toEqual({ imported: 0, skipped: 1 });
  });

  it('skips rows where the lead already exists', async () => {
    // Both getDocs calls for leadExists return non-empty (duplicate found)
    getDocs
      .mockResolvedValueOnce({ empty: false })
      .mockResolvedValueOnce({ empty: true });

    const result = await importCsvLeads([
      { email: 'existing@example.com', phone: '+61400000001' },
    ]);

    expect(mockBatch.set).not.toHaveBeenCalled();
    expect(result).toEqual({ imported: 0, skipped: 1 });
  });

  it('batch-writes new leads and returns the correct counts', async () => {
    // All getDocs return empty → no duplicates
    getDocs.mockResolvedValue({ empty: true });

    const rows = [
      { email: 'a@example.com', phone: '+61400000001' },
      { email: 'b@example.com', phone: '+61400000002' },
    ];

    const result = await importCsvLeads(rows);

    expect(mockBatch.set).toHaveBeenCalledTimes(2);
    expect(mockBatch.commit).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ imported: 2, skipped: 0 });
  });

  it('handles a mix of new, duplicate, and invalid rows correctly', async () => {
    // Row 1: no email/phone → skipped immediately (no getDocs calls)
    // Row 2: duplicate     → getDocs returns found (2 calls)
    // Row 3: new lead      → getDocs returns empty (2 calls)
    getDocs
      .mockResolvedValueOnce({ empty: false }) // row 2 email → found
      .mockResolvedValueOnce({ empty: true })  // row 2 phone
      .mockResolvedValueOnce({ empty: true })  // row 3 email
      .mockResolvedValueOnce({ empty: true }); // row 3 phone

    const rows = [
      { fullName: 'No Contact' },
      { email: 'exists@example.com', phone: '+61400' },
      { email: 'new@example.com', phone: '+61411' },
    ];

    const result = await importCsvLeads(rows);

    expect(mockBatch.set).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ imported: 1, skipped: 2 });
  });

  it('writes the correct data shape for a new lead', async () => {
    getDocs.mockResolvedValue({ empty: true });

    const row = {
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '+61400000001',
      country: 'Australia',
      city: 'Sydney',
    };

    await importCsvLeads([row], { createdBy: 'manager-1' });

    const writtenData = mockBatch.set.mock.calls[0][1];
    expect(writtenData).toEqual(
      expect.objectContaining({
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '+61400000001',
        source: 'csv',
        status: LEAD_STATUSES.NEW,
        createdBy: 'manager-1',
      })
    );
  });
});

// ---------------------------------------------------------------------------
// getLeadActivities
// ---------------------------------------------------------------------------

describe('getLeadActivities', () => {
  it('queries the activities collection for the correct leadId', async () => {
    getDocs.mockResolvedValue({ docs: [] });

    await getLeadActivities('lead-123');

    expect(where).toHaveBeenCalledWith('leadId', '==', 'lead-123');
    expect(collection).toHaveBeenCalledWith(db, 'activities');
  });

  it('orders results by createdAt descending', async () => {
    getDocs.mockResolvedValue({ docs: [] });

    await getLeadActivities('lead-123');

    expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
  });

  it('limits results to 5', async () => {
    getDocs.mockResolvedValue({ docs: [] });

    await getLeadActivities('lead-123');

    expect(limit).toHaveBeenCalledWith(5);
  });

  it('does not call startAfter when no cursor is provided', async () => {
    getDocs.mockResolvedValue({ docs: [] });

    await getLeadActivities('lead-123');

    expect(startAfter).not.toHaveBeenCalled();
  });

  it('calls startAfter with the cursor when lastVisible is provided', async () => {
    getDocs.mockResolvedValue({ docs: [] });
    const cursor = { id: 'act-5' };

    await getLeadActivities('lead-123', cursor);

    expect(startAfter).toHaveBeenCalledWith(cursor);
  });

  it('returns correctly mapped activities from snapshot docs', async () => {
    const mockDocs = [
      { id: 'act-1', data: () => ({ type: 'Call', leadId: 'lead-123' }) },
      { id: 'act-2', data: () => ({ type: 'Follow Up', leadId: 'lead-123' }) },
    ];
    getDocs.mockResolvedValue({ docs: mockDocs });

    const result = await getLeadActivities('lead-123');

    expect(result.activities).toEqual([
      { id: 'act-1', type: 'Call', leadId: 'lead-123' },
      { id: 'act-2', type: 'Follow Up', leadId: 'lead-123' },
    ]);
  });

  it('sets hasMore to true when exactly 5 docs are returned', async () => {
    const mockDocs = Array.from({ length: 5 }, (_, i) => ({
      id: `act-${i}`,
      data: () => ({}),
    }));
    getDocs.mockResolvedValue({ docs: mockDocs });

    const result = await getLeadActivities('lead-123');

    expect(result.hasMore).toBe(true);
  });

  it('sets hasMore to false when fewer than 5 docs are returned', async () => {
    const mockDocs = [{ id: 'act-1', data: () => ({}) }];
    getDocs.mockResolvedValue({ docs: mockDocs });

    const result = await getLeadActivities('lead-123');

    expect(result.hasMore).toBe(false);
  });

  it('returns the last doc as lastVisible', async () => {
    const lastDoc = { id: 'act-5', data: () => ({}) };
    const mockDocs = [{ id: 'act-4', data: () => ({}) }, lastDoc];
    getDocs.mockResolvedValue({ docs: mockDocs });

    const result = await getLeadActivities('lead-123');

    expect(result.lastVisible).toBe(lastDoc);
  });

  it('returns null for lastVisible when there are no docs', async () => {
    getDocs.mockResolvedValue({ docs: [] });

    const result = await getLeadActivities('lead-123');

    expect(result.lastVisible).toBeNull();
  });
});
