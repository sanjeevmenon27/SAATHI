import { Navigate } from "react-router-dom";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50 px-4">
        <div className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-card">
          <LoadingSkeleton rows={3} />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
