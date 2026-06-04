/**
 * Unit tests for GET /api/send-follow-up-reminders
 *
 * Both nodemailer and Firebase Admin SDK are fully mocked.
 * No real SMTP connection or Firestore call is made.
 * Response.json is provided by the polyfill in jest.setup.js.
 */

import { GET } from '@/app/api/send-follow-up-reminders/route';
import { adminDb } from '@/lib/firebase/admin';
import nodemailer from 'nodemailer';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: { createTransport: jest.fn() },
}));

jest.mock('@/lib/firebase/admin', () => ({
  adminDb: { collection: jest.fn() },
}));

// ---------------------------------------------------------------------------
// Stable mock references
// ---------------------------------------------------------------------------

const mockSendMail = jest.fn();

// Leads chain: adminDb.collection('leads').where(...).get()
const mockLeadsGet = jest.fn();
const mockWhere = jest.fn();

// Users chain: adminDb.collection('users').doc(...).get()
const mockUsersGet = jest.fn();
const mockDoc = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  nodemailer.createTransport.mockReturnValue({ sendMail: mockSendMail });

  mockWhere.mockReturnValue({ get: mockLeadsGet });
  mockDoc.mockReturnValue({ get: mockUsersGet });

  adminDb.collection.mockImplementation((name) =>
    name === 'leads'
      ? { where: mockWhere }
      : { doc: mockDoc }
  );

  process.env.CRON_SECRET = 'test-cron-secret';
  process.env.SMTP_HOST = 'smtp.test.local';
  process.env.SMTP_PORT = '587';
  process.env.SMTP_USER = 'user@test.local';
  process.env.SMTP_PASS = 'testpass';
  process.env.SMTP_FROM = 'noreply@test.local';
});

