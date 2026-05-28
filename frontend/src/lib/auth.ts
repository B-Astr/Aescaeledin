// frontend/src/lib/auth.ts
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export type AuthUser = {
  id: number;
  email: string;
  role: string;
  name: string | null;
  picture: string | null;
  otpEnabled: boolean;
};

export function getToken() {
  return sessionStorage.getItem("token");
}

export function logout() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user_name");
  sessionStorage.removeItem("user_picture");
  sessionStorage.removeItem("user_role");
}

export async function fetchMe(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    logout();
    return null;
  }

  const data = await res.json();
  return data.user ?? null;
}
