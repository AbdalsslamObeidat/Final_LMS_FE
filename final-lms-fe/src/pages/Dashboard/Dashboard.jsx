import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");
    const tokenFromStorage = localStorage.getItem("token");

    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      window.history.replaceState({}, "", "/dashboard");
      setAuthorized(true); // ✅ allow rendering
    } else if (tokenFromStorage) {
      setAuthorized(true); // ✅ token already stored
    } else {
      navigate("/login"); // ❌ no token, redirect
    }
  }, []);

  if (!authorized) return <div>Loading...</div>; // 🕓 avoid showing blank or jumping

  return (
    <div style={{ padding: "40px", fontSize: "24px", color: "#333" }}>
      🎉 Welcome to the Dashboard!
    </div>
  );
}