afterAll(() => {
  ['CRON_SECRET', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'].forEach(
    (k) => delete process.env[k]
  );
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(authHeader) {
  return {
    headers: {
      get: (name) => (name === 'authorization' ? authHeader : null),
    },
  };
}

function validAuth() {
  return `Bearer ${process.env.CRON_SECRET}`;
}

function makeLeadDoc(id, data) {
  return { id, data: () => data };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/send-follow-up-reminders', () => {
  describe('authorization', () => {
    it('returns 401 when the authorization header is missing', async () => {
      const res = await GET(makeRequest(null));

      expect(res.status).toBe(401);
      expect(await res.json()).toHaveProperty('error');
      expect(mockLeadsGet).not.toHaveBeenCalled();
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it('returns 401 when the Bearer token is incorrect', async () => {
      const res = await GET(makeRequest('Bearer wrong-token'));

      expect(res.status).toBe(401);
      expect(mockSendMail).not.toHaveBeenCalled();
    });
  });

  describe('no follow-ups today', () => {
    it('returns 200 with sent: 0 and skips sendMail when snapshot is empty', async () => {
      mockLeadsGet.mockResolvedValueOnce({ empty: true, docs: [] });

      const res = await GET(makeRequest(validAuth()));

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.sent).toBe(0);
      expect(mockSendMail).not.toHaveBeenCalled();
    });
  });

  describe('sending reminders to agents', () => {
    it('calls sendMail once per agent and returns the correct sent count', async () => {
      mockLeadsGet.mockResolvedValueOnce({
        empty: false,
        docs: [
          makeLeadDoc('lead-1', { fullName: 'Alice Lead', email: 'alice@lead.com', phone: '111', status: 'New', assignedAgentId: 'agent-1' }),
          makeLeadDoc('lead-2', { fullName: 'Bob Lead',   email: 'bob@lead.com',   phone: '222', status: 'Contacted', assignedAgentId: 'agent-2' }),
        ],
      });
      mockUsersGet
        .mockResolvedValueOnce({ exists: true, data: () => ({ name: 'Agent One', email: 'agent1@example.com' }) })
        .mockResolvedValueOnce({ exists: true, data: () => ({ name: 'Agent Two', email: 'agent2@example.com' }) });
      mockSendMail.mockResolvedValue({});

      const res = await GET(makeRequest(validAuth()));

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.sent).toBe(2);
      expect(mockSendMail).toHaveBeenCalledTimes(2);
      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({ to: 'agent1@example.com' }));
      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({ to: 'agent2@example.com' }));
    });

    it('uses singular subject and includes agent name + lead line when agent has 1 lead', async () => {
      mockLeadsGet.mockResolvedValueOnce({
        empty: false,
        docs: [
          makeLeadDoc('lead-1', { fullName: 'Single Lead', email: 's@s.com', phone: '000', status: 'New', assignedAgentId: 'agent-1' }),
        ],
      });
      mockUsersGet.mockResolvedValueOnce({ exists: true, data: () => ({ name: 'Solo Agent', email: 'solo@example.com' }) });
      mockSendMail.mockResolvedValue({});

      await GET(makeRequest(validAuth()));

      const [{ subject, text }] = mockSendMail.mock.calls[0];
      expect(subject).toMatch(/1 Follow-Up Scheduled Today/);
      expect(text).toContain('Solo Agent');
      expect(text).toContain('Single Lead');
      expect(text).toContain('1 follow-up');
    });

    it('uses plural subject when agent has more than one lead', async () => {
      mockLeadsGet.mockResolvedValueOnce({
        empty: false,
        docs: [
          makeLeadDoc('lead-1', { fullName: 'Lead A', email: 'a@a.com', phone: '', status: 'New', assignedAgentId: 'agent-1' }),
          makeLeadDoc('lead-2', { fullName: 'Lead B', email: 'b@b.com', phone: '', status: 'New', assignedAgentId: 'agent-1' }),
        ],
      });
      mockUsersGet.mockResolvedValueOnce({ exists: true, data: () => ({ name: 'Busy Agent', email: 'busy@example.com' }) });
      mockSendMail.mockResolvedValue({});

      await GET(makeRequest(validAuth()));

      const [{ subject }] = mockSendMail.mock.calls[0];
      expect(subject).toMatch(/2 Follow-Ups Scheduled Today/);
    });
  });

  describe('skipping logic', () => {
    it('skips leads with no assignedAgentId and does not call sendMail', async () => {
      mockLeadsGet.mockResolvedValueOnce({
        empty: false,
        docs: [
          makeLeadDoc('lead-1', { fullName: 'Unassigned', email: 'u@u.com', phone: '', status: 'New', assignedAgentId: null }),
        ],
      });

      const res = await GET(makeRequest(validAuth()));

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.sent).toBe(0);
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it('skips an agent whose Firestore user doc does not exist', async () => {
      mockLeadsGet.mockResolvedValueOnce({
        empty: false,
        docs: [
          makeLeadDoc('lead-1', { fullName: 'Lead', email: 'l@l.com', phone: '', status: 'New', assignedAgentId: 'ghost-agent' }),
        ],
      });
      mockUsersGet.mockResolvedValueOnce({ exists: false });

      const res = await GET(makeRequest(validAuth()));

      expect(mockSendMail).not.toHaveBeenCalled();
      expect((await res.json()).sent).toBe(0);
    });

    it('skips an agent with an empty email field', async () => {
      mockLeadsGet.mockResolvedValueOnce({
        empty: false,
        docs: [
          makeLeadDoc('lead-1', { fullName: 'Lead', email: 'l@l.com', phone: '', status: 'New', assignedAgentId: 'agent-1' }),
        ],
      });
      mockUsersGet.mockResolvedValueOnce({ exists: true, data: () => ({ name: 'No Email Agent', email: '' }) });

      await GET(makeRequest(validAuth()));

      expect(mockSendMail).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('returns 500 with an error body when Firestore throws', async () => {
      mockLeadsGet.mockRejectedValueOnce(new Error('Firestore unavailable'));

      const res = await GET(makeRequest(validAuth()));

      expect(res.status).toBe(500);
      expect(await res.json()).toHaveProperty('error');
    });
  });
});
