import { Navigate, Outlet } from 'react-router-dom';
import { getCurrentUser, useStoreVersion } from '../../lib/store';

/** Route guard: replaces AquaStore.requireRole(). Sends visitors to /login. */
export default function RequireRole({ roles }) {
  useStoreVersion();
  const user = getCurrentUser();
  if (!user || !roles.includes(user.role)) return <Navigate to="/login" replace />;
  return <Outlet />;
}
