import styles from './Login.module.css';
import { Button, TextField, Typography, Container } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <Container className={styles.container}>
      <Typography variant="h4">Login</Typography>
      <TextField label="Email" name="email" fullWidth margin="normal" onChange={handleChange} />
      <TextField label="Password" type="password" name="password" fullWidth margin="normal" onChange={handleChange} />
      {error && <Typography color="error">{error}</Typography>}
      <Button variant="contained" onClick={loginLocal} fullWidth sx={{ mt: 2 }}>Login</Button>
      <Button variant="outlined" onClick={loginWithGoogle} fullWidth sx={{ mt: 2 }}>Login with Google</Button>
    </Container>
  );
}
