import {
  Button,
  TextField,
  Typography,
  Paper,
  FormControlLabel,
  Checkbox,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Register.module.css";
import "./Auth.css";
import { FaGoogle } from "react-icons/fa";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        navigate("/dashboard");
      } else {
        setError(data.message || "Registration failed");
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
          Signup
        </Typography>
        <Typography className={styles.subtitle}>
          Just some details to get you in!
        </Typography>

        <TextField
          label="Full Name"
          name="name"
          fullWidth
          margin="normal"
          onChange={handleChange}
          variant="outlined"
        />

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

        <TextField
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          fullWidth
          margin="normal"
          onChange={handleChange}
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={toggleConfirmPasswordVisibility}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <div className={styles.termsContainer}>
          <FormControlLabel
            control={
              <Checkbox
                name="terms"
                checked={form.terms}
                onChange={handleChange}
                sx={{
                  color: "#6366f1",
                  "&.Mui-checked": {
                    color: "#6366f1",
                  },
                }}
              />
            }
            label={
              <span className={styles.termsText}>
                I agree to the{" "}
                <Link to="/terms" className="gradient-text">
                  Terms and Conditions
                </Link>
              </span>
            }
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <Button
          variant="contained"
          onClick={handleSubmit}
          fullWidth
          className="gradient-button"
          sx={{ mt: 2 }}
          disabled={!form.terms}
        >
          SignUp
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
          Already have an account?{" "}
          <Link to="/login" className="gradient-text">
            Login
          </Link>
        </Typography>
      </Paper>
    </div>
  );
}
