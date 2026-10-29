import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import type { Profile, UserPermissions as Perms } from '../../lib/supabase';
import { getBuiltinPlatforms } from '../../engines/platform';
import styles from './AdminLayout.module.css';

export function UserPermissions() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [perms, setPerms] = useState<Perms | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const platforms = getBuiltinPlatforms();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId!)
        .single();

      const { data: p } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId!)
        .single();

      setProfile(prof);
      setPerms(p);
      setLoading(false);
    }
    if (userId) load();
  }, [userId]);

  async function savePermissions() {
    if (!perms) return;
    setSaving(true);
    setError(null);

    const { error: err } = await supabase
      .from('user_permissions')
      .update({
        can_manual_notification: perms.can_manual_notification,
        can_auto_system: perms.can_auto_system,
        allowed_platforms: perms.allowed_platforms,
      })
      .eq('user_id', userId!);

    if (err) setError(err.message);
    setSaving(false);
  }

  async function deleteUser() {
    if (!userId) return;
    setDeleting(true);
    setError(null);

    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (delErr) {
      setError(delErr.message);
      setDeleting(false);
      setConfirmDelete(false);
      return;
    }

    navigate('/admin');
  }

  async function toggleActive() {
    if (!profile) return;
    const newActive = !profile.is_active;
    await supabase
      .from('profiles')
      .update({ is_active: newActive })
      .eq('id', userId!);
    setProfile({ ...profile, is_active: newActive });
  }

  function togglePlatform(id: string) {
    if (!perms) return;
    const list = perms.allowed_platforms.includes(id)
      ? perms.allowed_platforms.filter((p) => p !== id)
      : [...perms.allowed_platforms, id];
    setPerms({ ...perms, allowed_platforms: list });
  }

  if (loading) {
    return <div className={styles.empty}>A carregar...</div>;
  }

  if (!profile) {
    return <div className={styles.empty}>Utilizador não encontrado.</div>;
  }

  return (
    <>
      <button
        type="button"
        className={styles.backBtn}
        onClick={() => navigate('/admin')}
      >
        ← Voltar
      </button>

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          {profile.full_name || profile.email}
        </h2>
        <span className={`${styles.tag} ${profile.is_active ? styles.tagActive : styles.tagInactive}`}>
          {profile.is_active ? 'activo' : 'inactivo'}
        </span>
      </div>

      <div className={styles.userEmail} style={{ marginBottom: 24 }}>
        {profile.email}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {perms && (
        <>
          <div className={styles.permSection}>
            <h3>Funcionalidades</h3>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={perms.can_manual_notification}
                  onChange={(e) =>
                    setPerms({ ...perms, can_manual_notification: e.target.checked })
                  }
                />
                Notificação manual (timeline, seeds)
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={perms.can_auto_system}
                  onChange={(e) =>
                    setPerms({ ...perms, can_auto_system: e.target.checked })
                  }
                />
                Sistema automático (bulk generator)
              </label>
            </div>
          </div>

          <div className={styles.permSection}>
            <h3>Plataformas permitidas</h3>
            <div className={styles.platformGrid}>
              {platforms.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`${styles.platformChip} ${perms.allowed_platforms.includes(p.id) ? styles.platformChipActive : ''}`}
                  onClick={() => togglePlatform(p.id)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.modalActions} style={{ justifyContent: 'flex-start', marginTop: 24 }}>
            <button
              type="button"
              className={styles.saveBtn}
              disabled={saving}
              onClick={savePermissions}
            >
              {saving ? 'A guardar...' : 'Guardar permissões'}
            </button>
          </div>
        </>
      )}

      <div className={styles.dangerZone}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#ef4444', marginBottom: 12 }}>
          Zona perigosa
        </h3>
        <div className={styles.statusToggle}>
          <button type="button" className={styles.dangerBtn} onClick={toggleActive}>
            {profile.is_active ? 'Desactivar utilizador' : 'Reactivar utilizador'}
          </button>
        </div>

        <div className={styles.statusToggle} style={{ marginTop: 12 }}>
          {confirmDelete ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#ef4444' }}>Tens a certeza? Esta acção é irreversível.</span>
              <button
                type="button"
                className={styles.dangerBtn}
                style={{ background: '#dc2626' }}
                disabled={deleting}
                onClick={deleteUser}
              >
                {deleting ? 'A apagar...' : 'Sim, apagar'}
              </button>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setConfirmDelete(false)}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={styles.dangerBtn}
              style={{ background: '#dc2626' }}
              onClick={() => setConfirmDelete(true)}
            >
              Apagar utilizador permanentemente
            </button>
          )}
        </div>
      </div>
    </>
  );
}
