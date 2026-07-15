import type { jsPDF } from "jspdf";
import type { Commit, RepoStats } from "../types";

const PAGE = { width: 210, height: 297, margin: 18, content: 174 };
const colors = {
  ink: [24, 29, 25] as const,
  muted: [92, 103, 95] as const,
  line: [218, 224, 216] as const,
  lime: [190, 225, 54] as const,
  soft: [244, 247, 239] as const,
  good: [36, 139, 77] as const,
  warning: [183, 112, 17] as const,
  bad: [190, 64, 55] as const,
};

const ascii = (value: string) => value
  .replace(/[–—−]/g, "-")
  .replace(/[‘’]/g, "'")
  .replace(/[“”]/g, '"')
  .replace(/[^\x20-\x7E\n]/g, "?");

const quality = (score: number) => score >= 8 ? "Strong" : score >= 6 ? "Developing" : "Needs attention";
const setColor = (doc: jsPDF, color: readonly [number, number, number]) => doc.setTextColor(color[0], color[1], color[2]);
const setFill = (doc: jsPDF, color: readonly [number, number, number]) => doc.setFillColor(color[0], color[1], color[2]);

export const buildAnalysisPdf = async (stats: RepoStats, commits: Commit[]): Promise<jsPDF> => {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
  doc.setProperties({ title: `${stats.repoName} - GitAnalyzer report`, subject: "Git commit message quality analysis", author: "GitAnalyzer", creator: "GitAnalyzer" });
  let y = 18;
  const pageSections = ["Analysis overview"];

  const addPage = (section?: string) => {
    doc.addPage();
    pageSections.push(section ?? "Analysis report");
    y = 32;
  };
  const ensure = (height: number, section?: string) => { if (y + height > PAGE.height - 18) addPage(section); };
  const heading = (title: string, kicker?: string) => {
    ensure(22, title);
    if (kicker) {
      doc.setFont("helvetica", "bold"); doc.setFontSize(8); setColor(doc, colors.good); doc.text(ascii(kicker).toUpperCase(), PAGE.margin, y); y += 6;
    }
    doc.setFont("helvetica", "bold"); doc.setFontSize(18); setColor(doc, colors.ink); doc.text(ascii(title), PAGE.margin, y); y += 9;
  };
  const paragraph = (text: string, options?: { indent?: number; size?: number; color?: readonly [number, number, number]; gap?: number }) => {
    const indent = options?.indent ?? 0;
    const lines = doc.splitTextToSize(ascii(text), PAGE.content - indent) as string[];
    ensure(lines.length * 5 + 4);
    doc.setFont("helvetica", "normal"); doc.setFontSize(options?.size ?? 9.5); setColor(doc, options?.color ?? colors.muted);
    doc.text(lines, PAGE.margin + indent, y, { lineHeightFactor: 1.35 });
    y += lines.length * 5 + (options?.gap ?? 4);
  };
  setFill(doc, colors.ink); doc.rect(0, 0, PAGE.width, 54, "F");
  setFill(doc, colors.lime); doc.rect(0, 0, 7, 54, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(213, 255, 62); doc.text("GITANALYZER / ANALYSIS REPORT", 18, 16);
  doc.setFontSize(23); doc.setTextColor(255, 255, 255); doc.text((doc.splitTextToSize(ascii(stats.repoName), 145) as string[]).slice(0, 2), 18, 31, { lineHeightFactor: 1.05 });
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(185, 194, 187); doc.text(`Generated ${new Date().toLocaleString()}  |  ${Math.min(commits.length, 50)} commits sampled`, PAGE.width - PAGE.margin, 47, { align: "right" });

  y = 69;
  doc.setFont("helvetica", "bold"); doc.setFontSize(38); setColor(doc, colors.ink); doc.text(stats.averageScore.toFixed(1), PAGE.margin, y);
  doc.setFontSize(11); setColor(doc, colors.muted); doc.text("/ 10", 49, y);
  doc.setFontSize(11); setColor(doc, stats.averageScore >= 8 ? colors.good : stats.averageScore >= 6 ? colors.warning : colors.bad); doc.text(quality(stats.averageScore), 68, y);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); setColor(doc, colors.muted);
  const overview = doc.splitTextToSize("Weighted assessment of structure, clarity, writing style, useful context, and message hygiene. This measures repository communication, not developer ability.", 91) as string[];
  doc.text(overview, 101, 61, { lineHeightFactor: 1.35 });

  const sampleTotal = stats.goodCommits + stats.warningCommits + stats.badCommits || commits.length || 1;
  y = 82;
  setFill(doc, colors.soft); doc.roundedRect(PAGE.margin, y, PAGE.content, 27, 2.5, 2.5, "F");
  const summaryMetrics = [["STRONG", stats.goodCommits, colors.good], ["DEVELOPING", stats.warningCommits, colors.warning], ["NEEDS ATTENTION", stats.badCommits, colors.bad]] as const;
  summaryMetrics.forEach(([label, value, color], index) => {
    const x = PAGE.margin + 9 + index * 57;
    if (index > 0) { doc.setDrawColor(...colors.line); doc.line(x - 8, y + 6, x - 8, y + 21); }
    doc.setFont("helvetica", "bold"); doc.setFontSize(15); setColor(doc, color); doc.text(String(value), x, y + 12);
    doc.setFontSize(6.5); setColor(doc, colors.muted); doc.text(label, x, y + 19);
    doc.setFont("helvetica", "normal"); doc.text(`${Math.round(value / sampleTotal * 100)}% of sample`, x + 25, y + 12);
  });

  const left = PAGE.margin;
  const right = 111;
  const columnWidth = 81;
  const sectionLabel = (title: string, kicker: string, x: number, top: number) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); setColor(doc, colors.good); doc.text(kicker.toUpperCase(), x, top);
    doc.setFontSize(13); setColor(doc, colors.ink); doc.text(title, x, top + 7);
  };
  sectionLabel("Quality dimensions", "Scoring model", left, 122);
  const dimensions = [["Clarity", stats.subScores?.clarity ?? stats.averageScore], ["Consistency", stats.subScores?.consistency ?? 0], ["Structure", stats.subScores?.structure ?? 0]] as const;
  dimensions.forEach(([label, value], index) => {
    const top = 141 + index * 13;
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); setColor(doc, colors.ink); doc.text(label, left, top);
    doc.text(value.toFixed(1), left + columnWidth, top, { align: "right" });
    setFill(doc, colors.line); doc.roundedRect(left, top + 3, columnWidth, 2.5, 1, 1, "F");
    setFill(doc, colors.lime); doc.roundedRect(left, top + 3, columnWidth * Math.max(0, Math.min(value, 10)) / 10, 2.5, 1, 1, "F");
  });

  sectionLabel("Commit types", "Repository shape", right, 122);
  const types = Object.entries(stats.typeDistribution ?? {}).sort((a, b) => b[1] - a[1]);
  const typeTotal = Math.max(1, types.reduce((sum, [, value]) => sum + value, 0));
  const displayedTypes: Array<[string, number]> = types.length ? types.slice(0, 4) : [["No type data", 0]];
  displayedTypes.forEach(([type, count], index) => {
    const top = 141 + index * 10;
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); setColor(doc, colors.ink); doc.text(ascii(type), right, top);
    doc.setFont("helvetica", "normal"); setColor(doc, colors.muted); doc.text(String(count), right + columnWidth, top, { align: "right" });
    setFill(doc, colors.line); doc.rect(right + 28, top - 2.5, 45, 2.2, "F");
    setFill(doc, colors.lime); doc.rect(right + 28, top - 2.5, 45 * count / typeTotal, 2.2, "F");
  });

  const listCard = (title: string, kicker: string, items: string[], x: number) => {
    const top = 195;
    setFill(doc, colors.soft); doc.roundedRect(x, top, columnWidth, 73, 2.5, 2.5, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); setColor(doc, colors.good); doc.text(kicker.toUpperCase(), x + 7, top + 9);
    doc.setFontSize(12); setColor(doc, colors.ink); doc.text(title, x + 7, top + 17);
    let itemY = top + 28;
    items.slice(0, 3).forEach((item, index) => {
      const lines = (doc.splitTextToSize(ascii(item), columnWidth - 21) as string[]).slice(0, 3);
      doc.setFont("helvetica", "bold"); doc.setFontSize(7); setColor(doc, colors.ink); doc.text(String(index + 1).padStart(2, "0"), x + 7, itemY);
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); setColor(doc, colors.muted); doc.text(lines, x + 17, itemY, { lineHeightFactor: 1.25 });
      itemY += Math.max(12, lines.length * 3.6 + 4);
    });
  };
  listCard("Priority findings", "What deserves attention", stats.topIssues?.length ? stats.topIssues : ["No recurring high-impact issues were detected."], left);
  listCard("Next actions", "A practical standard", stats.suggestions?.length ? stats.suggestions : ["Keep the current standard visible in contribution guidance."], right);

  addPage("Commit appendix");
  heading("Commit-by-commit review", "Detailed appendix");
  paragraph(`Showing ${Math.min(commits.length, 25)} of ${commits.length} loaded commits. Each entry includes the score, author, type, and highest-priority feedback.`, { gap: 8 });
  commits.slice(0, 25).forEach((commit, index) => {
    const analysis = commit.analysis;
    const title = commit.message.split("\n")[0] || "Untitled commit";
    const feedback = analysis?.feedback?.slice(0, 2) ?? [];
    const titleLines = doc.splitTextToSize(ascii(title), 139) as string[];
    ensure(19 + titleLines.length * 4 + feedback.length * 5, "Commit appendix");
    doc.setDrawColor(...colors.line); doc.line(PAGE.margin, y - 4, PAGE.width - PAGE.margin, y - 4);
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); setColor(doc, colors.muted); doc.text(String(index + 1).padStart(2, "0"), PAGE.margin, y + 1);
    doc.setFontSize(10); setColor(doc, colors.ink); doc.text(titleLines, PAGE.margin + 12, y + 1, { lineHeightFactor: 1.25 });
    const score = analysis?.score ?? 0;
    setColor(doc, score >= 8 ? colors.good : score >= 6 ? colors.warning : colors.bad); doc.text(score.toFixed(1), PAGE.width - PAGE.margin, y + 1, { align: "right" });
    y += titleLines.length * 4.5 + 4;
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); setColor(doc, colors.muted); doc.text(ascii(`${commit.author.name} | ${new Date(commit.author.date).toLocaleDateString()} | ${commit.sha.slice(0, 7)} | ${analysis?.conventionalType ?? "unstructured"}`), PAGE.margin + 12, y);
    y += 5;
    feedback.forEach((item) => { const lines = doc.splitTextToSize(`- ${ascii(item)}`, 150) as string[]; doc.text(lines, PAGE.margin + 12, y, { lineHeightFactor: 1.25 }); y += lines.length * 4; });
    y += 6;
  });

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    if (page > 1) {
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); setColor(doc, colors.muted);
      doc.text("GITANALYZER", PAGE.margin, 18);
      doc.text(ascii(pageSections[page - 1] ?? "Analysis report").toUpperCase(), PAGE.width - PAGE.margin, 18, { align: "right" });
      doc.setDrawColor(...colors.line); doc.line(PAGE.margin, 22, PAGE.width - PAGE.margin, 22);
    }
    doc.setDrawColor(...colors.line); doc.line(PAGE.margin, PAGE.height - 13, PAGE.width - PAGE.margin, PAGE.height - 13);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); setColor(doc, colors.muted);
    doc.text("GitAnalyzer - clearer code histories", PAGE.margin, PAGE.height - 8);
    doc.text(`${page} / ${pages}`, PAGE.width - PAGE.margin, PAGE.height - 8, { align: "right" });
  }
  return doc;
};

export const downloadAnalysisPdf = async (stats: RepoStats, commits: Commit[]) => {
  const doc = await buildAnalysisPdf(stats, commits);
  doc.save(`${stats.repoName.replace(/[\\/]/g, "-")}-analysis-report.pdf`);
};
