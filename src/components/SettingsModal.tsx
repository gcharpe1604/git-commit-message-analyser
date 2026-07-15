import { useState } from "react";
import { MdCheck, MdClose, MdDelete, MdEdit, MdKey } from "react-icons/md";
import { useLLM } from "../hooks/useLLM";
import { useAuth } from "../hooks/useAuth";

const KeyField = ({ label, description, currentKey, placeholder, onSave }: { label: string; description: string; currentKey: string; placeholder: string; onSave: (value: string) => void }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const save = () => { if (!value.trim()) return; onSave(value.trim()); setValue(""); setEditing(false); };
  return (
    <div className="key-field">
      <div><strong>{label}</strong><p>{description}</p></div>
      {currentKey && !editing ? <div className="key-saved"><span><MdCheck /> Key saved on this device</span><div><button onClick={() => setEditing(true)} aria-label={`Change ${label} key`}><MdEdit /></button><button onClick={() => onSave("")} aria-label={`Remove ${label} key`}><MdDelete /></button></div></div> : <div className="key-entry"><input type="password" value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => event.key === "Enter" && save()} placeholder={placeholder} autoFocus={editing} /><button onClick={save} disabled={!value.trim()}>Save</button>{editing && <button onClick={() => { setEditing(false); setValue(""); }}>Cancel</button>}</div>}
    </div>
  );
};

export const SettingsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { user } = useAuth();
  const { userGeminiKey, setUserGeminiKey, userOpenRouterKey, setUserOpenRouterKey, userGroqKey, setUserGroqKey, usage } = useLLM();
  if (!isOpen || !user) return null;
  return <div className="modal-layer"><button className="modal-backdrop" onClick={onClose} aria-label="Close settings" /><section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
    <header><div><span>Local preferences</span><h2 id="settings-title">AI providers</h2></div><button onClick={onClose} aria-label="Close settings"><MdClose /></button></header>
    <div className="settings-note"><MdKey /><p><strong>{usage ? `${usage.remaining} of ${usage.limit} free suggestions remain this month.` : "Every account starts with a monthly AI allowance."}</strong> Personal keys stay in this browser and are used automatically after the free allowance is finished.</p></div>
    <div className="provider-list"><KeyField label="Groq" description="Fast primary provider" currentKey={userGroqKey} placeholder="gsk_…" onSave={setUserGroqKey} /><KeyField label="OpenRouter" description="Broad model fallback" currentKey={userOpenRouterKey} placeholder="sk-or-…" onSave={setUserOpenRouterKey} /><KeyField label="Gemini" description="Final fallback provider" currentKey={userGeminiKey} placeholder="AIza…" onSave={setUserGeminiKey} /></div>
  </section></div>;
};
