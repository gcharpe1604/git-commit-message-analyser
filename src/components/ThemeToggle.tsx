import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme =
      (localStorage.getItem("theme") as "light" | "dark") || "dark"; // Default to dark for premium feel
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn-secondary"
      aria-label="Toggle Dark Mode"
    >
      <span
        style={{
          display: "inline-block",
          transform: theme === "light" ? "rotate(0deg)" : "rotate(360deg)",
          transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {theme === "light" ? "☀️" : "🌙"}
      </span>
      <span>{theme === "light" ? "Light Mode" : "Dark Mode"}</span>
    </button>
  );
};
