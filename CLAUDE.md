# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Hugo-based blog hosted at <https://blog.koh-sh.com>, deployed via Cloudflare Pages with serverless functions for dynamic content.

## Common Commands

### Development

- `make dev` - Start development environment (Hugo server + Wrangler dev + auto-open browser)
- `make server` - Start Hugo development server only
- `hugo server` - Alternative Hugo server command

### Content Creation

- `make new` - Interactive prompt to create new blog post
- `hugo new posts/filename.md` - Create new post directly
- `make ss` - Convert latest screenshot to AVIF and organize for current WIP post

### Building & Deployment

- `make build` - Build Hugo site to `public/` directory
- `hugo` - Alternative build command

### Code Quality

- `npm run lint` - Lint TypeScript/JavaScript files in functions/
- `npm run type-check` - Run TypeScript type checking
- `npm run ci` - Run both lint and type-check (use before committing)

### Dependencies

- `make mod` - Update Hugo modules
- `hugo mod get -u` - Alternative Hugo module update

## Project Architecture

### Hugo Site Structure

- `content/posts/` - Blog posts in Markdown format
- `layouts/` - Hugo template overrides for the anatole theme
- `static/` - Static assets (images, CSS, JS)
- `config.toml` - Hugo configuration with theme settings and social links
- `archetypes/default.md` - Template for new posts

### Cloudflare Integration

- `functions/github-contributions.ts` - Serverless function to fetch GitHub PR contributions
- `wrangler.toml` - Cloudflare Pages configuration
- TypeScript configured for Cloudflare Workers environment

### Development Tools

- ESLint configuration with TypeScript rules
- TypeScript configured for ES2020 with DOM types
- Textlint with Japanese technical writing presets for content quality
- Utility script for automated screenshot conversion
- GitHub Actions CI/CD pipeline for automated testing and building

## Key Features

### Screenshot Workflow

The `make ss` command automates screenshot management:

1. Finds latest screenshot from ~/Desktop
2. Converts PNG to AVIF format using cavif
3. Detects current WIP post and creates appropriate image directory
4. Moves converted image with auto-incrementing filename
5. Outputs markdown image syntax for easy insertion

### GitHub Contributions API

The `/functions/github-contributions.ts` endpoint:

- Fetches merged PRs from external repositories
- Provides CORS-enabled API for the blog
- Includes OpenGraph image URLs for PR previews
- Implements proper error handling and caching

### Theme and Styling

- Uses anatole theme via Hugo modules
- Custom layouts in `layouts/` directory override theme defaults
- Static assets in `static/` supplement theme resources
- Responsive design with CJK language support

## Development Notes

### Prerequisites

- Hugo (latest version)
- Node.js and npm
- `cavif` command-line tool for image conversion
- Wrangler CLI for Cloudflare development

### Testing

- Use `make dev` for full development environment
- Test both Hugo site and Cloudflare functions locally
- Run `npm run ci` before commits to ensure code quality

### Content Guidelines

- Posts use front matter with title, date, tags, and optional images
- Images stored in `static/images/[post-name]/` directories
- AVIF format preferred for optimal performance
- Use `make ss` workflow for consistent image management
- Content should pass textlint checks for Japanese technical writing standards

## CI/CD Pipeline

### GitHub Actions Workflow

The `.github/workflows/ci.yml` automatically runs on push and PR:

1. **Code Quality Checks**
   - ESLint for TypeScript files
   - TypeScript type checking

2. **Build Verification**
   - Hugo site build with minification
   - Dart Sass compilation

### Automated Dependencies

- Dependabot configured for npm, Go modules, and GitHub Actions updates
- Weekly automated dependency updates via PRs
