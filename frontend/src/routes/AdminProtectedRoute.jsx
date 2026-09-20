import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AdminProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to admin login, saving the location they attempted to access
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
