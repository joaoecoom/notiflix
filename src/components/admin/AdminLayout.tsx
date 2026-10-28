import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserList } from './UserList';
import { UserPermissions } from './UserPermissions';
import styles from './AdminLayout.module.css';

export function AdminLayout() {
  const { signOut } = useAuth();

  return (
    <div className={styles.layout}>
      <header className={styles.topBar}>
        <span className={styles.logo}>NotiFlix</span>
        <span className={styles.adminBadge}>Admin</span>
        <div className={styles.spacer} />
        <button type="button" className={styles.logoutBtn} onClick={signOut}>
          Sair
        </button>
      </header>

      <div className={styles.content}>
        <Routes>
          <Route index element={<UserList />} />
          <Route path="users/:userId" element={<UserPermissions />} />
        </Routes>
      </div>
    </div>
  );
}
