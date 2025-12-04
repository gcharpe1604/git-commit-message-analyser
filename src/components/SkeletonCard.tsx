/**
 * Skeleton loading card component
 */
export const SkeletonCard = () => (
  <div
    className="panel"
    style={{
      padding: "1.25rem",
      marginBottom: "1rem",
      animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    }}
  >
    <div
      style={{
        height: "24px",
        background: "var(--border-subtle)",
        borderRadius: "4px",
        marginBottom: "0.75rem",
        width: "70%",
      }}
    />
    <div
      style={{
        height: "16px",
        background: "var(--border-subtle)",
        borderRadius: "4px",
        marginBottom: "0.5rem",
        width: "50%",
      }}
    />
    <div
      style={{
        height: "16px",
        background: "var(--border-subtle)",
        borderRadius: "4px",
        width: "40%",
      }}
    />
  </div>
);

/**
 * Multiple skeleton cards for list loading
 */
export const SkeletonList = ({ count = 5 }: { count?: number }) => (
  <>
    {[...Array(count)].map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </>
);
