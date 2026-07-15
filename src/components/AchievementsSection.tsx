import type { Achievement } from "../types";

export const AchievementsSection = ({ achievements }: { achievements: Achievement[] }) => {
  const unique = Array.from(new Map(achievements.map((item) => [item.id, item])).values());
  if (!unique.length) return null;
  return (
    <section className="achievement-strip">
      <div><span className="card-kicker">Signals earned</span><h2>Healthy habits detected.</h2></div>
      <div className="achievement-list">{unique.map((item) => <article key={item.id}><span>{item.icon}</span><div><strong>{item.name}</strong><p>{item.description}</p></div></article>)}</div>
    </section>
  );
};
