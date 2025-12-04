import { useCopyToClipboard } from "../hooks/useCopyToClipboard";

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

/**
 * Reusable copy to clipboard button component
 */
export const CopyButton = ({
  text,
  label,
  className = "",
}: CopyButtonProps) => {
  const [copied, copyToClipboard] = useCopyToClipboard();

  return (
    <button
      onClick={() => copyToClipboard(text)}
      className={`btn-ghost ${className}`}
      style={{
        fontSize: "0.8rem",
        padding: "0.25rem 0.5rem",
        minWidth: "80px",
      }}
      title={label || "Copy to clipboard"}
      aria-label={label || "Copy to clipboard"}
    >
      {copied ? "✓ Copied" : "📋 Copy"}
    </button>
  );
};
