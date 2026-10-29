import { useState, type FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    if (resetMode) {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/set-password`,
      });
      if (resetErr) setError(resetErr.message);
      else setResetSent(true);
      setBusy(false);
      return;
    }

    const err = await signIn(email, password);
    if (err) setError(err);
    setBusy(false);
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <h1>NotiFlix</h1>
          <p>{resetMode ? 'Recuperar password' : 'Inicia sessão para continuar'}</p>
        </div>

        {resetSent ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>
              Se o email <strong>{email}</strong> estiver registado, vais receber um link para redefinir a tua password.
            </p>
            <button
              type="button"
              className={styles.submit}
              style={{ marginTop: 16 }}
              onClick={() => { setResetMode(false); setResetSent(false); setError(null); }}
            >
              Voltar ao login
            </button>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="email@exemplo.com"
              />
            </div>

            {!resetMode && (
              <div className={styles.field}>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>
            )}

            <button type="submit" className={styles.submit} disabled={busy}>
              {busy
                ? (resetMode ? 'A enviar...' : 'A entrar...')
                : (resetMode ? 'Enviar link de recuperação' : 'Entrar')}
            </button>

            <button
              type="button"
              onClick={() => { setResetMode(!resetMode); setError(null); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: 13,
                cursor: 'pointer',
                padding: '8px 0 0',
                textDecoration: 'underline',
              }}
            >
              {resetMode ? 'Voltar ao login' : 'Esqueci a password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
