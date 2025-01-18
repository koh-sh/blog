// Set the worker endpoint based on environment
const WORKER_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:8788/request'
  : '/request';

/**
 * Updates the preview card title if necessary
 * @param {Element} preview - The preview card element
 * @param {string} url - The original URL
 * @param {Object} metadata - The metadata from the worker
 */
function updateTitle(preview, url, metadata) {
  const titleElement = preview.querySelector('.link-preview-title');
  const cleanURL = url.replace(/\/$/, '');
  
  const shouldUpdate = titleElement && 
    (titleElement.textContent === url || titleElement.textContent === cleanURL) && 
    metadata.title;

  if (shouldUpdate) {
    titleElement.textContent = metadata.title;
  }
}

/**
 * Adds description to the preview card if available
 * @param {Element} preview - The preview card element
 * @param {Object} metadata - The metadata from the worker
 */
function addDescription(preview, metadata) {
  if (!metadata.description || preview.querySelector('.link-preview-description')) {
    return;
  }

  const descElement = document.createElement('p');
  descElement.className = 'link-preview-description';
  descElement.textContent = metadata.description;
  
  const textContainer = preview.querySelector('.link-preview-text');
  const urlElement = preview.querySelector('.link-preview-url');
  textContainer.insertBefore(descElement, urlElement);
}

/**
 * Adds image to the preview card if available
 * @param {Element} preview - The preview card element
 * @param {string} url - The original URL
 * @param {Object} metadata - The metadata from the worker
 */
function addImage(preview, url, metadata) {
  if (!metadata.image || preview.querySelector('.link-preview-image')) {
    return;
  }

  const container = preview.querySelector('.link-preview-content');
  const img = document.createElement('img');
  
  img.src = metadata.image;
  img.alt = metadata.title || url;
  img.className = 'link-preview-image';
  img.loading = 'lazy';
  
  container.appendChild(img);
}

/**
 * Updates a preview card with metadata
 * @param {Element} preview - The preview card element
 * @param {string} url - The URL to fetch metadata for
 */
async function updatePreviewCard(preview, url) {
  try {
    // Fetch metadata from the worker
    const response = await fetch(`${WORKER_URL}/?url=${encodeURIComponent(url)}`);
    if (!response.ok) {
      console.error('Worker response not ok:', await response.text());
      return;
    }

    const metadata = await response.json();

    // Update preview card components
    updateTitle(preview, url, metadata);
    addDescription(preview, metadata);
    addImage(preview, url, metadata);
  } catch (error) {
    console.error('Failed to fetch metadata:', error);
  }
}

// Initialize preview cards when the DOM is loaded
document.addEventListener('DOMContentLoaded', async function () {
  const previews = document.querySelectorAll('.link-preview');

  for (const preview of previews) {
    const url = preview.dataset.url;
    if (url) {
      await updatePreviewCard(preview, url);
    }
  }
});
