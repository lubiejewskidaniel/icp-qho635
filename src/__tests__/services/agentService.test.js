/**
 * Unit tests for agentService.
 *
 * All three functions (createAgent, updateAgent, deleteAgent) are thin fetch
 * wrappers. We mock global.fetch and verify the URL, method, body, and error
 * handling for each one. No Firebase or network calls are made.
 */

import {
  createAgent,
  updateAgent,
  deleteAgent,
} from '@/services/agents/agentService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns a mock Response-like object that fetch would resolve to. */
function mockResponse({ ok = true, body = { success: true } } = {}) {
  return {
    ok,
    json: jest.fn().mockResolvedValue(body),
  };
}

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

// ---------------------------------------------------------------------------
// createAgent
// ---------------------------------------------------------------------------

describe('createAgent', () => {
  const payload = { name: 'Alice', email: 'alice@example.com', password: 'secret123' };

  it('calls the correct API route', async () => {
    global.fetch.mockResolvedValue(mockResponse());
    await createAgent(payload);
    expect(fetch).toHaveBeenCalledWith('/api/agents', expect.any(Object));
  });

  it('uses the POST method', async () => {
    global.fetch.mockResolvedValue(mockResponse());
    await createAgent(payload);
    const options = fetch.mock.calls[0][1];
    expect(options.method).toBe('POST');
  });

  it('sends the correct request body shape', async () => {
    global.fetch.mockResolvedValue(mockResponse());
    await createAgent(payload);
    const options = fetch.mock.calls[0][1];
    expect(JSON.parse(options.body)).toEqual({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'secret123',
    });
  });

  it('sets Content-Type to application/json', async () => {
    global.fetch.mockResolvedValue(mockResponse());
    await createAgent(payload);
    const options = fetch.mock.calls[0][1];
    expect(options.headers['Content-Type']).toBe('application/json');
  });

  it('returns the parsed JSON response on success', async () => {
    const responseBody = { success: true, agent: { id: 'uid-1', name: 'Alice' } };
    global.fetch.mockResolvedValue(mockResponse({ body: responseBody }));
    const result = await createAgent(payload);
    expect(result).toEqual(responseBody);
  });

  it('throws an error when the response is not OK', async () => {
    global.fetch.mockResolvedValue(mockResponse({ ok: false }));
    await expect(createAgent(payload)).rejects.toThrow('Could not create agent.');
  });
});

// ---------------------------------------------------------------------------
// updateAgent
// ---------------------------------------------------------------------------

describe('updateAgent', () => {
  const agentId = 'agent-99';
  const payload = { name: 'Bob Updated', email: 'bob@example.com' };

  it('calls the correct API route including the agent id', async () => {
    global.fetch.mockResolvedValue(mockResponse());
    await updateAgent(agentId, payload);
    expect(fetch).toHaveBeenCalledWith(`/api/agents/${agentId}`, expect.any(Object));
  });

  it('uses the PATCH method', async () => {
    global.fetch.mockResolvedValue(mockResponse());
    await updateAgent(agentId, payload);
    const options = fetch.mock.calls[0][1];
    expect(options.method).toBe('PATCH');
  });

  it('sends the correct request body shape', async () => {
    global.fetch.mockResolvedValue(mockResponse());
    await updateAgent(agentId, payload);
    const options = fetch.mock.calls[0][1];
    expect(JSON.parse(options.body)).toEqual({
      name: 'Bob Updated',
      email: 'bob@example.com',
    });
  });

  it('sets Content-Type to application/json', async () => {
    global.fetch.mockResolvedValue(mockResponse());
    await updateAgent(agentId, payload);
    const options = fetch.mock.calls[0][1];
    expect(options.headers['Content-Type']).toBe('application/json');
  });

  it('returns the parsed JSON response on success', async () => {
    const responseBody = { success: true };
    global.fetch.mockResolvedValue(mockResponse({ body: responseBody }));
    const result = await updateAgent(agentId, payload);
    expect(result).toEqual(responseBody);
  });

  it('throws an error when the response is not OK', async () => {
    global.fetch.mockResolvedValue(mockResponse({ ok: false }));
    await expect(updateAgent(agentId, payload)).rejects.toThrow('Could not update agent.');
  });

  it('uses a different URL for different agent ids', async () => {
    global.fetch.mockResolvedValue(mockResponse());
    await updateAgent('agent-001', payload);
    expect(fetch).toHaveBeenCalledWith('/api/agents/agent-001', expect.any(Object));

    global.fetch.mockResolvedValue(mockResponse());
    await updateAgent('agent-002', payload);
    expect(fetch).toHaveBeenCalledWith('/api/agents/agent-002', expect.any(Object));
  });
});

// ---------------------------------------------------------------------------
// deleteAgent
// ---------------------------------------------------------------------------

describe('deleteAgent', () => {
  const agentId = 'agent-77';

  it('calls the correct API route including the agent id', async () => {
    global.fetch.mockResolvedValue(mockResponse());
    await deleteAgent(agentId);
    expect(fetch).toHaveBeenCalledWith(`/api/agents/${agentId}`, expect.any(Object));
  });

  it('uses the DELETE method', async () => {
    global.fetch.mockResolvedValue(mockResponse());
    await deleteAgent(agentId);
    const options = fetch.mock.calls[0][1];
    expect(options.method).toBe('DELETE');
  });

  it('does not send a request body', async () => {
    global.fetch.mockResolvedValue(mockResponse());
    await deleteAgent(agentId);
    const options = fetch.mock.calls[0][1];
    expect(options.body).toBeUndefined();
  });

  it('returns the parsed JSON response on success', async () => {
    const responseBody = { success: true };
    global.fetch.mockResolvedValue(mockResponse({ body: responseBody }));
    const result = await deleteAgent(agentId);
    expect(result).toEqual(responseBody);
  });

  it('throws an error when the response is not OK', async () => {
    global.fetch.mockResolvedValue(mockResponse({ ok: false }));
    await expect(deleteAgent(agentId)).rejects.toThrow('Could not delete agent.');
  });

  it('uses a different URL for different agent ids', async () => {
    global.fetch.mockResolvedValue(mockResponse());
    await deleteAgent('agent-aaa');
    expect(fetch).toHaveBeenCalledWith('/api/agents/agent-aaa', expect.any(Object));

    global.fetch.mockResolvedValue(mockResponse());
    await deleteAgent('agent-bbb');
    expect(fetch).toHaveBeenCalledWith('/api/agents/agent-bbb', expect.any(Object));
  });
});
