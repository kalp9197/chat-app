import { Navigate } from "react-router-dom";
import useAuth from "../store/auth";

export default function AuthRoute({ children }) {
  const isAuthenticated = useAuth((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
