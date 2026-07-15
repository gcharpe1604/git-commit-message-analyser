import { useState } from "react";
import { MdClose, MdHistory, MdKey, MdLogin, MdLogout } from "react-icons/md";
import { useAuth } from "../hooks/useAuth";
import { AuthModal } from "./AuthModal";
import { ThemeToggle } from "./ThemeToggle";
import { useLLM } from "../hooks/useLLM";

export const MobileSidebar = ({ isOpen, onClose, onOpenHistory, onOpenSettings }: { isOpen: boolean; onClose: () => void; onOpenHistory: () => void; onOpenSettings: () => void }) => {
  const { user, signOut } = useAuth();
  const { usage } = useLLM();
  const [authOpen, setAuthOpen] = useState(false);
  return <>
    {isOpen && <div className="drawer-layer"><button className="drawer-backdrop" onClick={onClose} aria-label="Close menu" /><aside className="mobile-drawer" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title">
      <header><div><span>Navigation</span><h2 id="mobile-menu-title">Menu</h2></div><button onClick={onClose} aria-label="Close menu"><MdClose /></button></header>
      {user && <div className="mobile-account"><strong>{user.user_metadata?.user_name || user.email}</strong><small>{user.email}</small>{usage && <span>{usage.used}/{usage.limit} free AI suggestions used</span>}</div>}
      <nav>{user && <><button onClick={() => { onClose(); onOpenHistory(); }}><MdHistory /><span><strong>Analysis history</strong><small>Reopen synced repository reports</small></span></button><button onClick={() => { onClose(); onOpenSettings(); }}><MdKey /><span><strong>AI provider keys</strong><small>Manage keys for this account</small></span></button></>}<ThemeToggle variant="menuItem" /></nav>
      <footer>{user ? <button onClick={() => { signOut(); onClose(); }}><MdLogout /> Sign out</button> : <button className="primary" onClick={() => { onClose(); setAuthOpen(true); }}><MdLogin /> Sign in or sign up</button>}</footer>
    </aside></div>}
    {!user && <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />}
  </>;
};
