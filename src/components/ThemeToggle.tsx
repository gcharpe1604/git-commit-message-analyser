import { useEffect, useState } from "react";
import { MdDarkMode } from "react-icons/md";
import { CiLight } from "react-icons/ci";

export const ThemeToggle = ({ variant = "button" }: { variant?: "button" | "menuItem" }) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme =
      (localStorage.getItem("theme") as "light" | "dark") || "dark"; // Default to dark for premium feel
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  if (variant === "menuItem") {
    return (
      <button
        onClick={toggleTheme}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.65rem 0.5rem",
          border: "none",
          background: "transparent",
          color: "var(--text-primary)",
          cursor: "pointer",
          fontSize: "0.85rem",
          borderRadius: "6px",
          transition: "background 0.15s",
          textAlign: "left",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-panel-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        aria-label="Toggle Dark Mode"
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "18px",
            color: "var(--text-secondary)",
            transform: theme === "light" ? "rotate(0deg)" : "rotate(360deg)",
            transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {theme === "light" ? <MdDarkMode size={18} /> : <CiLight size={18} />}
        </span>
        <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
      </button>
    );
  }

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
        {theme === "light" ? <MdDarkMode /> : <CiLight />}
      </span>
      <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
    </button>
  );
};
