import { Button, TextField, Typography, Container } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        navigate('/dashboard');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <Container>
      <Typography variant="h4">Register</Typography>
      <TextField label="Name" name="name" fullWidth margin="normal" onChange={handleChange} />
      <TextField label="Email" name="email" fullWidth margin="normal" onChange={handleChange} />
      <TextField label="Password" type="password" name="password" fullWidth margin="normal" onChange={handleChange} />
      {error && <Typography color="error">{error}</Typography>}
      <Button variant="contained" onClick={handleSubmit} fullWidth sx={{ mt: 2 }}>Register</Button>
    </Container>
  );
}