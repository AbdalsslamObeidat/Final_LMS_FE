import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/auth/me', {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async res => {
        if (!res.ok) {
          // Suppress 401 error log
          if (res.status !== 401) {
            const text = await res.text();
            console.error('Auth check error:', res.status, text);
          }
          return { success: false };
        }
        return res.json();
      })
      .then(data => {
        if (data.success) setUser(data.user);
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);