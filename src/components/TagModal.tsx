import { useState } from "react";
import { MdClose, MdAdd } from "react-icons/md";

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoName: string;
  currentTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export const TagModal = ({
  isOpen,
  onClose,
  repoName,
  currentTags,
  onAddTag,
  onRemoveTag,
}: TagModalProps) => {
  const [inputValue, setInputValue] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddTag(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200, // Higher than sidebar
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "400px",
          padding: "1.5rem",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Expected Tags</h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
          >
            <MdClose />
          </button>
        </div>

        <div
          style={{
            marginBottom: "1rem",
            fontSize: "0.9rem",
            color: "var(--text-secondary)",
          }}
        >
          Manage tags for <strong>{repoName}</strong>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginBottom: "1.5rem",
          }}
        >
          {currentTags.map((tag) => (
            <span
              key={tag}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                background: "var(--bg-page)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "100px",
                padding: "0.25rem 0.75rem",
                fontSize: "0.85rem",
              }}
            >
              {tag}
              <button
                onClick={() => onRemoveTag(tag)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  padding: 0,
                  display: "flex",
                  marginLeft: "0.2rem",
                }}
              >
                <MdClose size={14} />
              </button>
            </span>
          ))}
          {currentTags.length === 0 && (
            <span
              style={{
                color: "var(--text-tertiary)",
                fontStyle: "italic",
                fontSize: "0.85rem",
              }}
            >
              No tags yet
            </span>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", gap: "0.5rem" }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter tag name..."
            style={{
              flex: 1,
              padding: "0.5rem 0.75rem",
              borderRadius: "6px",
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-page)",
              color: "var(--text-primary)",
              outline: "none",
            }}
            autoFocus
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              border: "none",
              background: "var(--accent-primary)",
              color: "white",
              cursor: inputValue.trim() ? "pointer" : "not-allowed",
              opacity: inputValue.trim() ? 1 : 0.6,
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            <MdAdd /> Add
          </button>
        </form>
      </div>
    </div>
  );
};
