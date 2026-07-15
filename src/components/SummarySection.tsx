import { useState } from "react";
import { MdArrowOutward, MdCheck, MdContentCopy, MdErrorOutline, MdLightbulbOutline, MdSchedule, MdTrendingUp } from "react-icons/md";
import type { RepoStats } from "../types";
import { AchievementsSection } from "./AchievementsSection";

interface SummarySectionProps { stats: RepoStats }

const qualityLabel = (score: number) => score >= 8 ? "Strong" : score >= 6 ? "Developing" : "Needs attention";
const scoreTone = (score: number) => score >= 8 ? "good" : score >= 6 ? "warning" : "bad";

export const SummarySection = ({ stats }: SummarySectionProps) => {
  const [copied, setCopied] = useState(false);
  const analyzedCount = stats.goodCommits + stats.warningCommits + stats.badCommits;
  const distribution = [
    { label: "Strong", value: stats.goodCommits, tone: "good" },
    { label: "Developing", value: stats.warningCommits, tone: "warning" },
    { label: "Weak", value: stats.badCommits, tone: "bad" },
  ];
  const typeEntries = Object.entries(stats.typeDistribution || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const totalTypes = typeEntries.reduce((sum, [, count]) => sum + count, 0);
  const times = Object.entries(stats.timeDistribution || {}) as [string, number][];
  const maxTime = Math.max(1, ...times.map(([, count]) => count));

  const copySummary = async () => {
    await navigator.clipboard.writeText(`${stats.repoName} — ${stats.averageScore.toFixed(1)}/10 commit quality across ${analyzedCount} analyzed commits.`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="report-stack">
      <section className="report-hero">
        <div className="report-heading">
          <p className="eyebrow">Repository report</p>
          <a href={`https://github.com/${stats.repoName}`} target="_blank" rel="noreferrer">
            <h1>{stats.repoName}</h1><MdArrowOutward />
          </a>
          <p>{analyzedCount} recent commits analyzed · {stats.confidenceLabel || "Pattern confidence available"}</p>
        </div>
        <button className="copy-summary" onClick={copySummary}>{copied ? <MdCheck /> : <MdContentCopy />}{copied ? "Copied" : "Copy summary"}</button>
      </section>

      <section className="score-overview">
        <div className={`score-hero tone-${scoreTone(stats.averageScore)}`}>
          <span>Commit quality</span>
          <div><strong>{stats.averageScore.toFixed(1)}</strong><small>/10</small></div>
          <p>{qualityLabel(stats.averageScore)}</p>
        </div>
        <div className="score-context">
          <div className="context-item"><span>Repository volume</span><strong>{stats.totalCommits.toLocaleString()}</strong><small>Total commits on GitHub</small></div>
          <div className="context-item"><span>Developer pattern</span><strong>{stats.developerType || "Not enough data"}</strong><small>{stats.developerType ? "Based on commit timing" : "Analyze more commits to classify"}</small></div>
        </div>
      </section>

      {stats.subScores && (
        <section className="metric-grid" aria-label="Commit quality dimensions">
          {([
            ["Clarity", stats.subScores.clarity, "How specific and readable messages are"],
            ["Consistency", stats.subScores.consistency, "How reliably the same standard is applied"],
            ["Structure", stats.subScores.structure, "Use of conventional types and scopes"],
          ] as const).map(([label, value, description]) => (
            <article className="metric-card" key={label}>
              <div><span>{label}</span><strong>{value.toFixed(0)}</strong></div>
              <div className="metric-track"><i className={`tone-${scoreTone(value)}`} style={{ width: `${value * 10}%` }} /></div>
              <p>{description}</p>
            </article>
          ))}
        </section>
      )}

      <section className="report-grid">
        <article className="report-card distribution-card">
          <header><div><span className="card-kicker">01 / Quality mix</span><h2>Score distribution</h2></div><MdTrendingUp /></header>
          <div className="distribution-bar" aria-label="Score distribution">
            {distribution.map((item) => <i key={item.label} className={`tone-${item.tone}`} style={{ width: `${analyzedCount ? item.value / analyzedCount * 100 : 0}%` }} />)}
          </div>
          <div className="distribution-legend">
            {distribution.map((item) => <div key={item.label}><span><i className={`tone-${item.tone}`} />{item.label}</span><strong>{item.value}</strong></div>)}
          </div>
        </article>

        <article className="report-card type-card">
          <header><div><span className="card-kicker">02 / Conventions</span><h2>Commit types</h2></div><span>{totalTypes} sampled</span></header>
          <div className="type-list">
            {typeEntries.length ? typeEntries.map(([type, count]) => (
              <div key={type}><span><code>{type}</code><i><b style={{ width: `${totalTypes ? count / totalTypes * 100 : 0}%` }} /></i></span><strong>{Math.round(count / totalTypes * 100)}%</strong></div>
            )) : <p className="empty-copy">No conventional commit types detected.</p>}
          </div>
        </article>

        <article className="report-card time-card">
          <header><div><span className="card-kicker">03 / Rhythm</span><h2>Commit timing</h2></div><MdSchedule /></header>
          <div className="time-chart">
            {times.map(([period, count]) => <div key={period}><span>{count}</span><i style={{ height: `${Math.max(8, count / maxTime * 100)}%` }} /><small>{period}</small></div>)}
          </div>
        </article>

        <article className="report-card actions-card">
          <header><div><span className="card-kicker">04 / Next move</span><h2>What to improve</h2></div><MdLightbulbOutline /></header>
          <div className="insight-columns">
            <div><h3><MdErrorOutline /> Main friction</h3>{stats.topIssues?.length ? stats.topIssues.slice(0, 3).map((issue, index) => <p key={issue}><b>{String(index + 1).padStart(2, "0")}</b>{issue}</p>) : <p><b>01</b>No major issues detected.</p>}</div>
            <div><h3><MdCheck /> Recommended</h3>{stats.suggestions?.length ? stats.suggestions.slice(0, 3).map((suggestion, index) => <p key={suggestion}><b>{String(index + 1).padStart(2, "0")}</b>{suggestion}</p>) : <p><b>01</b>Keep the current standard consistent.</p>}</div>
          </div>
        </article>
      </section>

      {stats.achievements && stats.achievements.length > 0 && <AchievementsSection achievements={stats.achievements} />}
    </div>
  );
};
