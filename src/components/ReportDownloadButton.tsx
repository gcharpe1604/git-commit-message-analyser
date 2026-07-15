import { useState } from "react";
import { MdDownload, MdPictureAsPdf } from "react-icons/md";
import type { Commit, RepoStats } from "../types";
import { downloadAnalysisPdf } from "../services/pdfReport";

export const ReportDownloadButton = ({ commits, stats }: { commits: Commit[]; stats: RepoStats }) => {
  const [state, setState] = useState<"idle" | "working" | "error">("idle");
  const download = async () => {
    setState("working");
    try { await downloadAnalysisPdf(stats, commits); setState("idle"); }
    catch { setState("error"); }
  };
  return <button className="report-download" onClick={download} disabled={state === "working"} aria-label="Download detailed analysis report as PDF">
    <span className="report-download-icon"><MdPictureAsPdf /></span>
    <span><strong>{state === "working" ? "Building your report..." : state === "error" ? "Report failed - try again" : "Download analysis report"}</strong><small>Detailed PDF · scores, findings, commits</small></span>
    <MdDownload />
  </button>;
};
