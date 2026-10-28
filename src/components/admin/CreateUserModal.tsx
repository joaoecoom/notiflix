import { useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { getBuiltinPlatforms } from '../../engines/platform';
import styles from './AdminLayout.module.css';

interface CreateUserModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateUserModal({ onClose, onCreated }: CreateUserModalProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [canManual, setCanManual] = useState(true);
  const [canAuto, setCanAuto] = useState(true);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(() =>
    getBuiltinPlatforms().map((p) => p.id)
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const platforms = getBuiltinPlatforms();

  function togglePlatform(id: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const { data, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: 'user' },
      },
    });

    if (signUpErr) {
      setError(signUpErr.message);
      setBusy(false);
      return;
    }

    if (data.user) {
      await supabase
        .from('user_permissions')
        .update({
          can_manual_notification: canManual,
          can_auto_system: canAuto,
          allowed_platforms: selectedPlatforms,
        })
        .eq('user_id', data.user.id);
    }

    setBusy(false);
    onCreated();
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Novo utilizador</h2>

        <form className={styles.modalForm} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label>Nome</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="João Silva"
            />
          </div>

          <div className={styles.field}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@exemplo.com"
            />
          </div>

          <div className={styles.field}>
            <label>Password temporária</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="mínimo 6 caracteres"
            />
          </div>

          <div>
            <label className={styles.field}>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Permissões
              </span>
            </label>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={canManual}
                  onChange={(e) => setCanManual(e.target.checked)}
                />
                Notificação manual
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={canAuto}
                  onChange={(e) => setCanAuto(e.target.checked)}
                />
                Sistema automático
              </label>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Plataformas
            </label>
            <div className={styles.platformGrid}>
              {platforms.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`${styles.platformChip} ${selectedPlatforms.includes(p.id) ? styles.platformChipActive : ''}`}
                  onClick={() => togglePlatform(p.id)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn} disabled={busy}>
              {busy ? 'A criar...' : 'Criar utilizador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
