// GitHub contributions functionality
const MAX_DESCRIPTION_LENGTH = 140;

function getDescription(markdown, maxLength = MAX_DESCRIPTION_LENGTH) {
    if (!markdown) return '';

    return markdown
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#') && !line.startsWith('!['))
        .join(' ')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*`]/g, '')
        .trim()
        .slice(0, maxLength) + (markdown.length > maxLength ? '...' : '');
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function createPrElement(pr) {
    const repoFullName = pr.repo_name;
    const isOpen = pr.state === 'open';
    const dateLabel = isOpen ? 'Created on' : 'Merged on';
    const dateValue = isOpen ? pr.created_at : pr.closed_at;
    const formattedDate = dateValue ? formatDate(dateValue) : 'Unknown';
    const description = getDescription(pr.body);
    const stateClass = isOpen ? 'pr-open' : 'pr-merged';

    return `
    <a href="${pr.html_url}" class="contribution-item" target="_blank" rel="noopener">
        <div class="contribution-main">
            <div class="contribution-header">
                <svg class="pr-icon ${stateClass}" viewBox="0 0 16 16">
                    <path d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"/>
                </svg>
                <div class="contribution-content">
                    <h3 class="contribution-title">${escapeHtml(pr.title)}</h3>
                    <div class="contribution-meta">
                        ${repoFullName} • ${dateLabel} ${formattedDate}
                    </div>
                </div>
            </div>
            ${description ? `<div class="contribution-description">${escapeHtml(description)}</div>` : ''}
        </div>
        <img src="${pr.og_image}" alt="Repository preview" class="contribution-image" loading="lazy" onerror="this.style.opacity='0'">
    </a>
    `;
}

async function fetchContributions() {
    const isLocalhost = window.location.hostname === 'localhost';
    const baseUrl = isLocalhost ? 'http://localhost:8788' : '';

    try {
        const response = await fetch(`${baseUrl}/github-contributions`);
        if (!response.ok) throw new Error('Failed to fetch contributions');

        return await response.json();
    } catch (error) {
        throw new Error(`Error loading contributions: ${error.message}`);
    }
}

async function initializeContributionsList() {
    const contributionsList = document.getElementById('contributions-list');

    try {
        contributionsList.innerHTML = '<div class="error-container"><div class="error-message">Loading...</div></div>';

        const contributions = await fetchContributions();
        if (contributions.length === 0) {
            contributionsList.innerHTML = '<div class="error-container"><div class="error-message">No contributions found.</div></div>';
            return;
        }

        contributionsList.innerHTML = contributions.map(createPrElement).join('');
    } catch (error) {
        contributionsList.innerHTML = `
            <div class="error-container">
                <svg class="error-icon" viewBox="0 0 24 24">
                    <path d="M12 7c.55 0 1 .45 1 1v4c0 .55-.45 1-1 1s-1-.45-1-1V8c0-.55.45-1 1-1zm-.01-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm1-3h-2v-2h2v2z"/>
                </svg>
                <div class="error-message">Failed to load data.<br>Please try again later.</div>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', initializeContributionsList);
