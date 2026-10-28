import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, supabaseConfigured } from '../../lib/supabase';
import type { Profile, UserPermissions as Perms } from '../../lib/supabase';
import { CreateUserModal } from './CreateUserModal';
import styles from './AdminLayout.module.css';

interface UserWithPerms extends Profile {
  permissions?: Perms;
}

export function UserList() {
  const [users, setUsers] = useState<UserWithPerms[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  async function fetchUsers() {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: perms } = await supabase
      .from('user_permissions')
      .select('*');

    const permsMap = new Map((perms ?? []).map((p) => [p.user_id, p]));
    const merged = (profiles ?? []).map((p) => ({
      ...p,
      permissions: permsMap.get(p.id),
    }));

    setUsers(merged);
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  function getInitials(user: Profile) {
    if (user.full_name) {
      return user.full_name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email[0].toUpperCase();
  }

  return (
    <>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Utilizadores</h2>
        <button
          type="button"
          className={styles.createBtn}
          onClick={() => setShowCreate(true)}
        >
          + Novo utilizador
        </button>
      </div>

      {loading ? (
        <div className={styles.empty}>A carregar...</div>
      ) : users.length === 0 ? (
        <div className={styles.empty}>
          Nenhum utilizador criado. Clica em "+ Novo utilizador" para começar.
        </div>
      ) : (
        <div className={styles.userList}>
          {users.map((user) => (
            <div
              key={user.id}
              className={styles.userCard}
              onClick={() => navigate(`users/${user.id}`)}
            >
              <div className={styles.userAvatar}>{getInitials(user)}</div>
              <div className={styles.userInfo}>
                <div className={styles.userName}>
                  {user.full_name || user.email}
                </div>
                <div className={styles.userEmail}>{user.email}</div>
              </div>
              <div className={styles.userMeta}>
                <span className={`${styles.tag} ${user.role === 'admin' ? styles.tagActive : ''}`}>
                  {user.role}
                </span>
                <span className={`${styles.tag} ${user.is_active ? styles.tagActive : styles.tagInactive}`}>
                  {user.is_active ? 'activo' : 'inactivo'}
                </span>
                {user.permissions?.can_manual_notification && (
                  <span className={styles.tag}>manual</span>
                )}
                {user.permissions?.can_auto_system && (
                  <span className={styles.tag}>automático</span>
                )}
                {(user.permissions?.allowed_platforms?.length ?? 0) > 0 && (
                  <span className={styles.tag}>
                    {user.permissions!.allowed_platforms.length} plataformas
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchUsers();
          }}
        />
      )}
    </>
  );
}
