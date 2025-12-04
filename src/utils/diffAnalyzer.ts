
interface FileChange {
  filename: string;
  status: string; // 'added' | 'modified' | 'removed' | 'renamed'
  patch?: string;
  additions?: number;
  deletions?: number;
}

const getFileExtension = (filename: string) => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() : '';
};

const getBasename = (filename: string) => {
  const parts = filename.split('/');
  return parts.pop() || filename;
};

const getDirectory = (filename: string) => {
  const parts = filename.split('/');
  return parts.length > 1 ? parts[0] : '';
};

export const generateMessageFromFiles = (files: FileChange[]): string => {
  if (!files || files.length === 0) return '';

  // Helper to check for patterns
  const hasFile = (pattern: RegExp) => files.some(f => pattern.test(f.filename));
  const allFilesMatch = (pattern: RegExp) => files.every(f => pattern.test(f.filename));
  
  // 1. Documentation
  if (allFilesMatch(/\.(md|txt|LICENSE)$/i)) {
    const readme = files.find(f => f.filename.toLowerCase().includes('readme'));
    if (readme) return `docs: update README documentation`;
    return `docs: update project documentation`;
  }

  // 2. Configuration & Dependencies
  if (allFilesMatch(/(\.|config|rc|json|yml|yaml|ignore)$/i)) {
    if (hasFile(/package\.json|yarn\.lock|package-lock\.json/)) {
      // Check if it's a version bump or dep update
      const pkgJson = files.find(f => f.filename.endsWith('package.json'));
      if (pkgJson && pkgJson.patch) {
        if (pkgJson.patch.includes('"version":')) return `chore: bump version`;
        if (pkgJson.patch.includes('dependencies') || pkgJson.patch.includes('devDependencies')) return `chore: update dependencies`;
      }
      return `chore: update project dependencies`;
    }
    if (hasFile(/tsconfig/)) return `chore: update TypeScript configuration`;
    if (hasFile(/eslint|prettier/)) return `chore: update linting configuration`;
    if (hasFile(/vite|webpack|rollup/)) return `chore: update build configuration`;
    if (hasFile(/\.env/)) return `chore: update environment configuration`;
    return `chore: update configuration files`;
  }

  // 3. Styles
  if (allFilesMatch(/\.(css|scss|sass|less|styl)$/i)) {
    return `style: update visual styles`;
  }

  // 4. Tests
  if (allFilesMatch(/\.(test|spec)\.|__tests__|test\//i)) {
    return `test: update test suite`;
  }

  // 5. Assets
  if (allFilesMatch(/\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)$/i)) {
    return `chore: update static assets`;
  }

  // 6. Single File Logic (Detailed)
  if (files.length === 1) {
    const file = files[0];
    const basename = getBasename(file.filename);
    const ext = getFileExtension(file.filename);
    const dir = getDirectory(file.filename);

    // React Components
    if (ext === 'tsx' || (ext === 'jsx' && /^[A-Z]/.test(basename))) {
      const componentName = basename.split('.')[0];
      if (file.status === 'added') return `feat: add ${componentName} component`;
      if (file.status === 'removed') return `refactor: remove ${componentName} component`;
      
      // Check patch for hints
      if (file.patch) {
        if (file.patch.includes('useEffect')) return `fix: update side effects in ${componentName}`;
        if (file.patch.includes('useState')) return `feat: add state management to ${componentName}`;
        if (file.patch.includes('interface') || file.patch.includes('type ')) return `refactor: update types for ${componentName}`;
      }
      return `feat: update ${componentName} component`;
    }

    // Hooks
    if (basename.startsWith('use') && (ext === 'ts' || ext === 'js')) {
      const hookName = basename.split('.')[0];
      return `feat: update ${hookName} hook`;
    }

    // Services/API
    if (dir === 'services' || dir === 'api' || basename.includes('Service') || basename.includes('API')) {
      return `feat: update API integration logic`;
    }

    // Utils
    if (dir === 'utils' || dir === 'lib' || dir === 'helpers') {
      return `refactor: update utility functions`;
    }

    // Types
    if (dir === 'types' || basename.endsWith('.d.ts')) {
      return `refactor: update type definitions`;
    }

    // Generic Code
    if (file.status === 'added') return `feat: add ${basename}`;
    if (file.status === 'removed') return `refactor: remove ${basename}`;
    if (file.status === 'renamed') return `refactor: rename ${basename}`;
    
    return `fix: update ${basename}`;
  }

  // 7. Multi-file Logic (Complex)
  
  // Group by directory
  const dirs = new Set(files.map(f => getDirectory(f.filename)));
  const uniqueDirs = Array.from(dirs).filter(d => d && d !== '.');

  // Feature: Components + Styles
  const hasComponents = files.some(f => f.filename.includes('components/'));
  const hasStyles = files.some(f => f.filename.match(/\.(css|scss)$/));
  if (hasComponents && hasStyles && files.length <= 4) {
    const comp = files.find(f => f.filename.includes('components/'));
    const compName = comp ? getBasename(comp.filename).split('.')[0] : 'UI';
    return `feat: style and update ${compName} component`;
  }

  // Feature: Components + Tests
  const hasTests = files.some(f => f.filename.includes('test') || f.filename.includes('spec'));
  if (hasComponents && hasTests) {
    return `feat: update component and tests`;
  }

  // Refactor: Multiple utils/types
  if (uniqueDirs.every(d => ['utils', 'types', 'lib', 'constants'].includes(d))) {
    return `refactor: cleanup project utilities and types`;
  }

  // Full Feature (Components + Services + Utils)
  if (uniqueDirs.includes('components') && uniqueDirs.includes('services')) {
    return `feat: implement new feature with API integration`;
  }

  // Fallback with specific file counts
  const added = files.filter(f => f.status === 'added').length;
  const removed = files.filter(f => f.status === 'removed').length;
  const modified = files.filter(f => f.status === 'modified').length;
  const renamed = files.filter(f => f.status === 'renamed').length;

  if (renamed > 0 && renamed === files.length) {
    return `refactor: rename ${renamed} files for better organization`;
  }

  if (added > modified && added > removed) {
    return `feat: add ${added} new files to project structure`;
  }
  if (removed > added && removed > modified) {
    return `refactor: remove ${removed} unused files from project`;
  }

  return `feat: comprehensive update to ${files.length} project files`;
};
