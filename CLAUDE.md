# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Japanese stock price analysis web application (株価分析アプリ) that provides real-time stock data visualization and technical analysis with modern UI design using TailwindCSS.

## Project Structure

- `index.html` - Main application HTML file with Japanese interface and TailwindCSS styling
- `styles.css` - Legacy CSS file (now mostly replaced by TailwindCSS)
- `script.js` - JavaScript application logic with StockAnalyzer class
- `README.md` - Project documentation
- `CLAUDE.md` - This file with project guidance

## Key Features

The application includes:

- Stock symbol search functionality
- Real-time price display with change indicators
- Interactive price chart using Chart.js
- Basic statistics display (high, low, volume)
- Technical indicators (20-day MA, 50-day MA, RSI)
- Multiple data sources:
    - Yahoo Finance API (free, real-time data via CORS proxy)
    - Demo data for testing
- 5-minute caching system to reduce API requests
- API source selection (Yahoo Finance / Demo data)
- Modern glassmorphism UI design with TailwindCSS
- Responsive design with mobile-first approach
- Gradient background with backdrop blur effects

## Technology Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Styling**: TailwindCSS (CDN) with glassmorphism design
- **Charts**: Chart.js for data visualization
- **APIs**: Yahoo Finance API via CORS proxy (allorigins.win)
- **Deployment**: GitHub Pages (public repository)

## Development Notes

- Uses TailwindCSS CDN for modern utility-first styling with custom configuration
- Application interface is in Japanese with full accessibility support (ARIA, semantic HTML)
- Uses allorigins.win as CORS proxy to access Yahoo Finance API
- Implements client-side caching to minimize API requests
- Falls back to demo data if real API fails
- Modern build process with ESLint, Prettier, and automated CI/CD
- All files are functional and ready for production

## Development Workflow

### Code Quality

- **ESLint**: Automated code linting with custom rules
- **Prettier**: Consistent code formatting
- **GitHub Actions**: Automated CI/CD pipeline
- **Pre-commit hooks**: Code quality enforcement

### Build Process

- **Development**: `npm run dev` - Local development server
- **Linting**: `npm run lint` - Code quality checks
- **Formatting**: `npm run format` - Code formatting
- **Build**: `npm run build` - Production optimization
- **Deploy**: `npm run deploy` - GitHub Pages deployment

### Accessibility & Performance

- WCAG 2.1 AA compliance with semantic HTML and ARIA attributes
- Improved color contrast and focus states
- Screen reader compatibility
- Responsive design with mobile-first approach
- SRI integrity hashes for CDN security

## Git Configuration

- Repository: https://github.com/kawamuragen/claude-code-trial
- Visibility: Public (for free GitHub Pages hosting)
- Default branch: main

## Deployment

- **GitHub Pages**: https://kawamuragen.github.io/claude-code-trial/
- Deployed from main branch root directory
- Auto-deploys on push to main branch

## Recent Changes

- Implemented TailwindCSS for modern UI design
- Added glassmorphism effects with backdrop blur
- Improved responsive layout with grid system
- Enhanced visual hierarchy and typography
- Created and merged PR #1 for TailwindCSS implementation
- Configured GitHub Pages for public hosting
