const GITHUB_ACCOUNT = 'koh-sh';
const GITHUB_SEARCH_QUERY = `is:pr archived:false is:merged is:public author:${GITHUB_ACCOUNT} -user:${GITHUB_ACCOUNT}`;
const GITHUB_API_BASE = 'https://api.github.com';
const ALLOWED_ORIGINS = ['http://localhost:1313'];
const CACHE_DURATION = 3600;

function buildSearchUrl(query) {
  return `${GITHUB_API_BASE}/search/issues?q=${encodeURIComponent(query)}&sort=created&order=desc`;
}

function isAllowedOrigin(origin) {
  return origin && ALLOWED_ORIGINS.includes(origin);
}

function buildPrData(item) {
  const repoPath = item.repository_url.split('/repos/')[1];
  return {
    title: item.title,
    body: item.body,
    html_url: item.html_url,
    closed_at: item.closed_at,
    repo_name: repoPath,
    og_image: `https://opengraph.githubassets.com/1/${repoPath}/pull/${item.number}`
  };
}

function getResponseHeaders(origin) {
  const headers = {
    'content-type': 'application/json;charset=UTF-8',
    'cache-control': `public, max-age=${CACHE_DURATION}`,
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Max-Age': '86400'
  };

  if (isAllowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

export async function onRequest(context) {
  const origin = context.request.headers.get('Origin');

  try {
    const searchResponse = await fetch(buildSearchUrl(GITHUB_SEARCH_QUERY), {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CloudflareWorker'
      }
    });

    if (!searchResponse.ok) {
      throw new Error(`GitHub API responded with ${searchResponse.status}`);
    }

    const data = await searchResponse.json();
    const prs = data.items.map(buildPrData);

    return new Response(
      JSON.stringify(prs),
      { headers: getResponseHeaders(origin) }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: getResponseHeaders(origin)
      }
    );
  }
}
