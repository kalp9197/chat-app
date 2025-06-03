import { Navigate } from "react-router-dom";
import { useAuth } from "@/store/auth";

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
