# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Hugo-based blog hosted at <https://blog.koh-sh.com>, deployed via Cloudflare Pages with serverless functions for dynamic content.

## Common Commands

### Development

- `make dev` - Start full development environment (Hugo server + Wrangler dev + auto-open browser)
- `make server` - Start Hugo development server only

### Content Creation

- `make new` - Interactive prompt to create new blog post
- `make ss` - Convert latest screenshot to AVIF and organize for current WIP post

### Building & Deployment

- `make build` - Build Hugo site to `public/` directory

### Code Quality

- `npm run lint` - Lint TypeScript/JavaScript files in functions/
- `npm run type-check` - Run TypeScript type checking
- `npm run ci` - Run both lint and type-check (use before committing)
### Dependencies

- `make mod` - Update Hugo modules
- `npm install` - Install Node.js dependencies

## Tool Versions

Managed via `mise.toml`:
- Hugo Extended: 0.157.0
- Node.js: 24.5.0

The CI pipeline also pins the same Hugo version. Keep these in sync when updating.

## Project Architecture

### Hugo Site Structure

- `content/posts/` - Blog posts in Markdown
- `layouts/` - Hugo template overrides for the anatole theme
- `static/` - Static assets (images, CSS, JS)
- `assets/css/` - Custom CSS (contributions, text-wrapping, about page)
- `assets/js/` - Client-side JavaScript (GitHub contributions loader)
- `config.toml` - Hugo configuration with theme settings, menu, and social links
- `archetypes/default.md` - Template for new posts
- `i18n/ja.yaml` - Japanese localization strings

### Cloudflare Integration

- `functions/github-contributions.ts` - Serverless function to fetch GitHub PR contributions
- `wrangler.toml` - Cloudflare Pages configuration
- TypeScript configured for Cloudflare Workers environment

### Development Tools

- ESLint with TypeScript rules for `functions/` directory
- TypeScript strict mode (ES2020 target)
- Textlint with `preset-ja-technical-writing` and `@textlint-ja/preset-ai-writing` for content quality
- `_utils/makeavif.sh` - Screenshot conversion utility

## Key Features

### Screenshot Workflow (`make ss`)

1. Finds latest screenshot from ~/Desktop
2. Converts PNG to AVIF format using `cavif` CLI
3. Detects current WIP post from git untracked files
4. Auto-increments filenames (1.avif, 2.avif, etc.) in `static/images/[post-name]/`
5. Outputs markdown image syntax for easy insertion

### GitHub Contributions API

The `functions/github-contributions.ts` endpoint:
- Fetches merged/open PRs from external repositories via GitHub API
- CORS-enabled (localhost allowed in development)
- 1-hour cache duration
- Client-side rendering via `assets/js/contributions.js`

## Content Guidelines

- Posts use front matter: title, date, tags, and optional images (for OGP)
- Images stored in `static/images/[post-name]/` directories, AVIF format preferred
- Content should pass textlint checks for Japanese technical writing standards

## CI/CD Pipeline

GitHub Actions (`.github/workflows/ci.yml`) runs on push to main and all PRs:
1. ESLint + TypeScript type checking
2. Hugo build with minification (using pinned Hugo version)

Dependabot manages weekly updates for npm, Go modules, and GitHub Actions.
