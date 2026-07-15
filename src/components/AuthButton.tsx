import { useEffect, useRef, useState } from "react";
import { MdKey, MdLogin, MdLogout, MdPerson } from "react-icons/md";
import { useAuth } from "../hooks/useAuth";
import { AuthModal } from "./AuthModal";
import { Loader } from "./Loader";
import { ThemeToggle } from "./ThemeToggle";

export const AuthButton = ({ onOpenSettings }: { onOpenSettings: () => void }) => {
  const { user, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
      <div className="account-summary"><strong>{name}</strong><small>{user.email}</small></div>
      <button role="menuitem" onClick={() => { onOpenSettings(); setMenuOpen(false); }}><MdKey /><span><strong>AI providers</strong><small>Manage keys for this account</small></span></button>
      <ThemeToggle variant="menuItem" />
      <button className="account-signout" role="menuitem" onClick={() => { signOut(); setMenuOpen(false); }}><MdLogout /> Sign out</button>
    </div>}
  </div>;
};
