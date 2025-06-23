import { Navigate } from "react-router-dom";
import { parseJwt } from '../utils/jwt';

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  let role = localStorage.getItem("role");

  if (!role && token) {
    const decoded = parseJwt(token);
    role = decoded?.role;
    if (role) {
      localStorage.setItem("role", role);
    }
  }



  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (
    allowedRoles &&
    !allowedRoles.map(r => r.toLowerCase()).includes(role?.toLowerCase())
  ) {
    return <Navigate to="/login" replace />;
  }
  return children;
}