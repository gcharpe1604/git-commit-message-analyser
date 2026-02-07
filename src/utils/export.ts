/**
 * Export utilities for different formats
 */

import type { Commit, RepoStats } from '../types';

/**
 * Export data to CSV format
 * @param commits - Array of commits
 * @returns CSV string
 */
export function exportToCSV(commits: Commit[]): string {
  const headers = ['SHA', 'Message', 'Author', 'Date', 'Score', 'Status', 'Type'];
  const rows = commits.map(c => [
    c.sha,
    `"${c.message.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
    c.author.name,
    c.author.date,
    c.analysis?.score || 0,
    c.analysis?.status || 'unknown',
    c.analysis?.conventionalType || 'none'
  ]);
  
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}


/**
 * Export data to Markdown format
 * @param commits - Array of commits
 * @param stats - Repository statistics
 * @returns Markdown string
 */
export function exportToMarkdown(commits: Commit[], stats: RepoStats): string {
  const header = `# ${stats.repoName} - Commit Analysis Report\n\n`;
  
  const summary = `## Summary\n\n` +
    `- **Average Score**: ${stats.averageScore.toFixed(1)}/10\n` +
    `- **Total Commits**: ${stats.totalCommits}\n` +
    `- **Good Commits**: ${stats.goodCommits} (${((stats.goodCommits / stats.totalCommits) * 100).toFixed(1)}%)\n` +
    `- **Warning Commits**: ${stats.warningCommits} (${((stats.warningCommits / stats.totalCommits) * 100).toFixed(1)}%)\n` +
    `- **Bad Commits**: ${stats.badCommits} (${((stats.badCommits / stats.totalCommits) * 100).toFixed(1)}%)\n` +
    `- **Analyzed**: ${new Date(stats.lastAnalyzed).toLocaleString()}\n\n`;
  
  const commitsSection = `## Commits\n\n` +
    commits.map((c, idx) => {
      const firstLine = c.message.split('\n')[0];
      const score = c.analysis?.score || 0;
      const status = c.analysis?.status || 'unknown';
      const statusEmoji = status === 'good' ? '✅' : status === 'warning' ? '⚠️' : '❌';
      
      return `### ${idx + 1}. ${firstLine}\n\n` +
        `${statusEmoji} **Score**: ${score}/10 | **Status**: ${status}\n\n` +
        `- **Author**: ${c.author.name}\n` +
        `- **Date**: ${new Date(c.author.date).toLocaleString()}\n` +
        `- **SHA**: \`${c.sha}\`\n` +
        `- **Type**: ${c.analysis?.conventionalType || 'none'}\n` +
        (c.analysis?.feedback && c.analysis.feedback.length > 0 
          ? `\n**Feedback**:\n${c.analysis.feedback.map(f => `- ${f}`).join('\n')}\n` 
          : '') +
        `\n`;
    }).join('\n');
  
  return header + summary + commitsSection;
}

/**
 * Download a file with given content
 * @param content - File content
 * @param filename - Filename with extension
 * @param mimeType - MIME type
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export history items to CSV
 * @param history - Array of RepoStats
 */
export function exportHistoryToCSV(history: RepoStats[]): string {
  const headers = ['Repository', 'Score', 'Total Commits', 'Status', 'Date', 'Tags'];
  const rows = history.map(item => [
    item.repoName,
    item.averageScore.toFixed(2),
    item.totalCommits,
    item.averageScore >= 8 ? 'Good' : item.averageScore >= 5 ? 'Warning' : 'Bad',
    new Date(item.lastAnalyzed).toLocaleDateString(),
    item.tags?.join(';') || ''
  ]);
  
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

/**
 * Export history items to JSON
 * @param history - Array of RepoStats
 */
export function exportHistoryToJSON(history: RepoStats[]): string {
  return JSON.stringify(history, null, 2);
}
