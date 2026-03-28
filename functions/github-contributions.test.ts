import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  buildGitHubSearchQuery,
  buildSearchUrl,
  isAllowedOrigin,
  buildPrData,
  getResponseHeaders,
  fetchGitHubPRsByState,
  onRequest,
} from './github-contributions.js';
import type { GitHubPR } from './github-contributions.js';

const createMockPR = (overrides: Partial<GitHubPR> = {}): GitHubPR => ({
  title: 'fix: resolve bug',
  body: 'Some description',
  html_url: 'https://github.com/owner/repo/pull/1',
  closed_at: '2025-01-15T10:00:00Z',
  created_at: '2025-01-10T10:00:00Z',
  repository_url: 'https://api.github.com/repos/owner/repo',
  number: 1,
  ...overrides,
});

const mockFetchByUrl = (mergedItems: GitHubPR[], openItems: GitHubPR[] = []) => {
  vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
    const items = url.includes('is%3Amerged') ? mergedItems : openItems;
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ items, total_count: items.length }),
    });
  }));
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('buildGitHubSearchQuery', () => {
  it('builds query for merged PRs', () => {
    const query = buildGitHubSearchQuery('koh-sh', 'merged');
    expect(query).toBe('is:pr archived:false is:merged is:public author:koh-sh -user:koh-sh');
  });

  it('builds query for open PRs', () => {
    const query = buildGitHubSearchQuery('koh-sh', 'open');
    expect(query).toBe('is:pr archived:false is:open is:public author:koh-sh -user:koh-sh');
  });

  it('uses provided account name', () => {
    const query = buildGitHubSearchQuery('other-user', 'merged');
    expect(query).toContain('author:other-user');
    expect(query).toContain('-user:other-user');
  });
});

describe('buildSearchUrl', () => {
  it('constructs URL with encoded query', () => {
    const url = buildSearchUrl('is:pr author:koh-sh');
    expect(url).toBe(
      'https://api.github.com/search/issues?q=is%3Apr%20author%3Akoh-sh&sort=created&order=desc'
    );
  });

  it('encodes special characters', () => {
    const url = buildSearchUrl('foo bar+baz');
    expect(url).toContain('q=foo%20bar%2Bbaz');
  });
});

describe('isAllowedOrigin', () => {
  it('returns true for allowed origin', () => {
    expect(isAllowedOrigin('http://localhost:1313')).toBe(true);
  });

  it('returns false for disallowed origin', () => {
    expect(isAllowedOrigin('https://evil.com')).toBe(false);
  });

  it('returns false for null', () => {
    expect(isAllowedOrigin(null)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isAllowedOrigin('')).toBe(false);
  });
});

describe('buildPrData', () => {
  it('transforms GitHubPR to PRData for merged state', () => {
    const pr = createMockPR({ number: 42, html_url: 'https://github.com/owner/repo/pull/42' });
    const result = buildPrData(pr, 'merged');
    expect(result).toEqual({
      title: 'fix: resolve bug',
      body: 'Some description',
      html_url: 'https://github.com/owner/repo/pull/42',
      closed_at: '2025-01-15T10:00:00Z',
      created_at: '2025-01-10T10:00:00Z',
      repo_name: 'owner/repo',
      og_image: 'https://opengraph.githubassets.com/1/owner/repo/pull/42',
      state: 'merged',
    });
  });

  it('sets state to open', () => {
    const result = buildPrData(createMockPR(), 'open');
    expect(result.state).toBe('open');
  });

  it('handles null body', () => {
    const result = buildPrData(createMockPR({ body: null }), 'merged');
    expect(result.body).toBeNull();
  });
});

describe('getResponseHeaders', () => {
  it('includes CORS header for allowed origin', () => {
    const headers = getResponseHeaders('http://localhost:1313');
    expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:1313');
  });

  it('excludes CORS header for disallowed origin', () => {
    const headers = getResponseHeaders('https://evil.com');
    expect(headers['Access-Control-Allow-Origin']).toBeUndefined();
  });

  it('excludes CORS header for null origin', () => {
    const headers = getResponseHeaders(null);
    expect(headers['Access-Control-Allow-Origin']).toBeUndefined();
  });

  it('always includes common headers', () => {
    const headers = getResponseHeaders(null);
    expect(headers['content-type']).toBe('application/json;charset=UTF-8');
    expect(headers['cache-control']).toBe('public, max-age=3600');
    expect(headers['Access-Control-Allow-Methods']).toBe('GET,OPTIONS');
    expect(headers['Access-Control-Max-Age']).toBe('86400');
  });
});

describe('fetchGitHubPRsByState', () => {
  it('returns transformed PR data on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ items: [createMockPR()], total_count: 1 }),
    }));

    const result = await fetchGitHubPRsByState('merged');
    expect(result).toHaveLength(1);
    expect(result[0].repo_name).toBe('owner/repo');
    expect(result[0].state).toBe('merged');
  });

  it('throws APIError on API failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
    }));

    await expect(fetchGitHubPRsByState('merged')).rejects.toThrow('GitHub API responded with 403');
  });
});

describe('onRequest', () => {
  const createContext = (origin: string | null) => ({
    request: {
      headers: {
        get: (name: string) => name === 'Origin' ? origin : null,
      },
    },
  });

  it('returns JSON response with open PRs first then merged PRs', async () => {
    const mergedItems = [createMockPR({ title: 'merged PR', number: 1 })];
    const openItems = [createMockPR({ title: 'open PR', number: 2, closed_at: null })];
    mockFetchByUrl(mergedItems, openItems);

    const response = await onRequest(createContext(null));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body[0].state).toBe('open');
    expect(body[1].state).toBe('merged');
  });

  it('sorts merged PRs by closed_at descending', async () => {
    const mergedItems = [
      createMockPR({ title: 'older', closed_at: '2025-01-10T00:00:00Z', number: 1 }),
      createMockPR({ title: 'newer', closed_at: '2025-01-20T00:00:00Z', number: 2 }),
    ];
    mockFetchByUrl(mergedItems);

    const response = await onRequest(createContext(null));
    const body = await response.json();

    expect(body[0].title).toBe('newer');
    expect(body[1].title).toBe('older');
  });

  it('sorts merged PRs with null closed_at to the end', async () => {
    const mergedItems = [
      createMockPR({ title: 'null-date', closed_at: null, number: 1 }),
      createMockPR({ title: 'with-date', closed_at: '2025-01-10T00:00:00Z', number: 2 }),
    ];
    mockFetchByUrl(mergedItems);

    const response = await onRequest(createContext(null));
    const body = await response.json();

    expect(body[0].title).toBe('with-date');
    expect(body[1].title).toBe('null-date');
  });

  it('includes CORS header for allowed origin', async () => {
    mockFetchByUrl([]);

    const response = await onRequest(createContext('http://localhost:1313'));
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:1313');
  });

  it('returns error response on API failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
    }));

    const response = await onRequest(createContext(null));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toContain('403');
  });
});
