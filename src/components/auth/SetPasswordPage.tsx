import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, supabaseConfigured } from '../../lib/supabase';
import styles from './LoginPage.module.css';

export function SetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!supabaseConfigured) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('A password deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirm) {
      setError('As passwords não coincidem.');
      return;
    }

    setBusy(true);
    const { error: updateErr } = await supabase.auth.updateUser({ password });

    if (updateErr) {
      setError(updateErr.message);
      setBusy(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => navigate('/app'), 2000);
  }

  if (!ready && !success) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logo}>
            <h1>NotiFlix</h1>
            <p>A verificar o teu convite...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <h1>NotiFlix</h1>
          <p>{success ? 'Password definida!' : 'Define a tua password'}</p>
        </div>

        {success ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
            A redirecionar...
          </p>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.field}>
              <label>Nova password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="mínimo 6 caracteres"
              />
            </div>

            <div className={styles.field}>
              <label>Confirmar password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="repete a password"
              />
            </div>

            <button type="submit" className={styles.submit} disabled={busy}>
              {busy ? 'A guardar...' : 'Definir password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
