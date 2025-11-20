# Commit Diff & Suggestion Feature

## Overview
The analyzer now shows file changes for each commit and provides intelligent suggestions for better commit messages based on the actual changes made.

## Features

### 1. View Changes Button
- Each commit card now has a "📁 View Changes" button
- Click to expand and see all files modified in that commit
- Shows file status (added, removed, modified, renamed)

### 2. File Change Details
For each file, displays:
- **Filename** - Full path to the file
- **Status** - Color-coded badge (green=added, red=removed, blue=modified, orange=renamed)
- **Statistics** - Number of lines added (+) and deleted (-)

### 3. Commit Statistics
Shows overall commit impact:
- **Files Changed** - Total number of files modified
- **Additions** - Total lines added (green)
- **Deletions** - Total lines removed (red)

### 4. Smart Suggestions
Based on the files changed, the tool suggests better commit messages:

**Examples:**
- Single file added: `feat: add filename.js`
- Single file removed: `refactor: remove filename.js`
- Multiple files with tests: `test: add comprehensive test coverage`
- Multiple files with docs: `docs: update documentation`
- Multiple files with config: `chore: update configuration files`
- Multiple additions: `feat: add new features (5 files)`
- Multiple modifications: `refactor: improve code structure (8 files)`

## How It Works

### Data Flow
```
User clicks "View Changes"
    ↓
Fetches commit details from GitHub API
    ↓
Extracts file changes and statistics
    ↓
Analyzes file types and patterns
    ↓
Generates intelligent suggestions
    ↓
Displays results with visual indicators
```

### API Endpoint
```
GET /repos/{owner}/{repo}/commits/{sha}
```

Returns:
- Commit message and metadata
- Array of files with:
  - filename
  - status (added/removed/modified/renamed)
  - additions (lines added)
  - deletions (lines removed)
  - patch (diff content)
- Statistics (total additions/deletions)

## Suggestion Algorithm

The suggestion generator analyzes:

1. **File Count**
   - Single file: Specific suggestion for that file
   - Multiple files: General suggestion

2. **File Types**
   - Test files (test, spec): Suggests test-related message
   - Documentation (README, .md): Suggests docs message
   - Config files (config, package.json, .env): Suggests chore message

3. **Change Type**
   - Added files: Uses "feat" (feature)
   - Removed files: Uses "refactor" (refactoring)
   - Modified files: Uses "fix" or "refactor"

4. **Conventional Commits Format**
   - Follows standard: `<type>(<scope>): <subject>`
   - Types: feat, fix, refactor, test, docs, chore
   - Scope: Optional, derived from filename

## Example Scenarios

### Scenario 1: Single File Addition
```
Files Changed:
- src/components/Button.tsx (ADDED, +45 lines)

Suggestion:
feat: add Button component
```

### Scenario 2: Multiple File Changes
```
Files Changed:
- src/utils/api.ts (MODIFIED, +20 lines, -5 lines)
- src/utils/helpers.ts (MODIFIED, +15 lines, -10 lines)
- tests/api.test.ts (ADDED, +50 lines)

Suggestion:
test: add comprehensive test coverage
```

### Scenario 3: Configuration Update
```
Files Changed:
- package.json (MODIFIED, +2 lines, -1 line)
- .env.example (MODIFIED, +3 lines)
- webpack.config.js (MODIFIED, +10 lines, -5 lines)

Suggestion:
chore: update configuration files
```

## UI Components

### CommitDiff.tsx
- Main component for displaying file changes
- Fetches commit details from GitHub API
- Generates suggestions
- Manages expand/collapse state

### Visual Indicators
- **Color-coded badges** for file status
- **Green** for additions
- **Red** for deletions
- **Blue** for modifications
- **Orange** for renames

## Benefits

1. **Learn from Real Code** - See what changes were actually made
2. **Better Commit Messages** - Get suggestions based on actual changes
3. **Understand Patterns** - Learn how experienced developers write commits
4. **Improve Quality** - Use suggestions to write better messages

## Limitations

- GitHub API rate limit: 60 requests/hour (unauthenticated)
- Patch content not displayed (only file metadata)
- Works only with public repositories

## Future Enhancements

- Show actual diff/patch content
- Filter commits by file type
- Compare commit message with suggested message
- Track improvement over time
- Export suggestions as guidelines

## Testing

Try these repositories to see different commit patterns:
- `torvalds/linux` - Large kernel commits
- `facebook/react` - Feature-rich commits
- `nodejs/node` - Mixed commit types
- `python/cpython` - Well-documented commits
