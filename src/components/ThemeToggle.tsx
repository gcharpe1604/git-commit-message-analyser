import { useEffect, useState } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";

const initialTheme = (): "light" | "dark" => {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

export const ThemeToggle = ({ variant = "button" }: { variant?: "button" | "menuItem" }) => {
  const [theme, setTheme] = useState<"light" | "dark">(initialTheme);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const nextTheme = theme === "light" ? "dark" : "light";
  const toggle = () => setTheme(nextTheme);
  if (variant === "menuItem") return <button className="theme-menu-item" onClick={toggle}><span>{theme === "light" ? <MdDarkMode /> : <MdLightMode />}</span><span><strong>Use {nextTheme} mode</strong><small>Current appearance: {theme}</small></span></button>;
  return <button className="theme-toggle" onClick={toggle} aria-label={`Switch to ${nextTheme} mode`} title={`Switch to ${nextTheme} mode`}><span className={theme === "light" ? "active" : ""}><MdLightMode /></span><span className={theme === "dark" ? "active" : ""}><MdDarkMode /></span></button>;
};
