# Git Commit Message Analyzer - Project Guide

## Overview
This is a React + Vite project that analyzes GitHub commit messages for clarity and structure. It fetches commits from any public GitHub repository and provides detailed feedback on each message.

## Project Structure

```
src/
├── components/          # React components
│   ├── RepositoryInput.tsx    # Input form for GitHub URL
│   ├── ResultsDisplay.tsx     # Main results container
│   ├── CommitCard.tsx         # Individual commit display
│   ├── SummaryStats.tsx       # Statistics summary
│   └── ExportButton.tsx       # CSV export functionality
├── utils/              # Utility functions
│   ├── githubApi.ts    # GitHub API calls
│   └── analyzer.ts     # Commit analysis logic
├── types/              # TypeScript types
│   └── index.ts        # Type definitions
├── App.tsx             # Main app component
├── App.css             # App styling
├── index.css           # Global styles
└── main.tsx            # Entry point
```

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 3. Build for Production
```bash
npm run build
```

## How It Works

### 1. User Input
- User enters a GitHub repository URL (e.g., `https://github.com/username/repo-name`)
- The app validates the URL format

### 2. Fetch Commits
- Uses GitHub API to fetch the 30 most recent commits
- No authentication required for public repositories
- Extracts: message, author, date, and commit SHA

### 3. Analyze Each Commit
The analyzer checks for:
- **Length**: Message should be 10-72 characters (conventional commits standard)
- **Clarity**: Avoids vague words like "fix", "update", "changes" without context
- **Structure**: 
  - Starts with capital letter and imperative verb
  - No period at end of first line
  - Blank second line for multi-line messages
- **Verb Usage**: Checks if message starts with proper verbs (add, remove, refactor, etc.)

### 4. Scoring System
- **100 points**: Perfect message
- **90-99**: Excellent (minor issues)
- **70-89**: Good (some improvements needed)
- **50-69**: Fair (multiple issues)
- **Below 50**: Poor (significant improvements needed)

Each issue deducts points:
- Too short: -20 points
- Exceeds 72 chars: -10 points
- Vague language: -15 points
- No proper verb: -15 points
- Period at end: -5 points
- Wrong structure: -10 points

### 5. Display Results
- Shows all commits with scores and feedback
- Summary statistics (total, average score, distribution)
- Color-coded badges (green=excellent, blue=good, orange=fair, red=poor)
- Specific issues and suggestions for each commit

### 6. Export Results
- Download analysis as CSV file
- Includes all commits, scores, and issues
- Timestamped filename

## Key Features

✅ **No Backend Required** - Uses GitHub API directly from browser
✅ **Public Repos Only** - No authentication needed
✅ **Real-time Analysis** - Instant feedback on commit quality
✅ **Clean UI** - Student-friendly interface
✅ **Responsive Design** - Works on mobile and desktop
✅ **Export Functionality** - Save results as CSV

## Analysis Rules Explained

### Good Commit Message Example
```
Add user authentication to login page
```
- ✓ Starts with verb (Add)
- ✓ Clear and specific
- ✓ Under 72 characters
- ✓ No period at end
- Score: 100%

### Poor Commit Message Example
```
fix
```
- ✗ Too short
- ✗ Vague (what was fixed?)
- ✗ No context
- Score: 60%

## Tips for Your OJT

1. **Test with Popular Repos**: Try analyzing repos like:
   - `https://github.com/facebook/react`
   - `https://github.com/torvalds/linux`
   - `https://github.com/nodejs/node`

2. **Understand Conventional Commits**: The analyzer follows the Conventional Commits standard:
   - Format: `<type>(<scope>): <subject>`
   - Example: `feat(auth): add login validation`

3. **Extend the Analyzer**: You can add more rules:
   - Check for issue references (#123)
   - Validate commit types (feat, fix, docs, etc.)
   - Add language detection
   - Check for emoji usage

4. **Improve the UI**: Consider adding:
   - Charts/graphs for score distribution
   - Filters by score range
   - Search/filter by author
   - Dark mode toggle

## Troubleshooting

### "Repository not found"
- Check the URL format: `https://github.com/username/repo-name`
- Make sure the repository is public
- Verify the repository exists on GitHub

### "API rate limit exceeded"
- GitHub allows 60 requests per hour without authentication
- Wait an hour or use a GitHub token (requires backend)

### No commits showing
- The repository might be empty
- Try a different repository

## GitHub API Limits

- **Unauthenticated**: 60 requests/hour
- **Authenticated**: 5,000 requests/hour
- **Per-page limit**: 100 commits max

For your OJT, unauthenticated access is sufficient!

## Next Steps

1. Run `npm run dev` to start the development server
2. Test with a GitHub repository URL
3. Explore the code and understand how each component works
4. Try modifying the analysis rules in `src/utils/analyzer.ts`
5. Add new features or improve the UI

Good luck with your OJT! 🚀
