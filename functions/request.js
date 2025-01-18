// Regular expressions for extracting metadata
const META_PATTERNS = {
  title: /<meta[^>]*property="og:title"[^>]*content="([^"]+)"[^>]*>/,
  description: /<meta[^>]*property="og:description"[^>]*content="([^"]+)"[^>]*>/,
  image: /<meta[^>]*property="og:image"[^>]*content="([^"]+)"[^>]*>/,
  titleFallback: /<title[^>]*>([^<]+)<\/title>/
};

// Default headers for CORS
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET',
};

/**
 * Normalizes image URL to ensure it's an absolute URL
 * @param {string} imageUrl - The image URL to normalize
 * @param {URL} baseUrl - The base URL to resolve against
 * @returns {string} - The normalized absolute URL
 */
function normalizeImageUrl(imageUrl, baseUrl) {
  if (!imageUrl) return '';
  
  if (imageUrl.startsWith('/')) {
    // Convert absolute path to full URL
    return `${baseUrl.origin}${imageUrl}`;
  }
  
  if (!imageUrl.startsWith('http')) {
    // Convert relative path to full URL
    return new URL(imageUrl, baseUrl).href;
  }
  
  return imageUrl;
}

/**
 * Processes the title, applying special handling for GitHub repositories
 * @param {string} title - The original title
 * @param {URL} baseUrl - The URL of the page
 * @returns {string} - The processed title
 */
function processTitle(title, baseUrl) {
  if (baseUrl.hostname === 'github.com' && title.includes(': ')) {
    return title.split(': ')[0];
  }
  return title;
}

/**
 * Extracts metadata from HTML content
 * @param {string} html - The HTML content
 * @param {URL} baseUrl - The URL of the page
 * @returns {Object} - The extracted metadata
 */
function extractMetadata(html, baseUrl) {
  // Extract all metadata using defined patterns
  const titleMatch = html.match(META_PATTERNS.title);
  const descriptionMatch = html.match(META_PATTERNS.description);
  const imageMatch = html.match(META_PATTERNS.image);
  const titleFallback = html.match(META_PATTERNS.titleFallback);

  // Get the raw title, falling back to titleFallback if needed
  const rawTitle = titleMatch ? titleMatch[1] : (titleFallback ? titleFallback[1] : '');
  
  return {
    title: processTitle(rawTitle, baseUrl),
    description: descriptionMatch ? descriptionMatch[1] : '',
    image: normalizeImageUrl(imageMatch ? imageMatch[1] : '', baseUrl)
  };
}

export async function onRequest(context) {
  // Extract target URL from request parameters
  const url = new URL(context.request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response('URL parameter is required', {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  try {
    // Fetch and process the target page
    const response = await fetch(targetUrl);
    const html = await response.text();
    const baseUrl = new URL(targetUrl);
    
    const metadata = extractMetadata(html, baseUrl);

    return new Response(JSON.stringify(metadata), {
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
      },
    });
  }
}