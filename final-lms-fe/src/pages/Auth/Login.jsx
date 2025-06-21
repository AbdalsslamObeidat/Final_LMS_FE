import { Button, TextField, Typography, Paper, Checkbox, FormControlLabel } from '@mui/material';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import './Auth.css';
import { FaGoogle } from 'react-icons/fa';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const loginLocal = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const loginWithGoogle = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className={styles.container}>
      <Paper className={styles.form} elevation={0}>
        <Typography variant="h4" className={styles.title}>
          Login
        </Typography>
        <Typography className={styles.subtitle}>
          Glad you're back!
        </Typography>
        
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
          type="password"
          name="password"
          fullWidth
          margin="normal"
          onChange={handleChange}
          variant="outlined"
        />
        
        <div className={styles.rememberForgot}>
          <FormControlLabel
            control={
              <Checkbox 
                name="remember" 
                sx={{ 
                  color: '#6366f1',
                  '&.Mui-checked': { 
                    color: '#6366f1' 
                  } 
                }} 
              />
            }
            label="Remember me"
          />
          <Link to="/forgot-password" className={styles.forgotPassword}>
            Forgot password ?
          </Link>
        </div>
        
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
          <FaGoogle className="google-icon" onClick={loginWithGoogle} />
        </div>
        
        <Typography align="center" sx={{ mt: 2 }}>
          Don't have an account?{' '}
          <Link to="/register" className="gradient-text">
            Register
          </Link>
        </Typography>
      </Paper>
    </div>
  );
}
