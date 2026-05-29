/**
 * Integration-style tests for the lead flow.
 *
 * "Integration-style" here means we test the interaction between functions
 * inside the service layer — e.g. that updateLeadStatus correctly chains into
 * addLeadActivity and writes to both the `leads` and `activities` collections.
 * Firebase itself is fully mocked; no real network calls are made.
 *
 * Limitation: without a Firebase Emulator this cannot verify actual Firestore
 * rules, indexes, or real persistence. What it does verify is that the service
 * layer sends the right write operations with the right data shape.
 */

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '@/lib/firebase/config';
import { LEAD_STATUSES } from '@/constants/leadStatuses';
import {
  createLead,
  updateLeadStatus,
  addLeadActivity,
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
  // stubs for functions used elsewhere in the module but not under test here
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

// Stable collection/doc reference objects so we can assert by identity
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

const leadData = {
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
// createLead
// ---------------------------------------------------------------------------

describe('createLead', () => {
  it('writes to the leads collection with the correct data shape', async () => {
    addDoc.mockResolvedValueOnce({ id: 'lead-123' });

    const id = await createLead(leadData);

    expect(collection).toHaveBeenCalledWith(db, 'leads');
    expect(addDoc).toHaveBeenCalledWith(
      mockLeadsCollection,
      expect.objectContaining({
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+61400000001',
        status: LEAD_STATUSES.NEW,
        source: 'website',
        assignedAgentId: null,
        createdAt: '<serverTimestamp>',
        updatedAt: '<serverTimestamp>',
      })
    );
    expect(id).toBe('lead-123');
  });

  it('defaults status to NEW when none is provided', async () => {
    addDoc.mockResolvedValueOnce({ id: 'lead-456' });

    await createLead(leadData);

    const written = addDoc.mock.calls[0][1];
    expect(written.status).toBe(LEAD_STATUSES.NEW);
  });

  it('uses a provided status instead of the default', async () => {
    addDoc.mockResolvedValueOnce({ id: 'lead-789' });

    await createLead({ ...leadData, status: LEAD_STATUSES.CONTACTED });

    const written = addDoc.mock.calls[0][1];
    expect(written.status).toBe(LEAD_STATUSES.CONTACTED);
  });
});

// ---------------------------------------------------------------------------
// updateLeadStatus — the core integration: one call triggers writes to two
// collections (leads + activities).
// ---------------------------------------------------------------------------

describe('updateLeadStatus', () => {
  it('updates the lead document with the new status', async () => {
    addDoc.mockResolvedValueOnce({ id: 'activity-001' });

    await updateLeadStatus('lead-123', LEAD_STATUSES.CONTACTED);

    expect(doc).toHaveBeenCalledWith(db, 'leads', 'lead-123');
    expect(updateDoc).toHaveBeenCalledWith(
      mockLeadDocRef,
      expect.objectContaining({
        status: LEAD_STATUSES.CONTACTED,
        updatedAt: '<serverTimestamp>',
        lastActivityAt: '<serverTimestamp>',
      })
    );
  });

  it('writes a Status Change activity to the activities collection', async () => {
    addDoc.mockResolvedValueOnce({ id: 'activity-001' });

    await updateLeadStatus('lead-123', LEAD_STATUSES.CONTACTED, {
      createdBy: 'agent-1',
      createdByName: 'Alice',
    });

    expect(collection).toHaveBeenCalledWith(db, 'activities');
    expect(addDoc).toHaveBeenCalledWith(
      mockActivitiesCollection,
      expect.objectContaining({
        leadId: 'lead-123',
        type: 'Status Change',
        description: `Status changed to ${LEAD_STATUSES.CONTACTED}`,
        createdBy: 'agent-1',
        createdByName: 'Alice',
        createdAt: '<serverTimestamp>',
      })
    );
  });

  it('touches the lead document twice: once for status, once inside addLeadActivity', async () => {
    addDoc.mockResolvedValueOnce({ id: 'activity-001' });

    await updateLeadStatus('lead-123', LEAD_STATUSES.QUALIFIED);

    // updateDoc[0] = status update, updateDoc[1] = lastActivityAt bump inside addLeadActivity
    expect(updateDoc).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// Full flow: create → update status
// Simulates the realistic journey of a new lead advancing through the pipeline.
// ---------------------------------------------------------------------------

describe('full lead flow: create → advance status', () => {
  it('creates a NEW lead then moves it to Contacted', async () => {
    // Step 1 – create
    addDoc.mockResolvedValueOnce({ id: 'lead-123' });
    const leadId = await createLead(leadData);
    expect(leadId).toBe('lead-123');

    const createdLead = addDoc.mock.calls[0][1];
    expect(createdLead.status).toBe(LEAD_STATUSES.NEW);

    // Step 2 – advance status (triggers activity write internally)
    addDoc.mockResolvedValueOnce({ id: 'activity-001' });
    await updateLeadStatus(leadId, LEAD_STATUSES.CONTACTED, {
      createdBy: 'agent-1',
      createdByName: 'Alice',
    });

    expect(updateDoc).toHaveBeenCalledWith(
      mockLeadDocRef,
      expect.objectContaining({ status: LEAD_STATUSES.CONTACTED })
    );
    expect(addDoc).toHaveBeenCalledWith(
      mockActivitiesCollection,
      expect.objectContaining({
        leadId: 'lead-123',
        type: 'Status Change',
        description: `Status changed to ${LEAD_STATUSES.CONTACTED}`,
      })
    );
  });

  it('creates a NEW lead then advances it to Won through Qualified', async () => {
    addDoc.mockResolvedValueOnce({ id: 'lead-123' });
    const leadId = await createLead(leadData);

    // NEW → QUALIFIED
    addDoc.mockResolvedValueOnce({ id: 'activity-001' });
    await updateLeadStatus(leadId, LEAD_STATUSES.QUALIFIED);

    expect(updateDoc).toHaveBeenCalledWith(
      mockLeadDocRef,
      expect.objectContaining({ status: LEAD_STATUSES.QUALIFIED })
    );

    jest.clearAllMocks();
    collection.mockImplementation((_db, name) =>
      name === 'activities' ? mockActivitiesCollection : mockLeadsCollection
    );
    doc.mockReturnValue(mockLeadDocRef);
    updateDoc.mockResolvedValue(undefined);

    // QUALIFIED → WON
    addDoc.mockResolvedValueOnce({ id: 'activity-002' });
    await updateLeadStatus(leadId, LEAD_STATUSES.WON);

    expect(updateDoc).toHaveBeenCalledWith(
      mockLeadDocRef,
      expect.objectContaining({ status: LEAD_STATUSES.WON })
    );
    expect(addDoc).toHaveBeenCalledWith(
      mockActivitiesCollection,
      expect.objectContaining({
        description: `Status changed to ${LEAD_STATUSES.WON}`,
      })
    );
  });
});

// ---------------------------------------------------------------------------
// addLeadActivity (standalone — verifies direct activity logging)
// ---------------------------------------------------------------------------

describe('addLeadActivity', () => {
  it('writes to the activities collection and bumps the lead lastActivityAt', async () => {
    addDoc.mockResolvedValueOnce({ id: 'activity-xyz' });

    const activityId = await addLeadActivity({
      leadId: 'lead-123',
      type: 'Call',
      description: 'Spoke with client',
      createdBy: 'agent-1',
      createdByName: 'Alice',
    });

    expect(addDoc).toHaveBeenCalledWith(
      mockActivitiesCollection,
      expect.objectContaining({
        leadId: 'lead-123',
        type: 'Call',
        description: 'Spoke with client',
        createdBy: 'agent-1',
        createdByName: 'Alice',
      })
    );

    // lead doc touched to update lastActivityAt
    expect(updateDoc).toHaveBeenCalledWith(
      mockLeadDocRef,
      expect.objectContaining({
        lastActivityAt: '<serverTimestamp>',
        updatedAt: '<serverTimestamp>',
      })
    );

    expect(activityId).toBe('activity-xyz');
  });
});
