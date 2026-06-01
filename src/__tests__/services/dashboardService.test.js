/**
 * Unit tests for dashboardService.
 *
 * Both exported functions delegate all Firestore access to leadService, so
 * we mock only those three functions and verify the aggregation logic here.
 * No real Firebase connection is made.
 */

import {
  getManagerDashboardStats,
  getAgentDashboardStats,
} from '@/services/dashboard/dashboardService';

import {
  getAllLeads,
  getAssignedLeads,
  getRecentActivities,
} from '@/services/leads/leadService';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@/services/leads/leadService', () => ({
  getAllLeads: jest.fn(),
  getAssignedLeads: jest.fn(),
  getRecentActivities: jest.fn(),
}));

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const TODAY = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().split('T')[0];

const mockActivities = [
  { id: 'act-1', type: 'Call', leadId: 'lead-1' },
  { id: 'act-2', type: 'Status Change', leadId: 'lead-2' },
];

// A full set of leads used by getManagerDashboardStats tests.
// Statuses: 2 New, 1 Contacted, 2 Qualified, 2 Won, 1 Lost
const managerLeads = [
  { id: 'l1', status: 'New' },
  { id: 'l2', status: 'New' },
  { id: 'l3', status: 'Contacted' },
  { id: 'l4', status: 'Qualified' },
  { id: 'l5', status: 'Qualified' },
  { id: 'l6', status: 'Won' },
  { id: 'l7', status: 'Won' },
  { id: 'l8', status: 'Lost' },
];

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// getManagerDashboardStats
// ---------------------------------------------------------------------------

describe('getManagerDashboardStats', () => {
  beforeEach(() => {
    getAllLeads.mockResolvedValue(managerLeads);
    getRecentActivities.mockResolvedValue(mockActivities);
  });

  it('returns the correct totalLeads count', async () => {
    const stats = await getManagerDashboardStats();
    expect(stats.totalLeads).toBe(8);
  });

  it('returns the correct newLeads count', async () => {
    const stats = await getManagerDashboardStats();
    expect(stats.newLeads).toBe(2);
  });

  it('returns the correct wonLeads count', async () => {
    const stats = await getManagerDashboardStats();
    expect(stats.wonLeads).toBe(2);
  });

  it('returns the correct lostLeads count', async () => {
    const stats = await getManagerDashboardStats();
    expect(stats.lostLeads).toBe(1);
  });

  it('calculates conversionRate as Math.round((won / total) * 100)', async () => {
    // 2 won / 8 total = 0.25 → 25%
    const stats = await getManagerDashboardStats();
    expect(stats.conversionRate).toBe(25);
  });

  it('returns conversionRate of 0 when there are no leads', async () => {
    getAllLeads.mockResolvedValue([]);
    const stats = await getManagerDashboardStats();
    expect(stats.conversionRate).toBe(0);
  });

  it('groups leads correctly into leadStatusCounts', async () => {
    const stats = await getManagerDashboardStats();
    expect(stats.leadStatusCounts).toEqual({
      New: 2,
      Contacted: 1,
      Qualified: 2,
      Won: 2,
      Lost: 1,
    });
  });

  it('counts a status under "Unknown" when the lead has no status field', async () => {
    getAllLeads.mockResolvedValue([{ id: 'l9' }]); // no status property
    getRecentActivities.mockResolvedValue([]);
    const stats = await getManagerDashboardStats();
    expect(stats.leadStatusCounts).toEqual({ Unknown: 1 });
  });

  it('returns recentActivities from getRecentActivities', async () => {
    const stats = await getManagerDashboardStats();
    expect(stats.recentActivities).toEqual(mockActivities);
  });

  it('requests exactly 5 recent activities', async () => {
    await getManagerDashboardStats();
    expect(getRecentActivities).toHaveBeenCalledWith(5);
  });

  it('returns all expected keys in the result object', async () => {
    const stats = await getManagerDashboardStats();
    expect(stats).toEqual(
      expect.objectContaining({
        totalLeads: expect.any(Number),
        newLeads: expect.any(Number),
        wonLeads: expect.any(Number),
        lostLeads: expect.any(Number),
        conversionRate: expect.any(Number),
        leadStatusCounts: expect.any(Object),
        recentActivities: expect.any(Array),
      })
    );
  });
});

// ---------------------------------------------------------------------------
// getAgentDashboardStats
// ---------------------------------------------------------------------------

describe('getAgentDashboardStats', () => {
  const agentId = 'agent-42';

  // Leads assigned to this agent:
  // 2 New, 1 Won, 1 follow-up today, 1 follow-up yesterday
  const agentLeads = [
    { id: 'l1', status: 'New', nextFollowUpDate: TODAY },
    { id: 'l2', status: 'New', nextFollowUpDate: YESTERDAY },
    { id: 'l3', status: 'Won', nextFollowUpDate: null },
    { id: 'l4', status: 'Contacted', nextFollowUpDate: TODAY },
    { id: 'l5', status: 'Lost', nextFollowUpDate: null },
  ];

  beforeEach(() => {
    getAssignedLeads.mockResolvedValue(agentLeads);
  });

  it('fetches leads for the correct agentId', async () => {
    await getAgentDashboardStats(agentId);
    expect(getAssignedLeads).toHaveBeenCalledWith(agentId);
  });

  it('returns the correct totalLeads count', async () => {
    const stats = await getAgentDashboardStats(agentId);
    expect(stats.totalLeads).toBe(5);
  });

  it('returns the correct newLeads count', async () => {
    const stats = await getAgentDashboardStats(agentId);
    expect(stats.newLeads).toBe(2);
  });

  it('returns the correct wonLeads count', async () => {
    const stats = await getAgentDashboardStats(agentId);
    expect(stats.wonLeads).toBe(1);
  });

  it('counts only leads where nextFollowUpDate equals today', async () => {
    const stats = await getAgentDashboardStats(agentId);
    // l1 and l4 have TODAY, l2 has YESTERDAY, l3 and l5 have null
    expect(stats.followUpsToday).toBe(2);
  });

  it('returns followUpsToday of 0 when no leads are due today', async () => {
    getAssignedLeads.mockResolvedValue([
      { id: 'l1', status: 'New', nextFollowUpDate: YESTERDAY },
      { id: 'l2', status: 'New', nextFollowUpDate: null },
    ]);
    const stats = await getAgentDashboardStats(agentId);
    expect(stats.followUpsToday).toBe(0);
  });

  it('returns 0 for all counts when the agent has no leads', async () => {
    getAssignedLeads.mockResolvedValue([]);
    const stats = await getAgentDashboardStats(agentId);
    expect(stats.totalLeads).toBe(0);
    expect(stats.newLeads).toBe(0);
    expect(stats.wonLeads).toBe(0);
    expect(stats.followUpsToday).toBe(0);
  });

  it('returns all expected keys in the result object', async () => {
    const stats = await getAgentDashboardStats(agentId);
    expect(stats).toEqual(
      expect.objectContaining({
        totalLeads: expect.any(Number),
        newLeads: expect.any(Number),
        wonLeads: expect.any(Number),
        followUpsToday: expect.any(Number),
      })
    );
  });
});
