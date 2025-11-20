import { useState } from 'react';
import './CodeViewer.css';

interface DiffLine {
  type: 'added' | 'removed' | 'context' | 'header';
  content: string;
  lineNumber?: number;
}

interface FileWithDiff {
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed';
  additions: number;
  deletions: number;
  patch?: string;
  diffLines?: DiffLine[];
}

interface CodeViewerProps {
  files: FileWithDiff[];
  owner: string;
  repo: string;
  commitSha: string;
}

export default function CodeViewer({ files, owner, repo, commitSha }: CodeViewerProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  const toggleFileExpand = async (filename: string) => {
    const newExpanded = new Set(expandedFiles);
    
    if (newExpanded.has(filename)) {
      newExpanded.delete(filename);
    } else {
      newExpanded.add(filename);
      // Fetch full diff if not already loaded
      const file = files.find(f => f.filename === filename);
      if (file && file.patch && !file.diffLines) {
        parseDiff(file);
      }
    }
    
    setExpandedFiles(newExpanded);
  };

  const parseDiff = (file: FileWithDiff) => {
    if (!file.patch) return;

    const lines = file.patch.split('\n');
    const diffLines: DiffLine[] = [];

    lines.forEach((line) => {
      if (line.startsWith('@@')) {
        diffLines.push({ type: 'header', content: line });
      } else if (line.startsWith('+') && !line.startsWith('+++')) {
        diffLines.push({ type: 'added', content: line.substring(1) });
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        diffLines.push({ type: 'removed', content: line.substring(1) });
      } else if (line.startsWith(' ')) {
        diffLines.push({ type: 'context', content: line.substring(1) });
      }
    });

    file.diffLines = diffLines;
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const icons: { [key: string]: string } = {
      js: '📄',
      jsx: '⚛️',
      ts: '📘',
      tsx: '⚛️',
      py: '🐍',
      java: '☕',
      cpp: '⚙️',
      c: '⚙️',
      go: '🐹',
      rs: '🦀',
      rb: '💎',
      php: '🐘',
      html: '🌐',
      css: '🎨',
      scss: '🎨',
      json: '📋',
      xml: '📋',
      md: '📝',
      txt: '📄',
    };
    return icons[ext || ''] || '📄';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'added':
        return 'added';
      case 'removed':
        return 'removed';
      case 'modified':
        return 'modified';
      case 'renamed':
        return 'renamed';
      default:
        return 'modified';
    }
  };

  const openOnGitHub = (filename: string) => {
    const url = `https://github.com/${owner}/${repo}/blob/${commitSha}/${filename}`;
    window.open(url, '_blank');
  };

  return (
    <div className="code-viewer">
      <div className="code-viewer-header">
        <h3>📝 Code Changes</h3>
        <p className="code-viewer-subtitle">Click on files to view detailed changes</p>
      </div>

      <div className="files-diff-list">
        {files.map((file) => (
          <div key={file.filename} className={`file-diff ${getStatusColor(file.status)}`}>
            <div
              className="file-diff-header"
              onClick={() => toggleFileExpand(file.filename)}
            >
              <div className="file-info">
                <span className="file-icon">{getFileIcon(file.filename)}</span>
                <span className="file-name">{file.filename}</span>
                <span className={`status-badge ${getStatusColor(file.status)}`}>
                  {file.status}
                </span>
              </div>

              <div className="file-actions">
                <span className="file-changes">
                  <span className="additions">+{file.additions}</span>
                  <span className="deletions">-{file.deletions}</span>
                </span>
                <button
                  className="btn-github"
                  onClick={(e) => {
                    e.stopPropagation();
                    openOnGitHub(file.filename);
                  }}
                  title="View on GitHub"
                >
                  🔗
                </button>
                <span className="expand-icon">
                  {expandedFiles.has(file.filename) ? '▼' : '▶'}
                </span>
              </div>
            </div>

            {expandedFiles.has(file.filename) && (
              <div className="file-diff-content">
                {file.status === 'added' ? (
                  <div className="file-added-notice">
                    <p>New file added</p>
                  </div>
                ) : file.status === 'removed' ? (
                  <div className="file-removed-notice">
                    <p>File deleted</p>
                  </div>
                ) : file.diffLines && file.diffLines.length > 0 ? (
                  <div className="diff-viewer">
                    {file.diffLines.map((line, idx) => (
                      <div key={idx} className={`diff-line ${line.type}`}>
                        <span className="line-marker">
                          {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                        </span>
                        <code className="line-content">{line.content || ' '}</code>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-diff">
                    <p>No diff available for this file</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
