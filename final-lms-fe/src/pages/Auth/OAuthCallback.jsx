import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Box, Typography } from "@mui/material";
import { parseJwt } from '../../utils/jwt';

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      const decoded = parseJwt(token);
      const role = decoded?.role;

      console.log("OAuthCallback token:", token, "role:", role);

      if (role) {
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);

        // Redirect based on role and force reload to ensure ProtectedRoute sees the new token
        if (role === "admin") {
          window.location.replace("/adminPanel");
        } else if (role === "instructor") {
          window.location.replace("/instructorPanel");
        } else {
          window.location.replace("/studentPanel");
        }
      } else {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <CircularProgress color="primary" />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Redirecting, please wait...
      </Typography>
    </Box>
  );
}