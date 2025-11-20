# Quick Start Guide

## Installation & Setup

### 1. Install Dependencies
```bash
cd git-commit-message-analyzer
npm instcdall
```

### 2. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 3. Build for Production
```bash
npm run build
```

Output will be in the `dist/` folder, ready to deploy.

## Using the App

### Step 1: Enter GitHub Username
1. Open the app in your browser
2. Enter a GitHub username (e.g., `torvalds`, `gvanrossum`)
3. Click "View Repositories"

### Step 2: Select a Repository
1. Browse the list of public repositories
2. Click on any repository to analyze it
3. The app will fetch and analyze recent commits

### Step 3: View Analysis Results
1. See all commits with scores (0-100%)
2. Color-coded badges:
   - 🟢 Green (90-100%): Excellent
   - 🔵 Blue (70-89%): Good
   - 🟠 Orange (50-69%): Fair
   - 🔴 Red (0-49%): Poor

### Step 4: View Code Changes
1. Click "📁 View Changes" on any commit
2. See file statistics (additions/deletions)
3. Click on a file to expand and view the diff
4. Click "🔗" to open the file on GitHub

### Step 5: Review Your Own Messages
1. Scroll to "Commit Message Review" section
2. Paste your commit message
3. Click "Analyze Message"
4. Get instant feedback and suggestions

## Features Overview

### 📊 Commit Analysis
- Analyzes message length, clarity, and structure
- Checks for vague language
- Validates proper verb usage
- Provides specific feedback

### 📝 Code Viewer
- Shows actual code changes like GitHub
- Color-coded diff (green=added, red=removed)
- File type icons
- Direct links to GitHub

### 💬 Commit Review Tool
- Test your messages before committing
- Real-time analysis
- Suggestions for improvement
- Perfect for learning best practices

### 📥 Export Results
- Download analysis as CSV
- Track improvements over time
- Share with team members

## Example Workflows

### Workflow 1: Learn from Popular Projects
```
1. Enter username: "torvalds"
2. Select repository: "linux"
3. View commits from Linux kernel
4. Analyze commit message patterns
5. Learn best practices
```

### Workflow 2: Improve Your Commits
```
1. Write a commit message
2. Go to "Commit Message Review"
3. Paste your message
4. Get feedback
5. Improve and commit
```

### Workflow 3: Team Analysis
```
1. Enter your team member's username
2. Analyze their repositories
3. Export results
4. Share findings with team
5. Discuss improvements
```

## Tips & Tricks

### 1. Popular Developers to Learn From
- **Linus Torvalds** (`torvalds`) - Linux kernel
- **Guido van Rossum** (`gvanrossum`) - Python
- **David Heinemeier Hansson** (`dhh`) - Ruby on Rails

### 2. Understanding Scores
- **90-100%**: Perfect message, ready to commit
- **70-89%**: Good message, minor improvements possible
- **50-69%**: Fair message, needs work
- **0-49%**: Poor message, significant improvements needed

### 3. Common Issues Found
- **Too short**: Message less than 10 characters
- **Too long**: Message exceeds 72 characters
- **Vague language**: Uses "fix", "update", "changes" without context
- **No proper verb**: Doesn't start with imperative verb
- **Wrong format**: Doesn't follow conventional commits

### 4. Best Practices
- Start with imperative verb (Add, Fix, Remove, etc.)
- Keep first line under 72 characters
- Be specific about what changed
- Use conventional commit format: `type(scope): subject`
- Add body for complex changes

## Keyboard Shortcuts

- `Enter` - Submit form
- `Escape` - Close expanded views (coming soon)
- `Ctrl+K` - Focus search (coming soon)

## Troubleshooting

### Blank Screen After Selecting Repo
1. Restart dev server (`npm run dev`)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Hard refresh (Ctrl+Shift+R)

### "User not found"
- Check username spelling
- Try a different username
- Verify user exists on GitHub

### "API rate limit exceeded"
- Wait 1 hour
- Try a different username
- Use GitHub token (requires backend)

### No commits showing
- Repository might be empty
- Try a different repository
- Check if repository is public

## Deployment

### Deploy to GitHub Pages
```bash
npm run build
# Upload dist/ folder to GitHub Pages
```

### Deploy to Netlify
```bash
npm run build
# Drag and drop dist/ folder to Netlify
```

### Deploy to Vercel
```bash
npm run build
# Connect repository to Vercel
```

## API Limits

- **Unauthenticated**: 60 requests/hour
- **Per-page**: 100 items max
- **Commits fetched**: 30 most recent

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- IE11: ❌ Not supported

## Next Steps

1. **Learn**: Analyze commits from popular projects
2. **Practice**: Use the review tool for your messages
3. **Improve**: Apply feedback to your commits
4. **Share**: Export results and discuss with team
5. **Master**: Write perfect commits every time

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Commit Messages](https://github.com/torvalds/linux/log)
- [Git Best Practices](https://git-scm.com/book/en/v2)

## Support

For issues or questions:
1. Check TROUBLESHOOTING.md
2. Review browser console for errors
3. Try with a different repository
4. Restart the dev server

Happy analyzing! 🚀
