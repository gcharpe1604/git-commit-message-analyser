import type { Achievement } from "../types";

interface AchievementsSectionProps {
  achievements: Achievement[];
}

export const AchievementsSection = ({
  achievements,
}: AchievementsSectionProps) => {
  // Deduplicate achievements based on ID
  const uniqueAchievements = Array.from(
    new Map(achievements.map((item) => [item.id, item])).values()
  );

  if (uniqueAchievements.length === 0) return null;

  return (
    <div
      className="panel animate-in"
      style={{ padding: "1.5rem", marginBottom: "2rem" }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: "1rem",
          fontSize: "1.2rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        🏆 Unlocked Achievements
      </h3>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {uniqueAchievements.map((achievement) => (
          <div
            key={achievement.id}
            style={{
              background: "var(--bg-page)",
              padding: "0.75rem 1rem",
              borderRadius: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              border: "1px solid var(--border-subtle)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>{achievement.icon}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                {achievement.name}
              </div>
              <div
                style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}
              >
                {achievement.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
