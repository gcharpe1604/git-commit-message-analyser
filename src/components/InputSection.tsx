import { useState } from "react";
import { MdArrowForward, MdClose, MdPerson, MdSource } from "react-icons/md";
import { sanitizeInput } from "../utils/sanitize";

interface InputSectionProps {
  onAnalyze: (input: string, mode: "user" | "repo") => void;
  isLoading: boolean;
  recentSearches?: string[];
  onRemoveRecent?: (input: string) => void;
  onClearHistory?: () => void;
  inputRef?: React.Ref<HTMLInputElement>;
}

export const InputSection = ({
  onAnalyze,
  isLoading,
  recentSearches = [],
  onRemoveRecent,
  onClearHistory,
  inputRef,
}: InputSectionProps) => {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"user" | "repo">("repo");
  const [validationError, setValidationError] = useState("");

  const submitValue = (value: string, targetMode = mode) => {
    const sanitized = sanitizeInput(value);
    if (!sanitized) {
      setValidationError(`Enter a GitHub ${targetMode === "repo" ? "repository" : "username"} to continue.`);
      return;
    }
    setValidationError("");
    const target = targetMode === "repo" && !sanitized.startsWith("http")
      ? `https://github.com/${sanitized}`
      : sanitized;
    onAnalyze(target, targetMode);
  };

  return (
    <section className="analyzer-entry" aria-labelledby="analyzer-heading">
      <div className="entry-heading">
        <span>Start an analysis</span>
        <h2 id="analyzer-heading">Bring your Git history into focus.</h2>
      </div>

      <form className="analysis-form" onSubmit={(event) => { event.preventDefault(); submitValue(input); }} noValidate>
        <div className="mode-switch" aria-label="Analysis target">
          <button type="button" className={mode === "repo" ? "active" : ""} onClick={() => { setMode("repo"); setValidationError(""); }} aria-pressed={mode === "repo"}>
            <MdSource /> Repository
          </button>
          <button type="button" className={mode === "user" ? "active" : ""} onClick={() => { setMode("user"); setValidationError(""); }} aria-pressed={mode === "user"}>
            <MdPerson /> Developer
          </button>
        </div>

        <label className={`analysis-field ${validationError ? "has-error" : ""}`}>
          <span className="field-prefix">github.com/</span>
          <input
            ref={inputRef}
            type="text"
            placeholder={mode === "repo" ? "owner/repository" : "username"}
            value={input}
            onChange={(event) => { setInput(event.target.value); if (validationError) setValidationError(""); }}
            disabled={isLoading}
            aria-invalid={Boolean(validationError)}
            aria-describedby={validationError ? "analysis-error" : "analysis-help"}
            autoComplete="off"
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Reading history…" : "Analyze"}<MdArrowForward />
          </button>
        </label>
        <p id={validationError ? "analysis-error" : "analysis-help"} className={validationError ? "field-error" : "field-help"} role={validationError ? "alert" : undefined}>
          {validationError || (mode === "repo" ? "Public repositories work instantly — no GitHub sign-in required." : "Choose a public profile, then select one of its repositories.")}
        </p>
      </form>

      <div className="entry-footer">
        <button className="example-link" type="button" onClick={() => submitValue("facebook/react", "repo")}>Try facebook/react <MdArrowForward /></button>
        {recentSearches.filter(Boolean).length > 0 && (
          <div className="recent-searches" aria-label="Recent searches">
            <span>Recent</span>
            {recentSearches.filter(Boolean).map((search) => (
              <div className="recent-pill" key={search}>
                <button type="button" onClick={() => submitValue(search, search.includes("/") ? "repo" : "user")}>{search}</button>
                {onRemoveRecent && <button type="button" onClick={() => onRemoveRecent(search)} aria-label={`Remove ${search}`}><MdClose /></button>}
              </div>
            ))}
            {onClearHistory && <button type="button" className="clear-recent" onClick={onClearHistory}>Clear</button>}
          </div>
        )}
      </div>
    </section>
  );
};
