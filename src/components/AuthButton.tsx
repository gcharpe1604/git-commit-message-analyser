import { useEffect, useRef, useState } from "react";
import { MdAutoAwesome, MdKey, MdLogin, MdLogout, MdPerson } from "react-icons/md";
import { useAuth } from "../hooks/useAuth";
import { AuthModal } from "./AuthModal";
import { Loader } from "./Loader";
import { ThemeToggle } from "./ThemeToggle";
import { useLLM } from "../hooks/useLLM";

export const AuthButton = ({ onOpenSettings }: { onOpenSettings: () => void }) => {
  const { user, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { usage, usageLoading, usageError, hasUserApiKey } = useLLM();

  useEffect(() => {
    const close = (event: MouseEvent) => { if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (loading) return <Loader size={0.25} style={{ padding: 0 }} />;
  if (!user) return <><ThemeToggle /><button className="navbar-signin" onClick={() => setAuthOpen(true)}><MdLogin /> Sign in</button><AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} /></>;

  const name = user.user_metadata?.user_name || user.user_metadata?.full_name || user.email || "Account";
  const avatar = user.user_metadata?.avatar_url;
  return <div className="navbar-account" ref={menuRef}>
    <button className="account-trigger" onClick={() => setMenuOpen(!menuOpen)} aria-label={`Open account menu for ${name}`} aria-expanded={menuOpen}>
      {avatar ? <img src={avatar} alt="" /> : <MdPerson />}<span>{name}</span>
    </button>
    {menuOpen && <div className="account-menu" role="menu">
      <div className="account-summary" role="none"><strong>{name}</strong><small>{user.email}</small></div>
      <div className="account-ai-usage" role="none">
        <div><span><MdAutoAwesome /> Free AI suggestions</span><strong>{usageLoading ? "…" : usage ? `${usage.used}/${usage.limit} used` : "Unavailable"}</strong></div>
        <div className="account-usage-track" role="progressbar" aria-label="Monthly free AI suggestions used" aria-valuemin={0} aria-valuemax={usage?.limit ?? 15} aria-valuenow={usage?.used ?? 0}><i style={{ width: `${usage ? (usage.used / usage.limit) * 100 : 0}%` }} /></div>
        <small>{usageError ? "Usage will appear after the next deployment." : usage?.remaining === 0 ? hasUserApiKey ? "Personal provider fallback is ready." : "Add a personal key to keep generating." : `${usage?.remaining ?? 15} suggestions remaining this month.`}</small>
      </div>
      <button role="menuitem" onClick={() => { onOpenSettings(); setMenuOpen(false); }}><MdKey /><span><strong>AI providers</strong><small>Manage keys for this account</small></span></button>
      <ThemeToggle variant="menuItem" />
      <button className="account-signout" role="menuitem" onClick={() => { signOut(); setMenuOpen(false); }}><MdLogout /> Sign out</button>
    </div>}
  </div>;
};
