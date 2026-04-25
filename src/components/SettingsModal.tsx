import { useState } from "react";
import { MdClose, MdCheckCircle, MdEdit, MdDelete } from "react-icons/md";
import { useLLM } from "../hooks/useLLM";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface KeyFieldProps {
  label: string;
  sublabel: string;
  currentKey: string;
  placeholder: string;
  onSave: (key: string) => void;
  onClear: () => void;
}

const KeyField = ({ label, sublabel, currentKey, placeholder, onSave, onClear }: KeyFieldProps) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const hasKey = Boolean(currentKey);

  const handleSave = () => {
    if (inputValue.trim()) {
      onSave(inputValue.trim());
      setInputValue("");
      setEditing(false);
    }
  };

  const handleClear = () => {
    onClear();
    setEditing(false);
    setInputValue("");
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
        <label style={{ fontSize: "0.9rem", fontWeight: 500 }}>
          {label}
          <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginLeft: "0.5rem", fontWeight: 400 }}>
            {sublabel}
          </span>
        </label>
      </div>

      {hasKey && !editing ? (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.5rem 0.75rem",
          borderRadius: "6px",
          border: "1px solid rgba(34, 197, 94, 0.3)",
          background: "rgba(34, 197, 94, 0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <MdCheckCircle style={{ color: "#22c55e", fontSize: "1.1rem" }} />
            <span style={{ fontSize: "0.85rem", color: "#22c55e", fontWeight: 500 }}>
              API Key Added
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            <button
              onClick={() => { setEditing(true); setInputValue(""); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-secondary)", padding: "0.2rem",
                display: "flex", alignItems: "center",
              }}
              title="Change key"
            >
              <MdEdit size={16} />
            </button>
            <button
              onClick={handleClear}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--status-bad)", padding: "0.2rem",
                display: "flex", alignItems: "center", opacity: 0.7,
              }}
              title="Remove key"
            >
              <MdDelete size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
            style={{
              flex: 1,
              padding: "0.5rem 0.75rem",
              borderRadius: "6px",
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-page)",
              color: "var(--text-primary)",
              outline: "none",
              fontSize: "0.85rem",
            }}
            autoFocus={editing}
          />
          <button
            onClick={handleSave}
            disabled={!inputValue.trim()}
            className="btn-primary"
            style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem" }}
          >
            Save
          </button>
          {editing && (
            <button
              onClick={() => { setEditing(false); setInputValue(""); }}
              className="btn-ghost"
              style={{ padding: "0.5rem", fontSize: "0.8rem" }}
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const {
    userGeminiKey, setUserGeminiKey,
    userOpenRouterKey, setUserOpenRouterKey,
    userGroqKey, setUserGroqKey,
  } = useLLM();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "450px",
          padding: "1.5rem",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}>
          <h3 style={{ margin: 0, fontSize: "1.1rem" }}>AI Provider Settings</h3>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none",
              color: "var(--text-secondary)", cursor: "pointer", fontSize: "1.2rem",
            }}
          >
            <MdClose />
          </button>
        </div>

        <p style={{
          fontSize: "0.82rem", color: "var(--text-secondary)",
          marginBottom: "1.25rem", lineHeight: 1.5,
          background: "var(--bg-page)", padding: "0.75rem",
          borderRadius: "8px", border: "1px solid var(--border-subtle)",
        }}>
          AI features work out of the box. Add your own keys only if the built-in ones hit rate limits.
          <br />
          <span style={{ marginTop: "0.25rem", display: "inline-block" }}>
            Priority: <strong>Groq → OpenRouter → Gemini</strong>
          </span>
        </p>

        {/* Key Fields — localStorage only, no cloud storage */}
        <KeyField
          label="Groq"
          sublabel="Fastest"
          currentKey={userGroqKey}
          placeholder="Enter Groq API key (gsk_...)"
          onSave={setUserGroqKey}
          onClear={() => setUserGroqKey("")}
        />

        <KeyField
          label="OpenRouter"
          sublabel="Flexible"
          currentKey={userOpenRouterKey}
          placeholder="Enter OpenRouter API key (sk-or-...)"
          onSave={setUserOpenRouterKey}
          onClear={() => setUserOpenRouterKey("")}
        />

        <KeyField
          label="Gemini"
          sublabel="Fallback"
          currentKey={userGeminiKey}
          placeholder="Enter Gemini API key (AIza...)"
          onSave={setUserGeminiKey}
          onClear={() => setUserGeminiKey("")}
        />
      </div>
    </div>
  );
};
