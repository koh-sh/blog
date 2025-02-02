// Types for GitHub API responses and internal data structures
interface GitHubPR {
    title: string;
    body: string | null;
    html_url: string;
    closed_at: string;
    repository_url: string;
    number: number;
}

interface GitHubSearchResponse {
    items: GitHubPR[];
    total_count: number;
}

interface PRData {
    title: string;
    body: string | null;
    html_url: string;
    closed_at: string;
    repo_name: string;
    og_image: string;
}

// Configuration constants
const CONFIG = {
    github: {
        account: 'koh-sh',
        apiBase: 'https://api.github.com',
        userAgent: 'CloudflareWorker',
        apiVersion: 'application/vnd.github.v3+json'
    },
    cors: {
        allowedOrigins: ['http://localhost:1313'] as string[],
        maxAge: '86400',
        allowedMethods: 'GET,OPTIONS'
    },
    cache: {
        duration: 3600
    }
} as const;

// Build GitHub search query with specified parameters
const buildGitHubSearchQuery = (account: string): string => {
    return `is:pr archived:false is:merged is:public author:${account} -user:${account}`;
};

// Construct the full search URL for GitHub API
const buildSearchUrl = (query: string): string => {
    return `${CONFIG.github.apiBase}/search/issues?q=${encodeURIComponent(query)}&sort=created&order=desc`;
};

// Validate if the origin is in the allowed list
const isAllowedOrigin = (origin: string | null): boolean => {
    return origin !== null && CONFIG.cors.allowedOrigins.includes(origin);
};

// Transform GitHub PR data into our internal format
const buildPrData = (item: GitHubPR): PRData => {
    const repoPath = item.repository_url.split('/repos/')[1];
    return {
        title: item.title,
        body: item.body,
        html_url: item.html_url,
        closed_at: item.closed_at,
        repo_name: repoPath,
        og_image: `https://opengraph.githubassets.com/1/${repoPath}/pull/${item.number}`
    };
};

// Generate response headers with CORS and cache settings
const getResponseHeaders = (origin: string | null): Record<string, string> => {
    const headers: Record<string, string> = {
        'content-type': 'application/json;charset=UTF-8',
        'cache-control': `public, max-age=${CONFIG.cache.duration}`,
        'Access-Control-Allow-Methods': CONFIG.cors.allowedMethods,
        'Access-Control-Max-Age': CONFIG.cors.maxAge
    };

    if (origin && isAllowedOrigin(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
    }

    return headers;
};

interface RequestContext {
    request: {
        headers: {
            get(name: string): string | null;
        };
    };
}

// Custom error class for API-related errors
class APIError extends Error {
    constructor(
        message: string,
        public status: number = 500
    ) {
        super(message);
        this.name = 'APIError';
    }
}

// Fetch and process GitHub PR data
const fetchGitHubPRs = async (): Promise<GitHubSearchResponse> => {
    const searchResponse = await fetch(
        buildSearchUrl(buildGitHubSearchQuery(CONFIG.github.account)),
        {
            headers: {
                'Accept': CONFIG.github.apiVersion,
                'User-Agent': CONFIG.github.userAgent
            }
        }
    );

    if (!searchResponse.ok) {
        throw new APIError(
            `GitHub API responded with ${searchResponse.status}`,
            searchResponse.status
        );
    }

    return searchResponse.json();
};

// Main request handler for Cloudflare Workers
export async function onRequest(context: RequestContext): Promise<Response> {
    const origin = context.request.headers.get('Origin');

    try {
        const data = await fetchGitHubPRs();
        const prs = data.items.map(buildPrData);

        return new Response(
            JSON.stringify(prs),
            { headers: getResponseHeaders(origin) }
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const statusCode = error instanceof APIError ? error.status : 500;

        return new Response(
            JSON.stringify({ error: errorMessage }),
            {
                status: statusCode,
                headers: getResponseHeaders(origin)
            }
        );
    }
}
