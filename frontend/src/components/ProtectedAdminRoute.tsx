import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getAuth } from '../services/AuthService';

function ProtectedAdminRoute() {
  const location = useLocation();
  const auth = getAuth();

  if (!auth || auth.role !== 'ROLE_ADMIN') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export default ProtectedAdminRoute;
