import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const role = params.get("role");

    console.log("OAuthCallback token:", token, "role:", role);

    if (token && role) {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      // Redirect based on role and force reload to ensure ProtectedRoute sees the new token
      if (role === "admin") {
        window.location.replace("/adminPanel");
      } else if (role === "teacher") {
        window.location.replace("/instructorPanel");
      } else {
        window.location.replace("/studentPanel");
      }
    }
  }, []);

  return <div>Redirecting...</div>;
}