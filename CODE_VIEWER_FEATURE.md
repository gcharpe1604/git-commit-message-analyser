# Code Viewer Feature - GitHub-like Diff Display

## Overview
The Code Viewer component displays actual code changes from commits, similar to GitHub's interface. Users can expand files to see line-by-line changes with syntax highlighting and color coding.

## Features

### 1. File List with Metadata
- Shows all files changed in the commit
- File icons based on file type (JS, Python, Go, etc.)
- Status badges (added, removed, modified, renamed)
- Line change statistics (+additions, -deletions)

### 2. Expandable Diff View
- Click on any file to expand and view changes
- Shows actual code diff with context
- Color-coded lines:
  - **Green** - Added lines
  - **Red** - Removed lines
  - **White** - Context (unchanged) lines
  - **Gray** - Diff headers

### 3. GitHub Integration
- "🔗" button to open file on GitHub
- Direct link to the exact commit version
- Opens in new tab

### 4. File Type Detection
Automatically detects file types and shows appropriate icons:
- JavaScript/TypeScript: 📄 / ⚛️
- Python: 🐍
- Go: 🐹
- Rust: 🦀
- Ruby: 💎
- PHP: 🐘
- HTML/CSS: 🌐 / 🎨
- JSON/XML: 📋
- Markdown: 📝
- And more...

## How It Works

### Data Flow
```
User clicks "View Changes"
    ↓
Fetches commit details from GitHub API
    ↓
Extracts patch/diff information
    ↓
Parses diff format (unified diff)
    ↓
Displays with syntax highlighting
```

### Diff Parsing
The component parses unified diff format:
```
@@ -10,5 +10,6 @@ function example() {
 // Context line (unchanged)
-// Removed line
+// Added line
 // Another context line
```

### Line Types
- **Added** (`+`): New code added in this commit
- **Removed** (`-`): Code deleted in this commit
- **Context** (` `): Unchanged code for reference
- **Header** (`@@`): Diff section markers

## UI Components

### CodeViewer.tsx
Main component that:
- Manages expanded/collapsed state for each file
- Parses diff content
- Renders diff lines with proper styling
- Handles GitHub links

### Visual Indicators
- **Color-coded badges** for file status
- **Line markers** (+/-/space) for change type
- **Hover effects** for better UX
- **File icons** for quick type identification

## Example Display

```
📝 Code Changes
Click on files to view detailed changes

📄 src/utils/api.ts [MODIFIED] +15 -3 [🔗]
  ▼ (expanded)
  
  @@ -10,5 +10,6 @@ export function fetchData() {
    const url = 'https://api.example.com'
  - const response = await fetch(url)
  + const response = await fetch(url, { timeout: 5000 })
    return response.json()
  + // Added error handling
    
⚛️ src/components/Button.tsx [ADDED] +45 -0 [🔗]
  ▶ (collapsed)
  
🐍 tests/api.test.py [MODIFIED] +20 -5 [🔗]
  ▶ (collapsed)
```

## API Integration

### GitHub API Endpoint
```
GET /repos/{owner}/{repo}/commits/{sha}
```

### Response Data Used
- `files[].filename` - File path
- `files[].status` - Change type
- `files[].additions` - Lines added
- `files[].deletions` - Lines removed
- `files[].patch` - Unified diff format

## Styling Features

### Color Scheme
- **Added lines**: Light green background (#f0f8f0)
- **Removed lines**: Light red background (#f8f0f0)
- **Context lines**: White background
- **Headers**: Light gray background (#f0f0f0)

### Responsive Design
- Desktop: Full diff display with proper spacing
- Tablet: Adjusted font sizes and padding
- Mobile: Compact view with smaller fonts

## Performance Considerations

1. **Lazy Loading**: Diffs are parsed only when file is expanded
2. **Efficient Parsing**: Simple line-by-line parsing
3. **Memory**: Only expanded files keep parsed data
4. **API Calls**: Single call per commit (includes all files)

## Limitations

1. **Patch Content**: Requires GitHub API to return patch data
2. **Large Files**: Very large diffs may be truncated by GitHub API
3. **Binary Files**: Cannot display diffs for binary files
4. **Rate Limiting**: Subject to GitHub API rate limits (60/hour)

## Future Enhancements

1. **Syntax Highlighting**: Add language-specific code highlighting
2. **Side-by-Side View**: Show before/after code side by side
3. **Search**: Find specific changes in large diffs
4. **Collapse Context**: Hide unchanged lines to focus on changes
5. **Copy Code**: Copy individual lines or entire files
6. **Blame View**: Show who made each change
7. **File Tree**: Hierarchical view of changed files

## Testing

### Test Cases
1. Single file modification
2. Multiple file changes
3. File additions
4. File deletions
5. File renames
6. Large diffs
7. Binary files

### Example Repositories
- `torvalds/linux` - Large kernel commits
- `facebook/react` - Feature commits
- `nodejs/node` - Mixed changes
- `python/cpython` - Well-documented changes

## Accessibility

- Keyboard navigation support
- Color-blind friendly (uses symbols + colors)
- Screen reader compatible
- Proper semantic HTML

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- IE11: Not supported (uses modern JavaScript)

## Code Example

```tsx
<CodeViewer 
  files={commitDetails.files} 
  owner="facebook"
  repo="react" 
  commitSha="abc123def456"
/>
```

## Integration Points

The CodeViewer is integrated into:
1. **CommitDiff.tsx** - Main diff display component
2. **CommitCard.tsx** - Individual commit cards
3. **ResultsDisplay.tsx** - Analysis results view

## User Workflow

1. User selects a repository
2. Commits are analyzed and displayed
3. User clicks "View Changes" on a commit
4. CommitDiff component loads and displays file list
5. User clicks on a file to expand
6. CodeViewer displays the diff
7. User can click GitHub link to see on GitHub
8. User can review code changes and commit message quality
