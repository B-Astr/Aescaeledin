// frontend/src/components/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type Role = "CLIENTE" | "EMPRESA" | "PRO";

type Props = {
  children: React.ReactNode;
  allowedRoles?: Role[];
};

type MeUser = {
  id: number;
  email: string;
  role: Role;
  name: string | null;
  picture: string | null;
};

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data: { user?: MeUser; error?: string } = await res.json();

        if (!res.ok || !data.user) {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user_name");
          sessionStorage.removeItem("user_picture");
          sessionStorage.removeItem("user_role");
          setAllowed(false);
          return;
        }

        if (allowedRoles && !allowedRoles.includes(data.user.role)) {
          setAllowed(false);
          return;
        }

        setAllowed(true);
      } catch {
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [allowedRoles]);

  if (loading) {
    return (
      <div className="home-page">
        <div className="home-shell">
          <div style={{ color: "#f8fafc", padding: "40px" }}>
            Validando sesión...
          </div>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
