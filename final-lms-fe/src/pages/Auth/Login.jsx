import {
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import "./Auth.css";
import { FaGoogle } from "react-icons/fa";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { parseJwt } from '../../utils/jwt'; // adjust the path as needed

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const loginLocal = async () => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });

      const data = await res.json();

      if (data.success && data.accessToken) {
        const decoded = parseJwt(data.accessToken);
        const role = decoded?.role || data.role;

        if (decoded) {
          localStorage.setItem("token", data.accessToken);
          localStorage.setItem("role", role);

          // Redirect based on role (case-insensitive)
          const roleLower = role?.toLowerCase();
          if (roleLower === "admin") {
            navigate("/adminPanel", { state: { token: data.accessToken } });
          } else if (roleLower === "instructor") {
            navigate("/instructorPanel", { state: { token: data.accessToken } });
          } else if (roleLower === "student") {
            navigate("/studentPanel", { state: { token: data.accessToken } });
          } else {
            setError("Unknown role: " + role);
            console.log("Unknown role encountered:", role);
          }
        } else {
          setError("Invalid token");
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const loginWithGoogle = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className={styles.container}>
      <Paper className={styles.form} elevation={0}>
        <Typography variant="h4" className={styles.title}>
          Login
        </Typography>
        <Typography className={styles.subtitle}>Glad you're back!</Typography>

        <TextField
          label="Email"
          name="email"
          type="email"
          fullWidth
          margin="normal"
          onChange={handleChange}
          variant="outlined"
        />

        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          fullWidth
          margin="normal"
          onChange={handleChange}
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={togglePasswordVisibility} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {error && <div className={styles.error}>{error}</div>}

        <Button
          variant="contained"
          onClick={loginLocal}
          fullWidth
          className="gradient-button"
          sx={{ mt: 2 }}
        >
          Login
        </Button>

        <div className={styles.divider}>
          <span>Or</span>
        </div>

        <div className={styles.socialLogin}>
          <FaGoogle
            className="google-icon"
            onClick={loginWithGoogle}
            style={{ color: "#4285F4", fontSize: "32px", cursor: "pointer" }}
          />
        </div>

        <Typography align="center" sx={{ mt: 2 }}>
          Don't have an account?{" "}
          <Link to="/register" className="gradient-text">
            Register
          </Link>
        </Typography>
      </Paper>
    </div>
  );
}