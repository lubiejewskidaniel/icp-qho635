/**
 * Unit tests for POST /api/send-lead-email
 *
 * Nodemailer is fully mocked — no real SMTP connection is made.
 * Response.json is provided by the polyfill in jest.setup.js.
 */

import { POST } from '@/app/api/send-lead-email/route';
import nodemailer from 'nodemailer';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: { createTransport: jest.fn() },
}));

// ---------------------------------------------------------------------------
// Stable mock references
// ---------------------------------------------------------------------------

const mockSendMail = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  nodemailer.createTransport.mockReturnValue({ sendMail: mockSendMail });

  process.env.SMTP_HOST = 'smtp.test.local';
  process.env.SMTP_PORT = '587';
  process.env.SMTP_USER = 'user@test.local';
  process.env.SMTP_PASS = 'testpass';
  process.env.SMTP_FROM = 'noreply@test.local';
});

afterAll(() => {
  ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'].forEach(
    (k) => delete process.env[k]
  );
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(body) {
  return { json: async () => body };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/send-lead-email', () => {
  describe('input validation', () => {
    it('returns 400 and does not call sendMail when "to" is missing', async () => {
      const res = await POST(makeRequest({ subject: 'Hi', message: 'Hello' }));

      expect(res.status).toBe(400);
      expect(await res.json()).toHaveProperty('error');
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it('returns 400 and does not call sendMail when "message" is missing', async () => {
      const res = await POST(makeRequest({ to: 'lead@example.com', subject: 'Hi' }));

      expect(res.status).toBe(400);
      expect(await res.json()).toHaveProperty('error');
      expect(mockSendMail).not.toHaveBeenCalled();
    });
  });

  describe('valid request', () => {
    it('returns 200 with { success: true } when sendMail resolves', async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: 'test-id' });

      const res = await POST(makeRequest({
        to: 'lead@example.com',
        subject: 'Property enquiry',
        message: 'Hello there',
      }));

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ success: true });
    });

    it('calls sendMail exactly once with the correct from/to/subject/text/html', async () => {
      mockSendMail.mockResolvedValueOnce({});

      await POST(makeRequest({
        to: 'lead@example.com',
        subject: 'Test subject',
        message: 'Line one\nLine two',
      }));

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@test.local',
          to: 'lead@example.com',
          subject: 'Test subject',
          text: 'Line one\nLine two',
          html: 'Line one<br />Line two',
        })
      );
    });

    it('replaces every \\n with <br /> in the html field', async () => {
      mockSendMail.mockResolvedValueOnce({});

      await POST(makeRequest({ to: 'a@b.com', subject: 'S', message: 'A\nB\nC' }));

      const { html } = mockSendMail.mock.calls[0][0];
      expect(html).toBe('A<br />B<br />C');
    });
  });

  describe('SMTP transport configuration', () => {
    it('creates the transport using the SMTP env vars', async () => {
      mockSendMail.mockResolvedValueOnce({});

      await POST(makeRequest({ to: 'a@b.com', subject: 'S', message: 'M' }));

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'smtp.test.local',
          port: 587,
          auth: expect.objectContaining({
            user: 'user@test.local',
            pass: 'testpass',
          }),
        })
      );
    });
  });

  describe('error handling', () => {
    it('returns 500 with an error body when sendMail rejects', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('SMTP connection refused'));

      const res = await POST(makeRequest({
        to: 'lead@example.com',
        subject: 'Hi',
        message: 'Hello',
      }));

      expect(res.status).toBe(500);
      expect(await res.json()).toHaveProperty('error');
      expect(mockSendMail).toHaveBeenCalledTimes(1);
    });
  });
});
