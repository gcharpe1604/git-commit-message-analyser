```markdown
# gitanalyzer Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches you the core development patterns and conventions used in the `gitanalyzer` TypeScript codebase. You'll learn how to structure files, write and organize code, follow commit conventions, and implement and test features in a consistent, maintainable way. While no specific framework is used, the repository demonstrates clear standards for code style and workflow.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `commitParser.ts`, `analyzeRepo.ts`

### Import Style
- Use **relative imports** for internal modules.
  - Example:
    ```typescript
    import { parseCommits } from './commitParser';
    ```

### Export Style
- Use **named exports**.
  - Example:
    ```typescript
    export function analyzeRepo() { ... }
    ```

### Commit Messages
- Follow **Conventional Commits** with the `feat` prefix for features.
  - Example:
    ```
    feat: add commit analysis for merge commits
    ```
- Average commit message length: ~55 characters.

## Workflows

### Feature Development
**Trigger:** When adding a new feature to the codebase  
**Command:** `/feature-development`

1. Create a new TypeScript file using camelCase naming.
2. Implement the feature using named exports.
3. Import any dependencies using relative paths.
4. Write corresponding test files with the `.test.` pattern.
5. Commit changes using the `feat:` prefix and a concise, descriptive message.

### Code Import/Export
**Trigger:** When sharing functionality between modules  
**Command:** `/import-export`

1. Use relative import paths to reference internal modules.
2. Use named exports in all modules.
3. Example:
    ```typescript
    // In commitParser.ts
    export function parseCommits() { ... }

    // In analyzeRepo.ts
    import { parseCommits } from './commitParser';
    ```

### Testing
**Trigger:** When verifying new or existing functionality  
**Command:** `/run-tests`

1. Write test files matching the `*.test.*` pattern (e.g., `analyzeRepo.test.ts`).
2. Use the project's preferred (unspecified) test framework.
3. Ensure all tests pass before committing changes.

## Testing Patterns

- Test files are named with the `.test.` pattern, e.g., `commitParser.test.ts`.
- The specific test framework is not specified; follow the project's existing style.
- Place tests alongside or near the code they test for easy maintenance.

## Commands
| Command             | Purpose                                              |
|---------------------|------------------------------------------------------|
| /feature-development| Guide to add a new feature following conventions     |
| /import-export      | Reference for correct import/export patterns         |
| /run-tests          | Steps to write and execute tests                     |
```
