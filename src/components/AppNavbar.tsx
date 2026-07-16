import { MdClose, MdHistory, MdMenu, MdNorthEast } from "react-icons/md";
import { AuthButton } from "./AuthButton";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

interface AppNavbarProps {
  viewMode: "input" | "repoList" | "analysis" | "playground";
  historyCount: number;
  isAuthenticated: boolean;
  isMobileMenuOpen: boolean;
  onHome: () => void;
  onHistory: () => void;
  onSettings: () => void;
  onAnalyze: () => void;
  onWorkshop: () => void;
  onToggleMobile: () => void;
}

export const AppNavbar = ({
  viewMode,
  historyCount,
  isAuthenticated,
  isMobileMenuOpen,
  onHome,
  onHistory,
  onSettings,
  onAnalyze,
  onWorkshop,
  onToggleMobile,
}: AppNavbarProps) => {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    if (viewMode !== "input") return;
    const sectionIds = ["overview", "analyzer", "how-it-works"];
    const updateActiveSection = () => {
      const marker = window.scrollY + window.innerHeight * 0.3;
      const active = sectionIds.reduce((current, id) => {
        const section = document.getElementById(id);
        return section && section.offsetTop <= marker ? id : current;
      }, "overview");
      setActiveSection(active);
    };
    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [viewMode]);

  const sectionLink = (id: string, label: string) => (
    <a href={`#${id}`} className={activeSection === id ? "active" : ""} onClick={() => setActiveSection(id)}>{label}</a>
  );

  return (
  <header className="app-navbar">
    <div className="navbar-shell">
      <button type="button" className="navbar-brand" onClick={onHome} aria-label="Go to GitAnalyzer home">
        <span className="navbar-mark" aria-hidden="true">
          <svg viewBox="0 0 48 48" focusable="false">
            <path className="navbar-mark-tile" d="M10 4h22l12 12v22a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6V10a6 6 0 0 1 6-6Z" />
            <path className="navbar-mark-path" d="m14 33 10-11 10-8M24 22l10 11" />
            <circle className="navbar-mark-node" cx="14" cy="33" r="3" />
            <circle className="navbar-mark-node" cx="24" cy="22" r="3" />
            <circle className="navbar-mark-node" cx="34" cy="14" r="3" />
            <circle className="navbar-mark-node" cx="34" cy="33" r="3" />
          </svg>
        </span>
        <span className="navbar-wordmark"><strong>Git<span>Analyzer</span></strong><small>Commit intelligence</small></span>
      </button>

      <nav className="navbar-links desktop-only" aria-label="Primary navigation">
        {viewMode === "input" ? <>
          {sectionLink("overview", "Overview")}
          {sectionLink("analyzer", "Analyzer")}
          {sectionLink("how-it-works", "Process")}
          <NavLink to="/workshop">Workshop</NavLink>
        </> : <>
          <button onClick={onHome}>Overview</button>
          <button onClick={onWorkshop}>Workshop</button>
          <span className="navbar-context"><i />{viewMode === "repoList" ? "Repository index" : viewMode === "playground" ? "Commit workshop" : "Repository report"}</span>
        </>}
      </nav>

      <div className="navbar-actions desktop-only">
        {isAuthenticated && <button className="navbar-history" onClick={onHistory} aria-label={`View analysis history${historyCount ? `, ${historyCount} saved` : ""}`}>
          <MdHistory /><span>History</span>{historyCount > 0 && <b>{historyCount}</b>}
        </button>}
        {viewMode === "input" && <button className="navbar-cta" onClick={onAnalyze}>Analyze <MdNorthEast /></button>}
        <AuthButton onOpenSettings={onSettings} />
      </div>

      <button className="navbar-mobile-toggle" onClick={onToggleMobile} aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"} aria-expanded={isMobileMenuOpen}>
        {isMobileMenuOpen ? <MdClose /> : <MdMenu />}
      </button>
    </div>
  </header>
  );
};
