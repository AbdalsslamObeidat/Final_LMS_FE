import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, TextField, Button, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../utils/AuthContext';
import styles from './CreateCourse.module.css';

export default function CreateCourse({ onSubmit, onCancel, initialData }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    category_id: '',
    is_published: false,
  });
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const auth = useAuth();
  const user = auth && auth.user ? auth.user : null;

  useEffect(() => {
    axios.get('/api/categories/getall')
      .then(res => {
        // Debug: log the response to check structure
        console.log('Categories API response:', res);
        // Try to get categories from different possible keys
        const cats = res.data.categories || res.data || [];
        setCategories(Array.isArray(cats) ? cats : []);
        setLoadingCategories(false);
      })
      .catch((err) => {
        setLoadingCategories(false);
        console.error('Failed to load categories:', err);
      });
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        thumbnail_url: initialData.thumbnail_url || '',
        category_id: initialData.category_id || '',
        is_published: initialData.is_published || false,
      });
    } else {
      setForm({ title: '', description: '', thumbnail_url: '', category_id: '', is_published: false });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Auth user:', user); // Debug user value
    const payload = {
      title: form.title,
      description: form.description,
      thumbnail_url: form.thumbnail_url,
      instructor_id: String(user?.id),
      category_id: String(form.category_id),
    };
    console.log('Form payload:', payload); // Debug payload
    if (!user || !user.id) {
      alert('User not authenticated. Please log in.');
      return;
    }
    try {
      let res;
      if (initialData && initialData.id) {
        // Update existing course
        res = await axios.put(`/api/courses/update/${initialData.id}`, payload);
      } else {
        // Create new course
        res = await axios.post('/api/courses/create', payload);
      }
      if (res.data && res.data.success) {
        onSubmit(res.data.course || payload);
      } else {
        alert('Failed to save course.');
      }
    } catch (err) {
      alert('Error saving course.');
    }
  };

  return (
    <Paper className={styles.formPaper}>
      <Typography className={styles.formTitle} variant="h6">{initialData ? 'Edit Course' : 'Create Course'}</Typography>
      <Box component="form" onSubmit={handleSubmit} className={styles.formBox}>
        <TextField label="Title" name="title" value={form.title} onChange={handleChange} required className={styles.textField} InputProps={{ style: { color: '#e2e8f0' } }} />
        <TextField label="Description" name="description" value={form.description} onChange={handleChange} required className={styles.textField} InputProps={{ style: { color: '#e2e8f0' } }} />
        <TextField label="Thumbnail URL" name="thumbnail_url" value={form.thumbnail_url} onChange={handleChange} className={styles.textField} InputProps={{ style: { color: '#e2e8f0' } }} />
        <FormControl required className={styles.textField}>
          <InputLabel id="category-label" sx={{ color: '#cbd5e1' }}>Category</InputLabel>
          <Select
            labelId="category-label"
            name="category_id"
            value={form.category_id}
            label="Category"
            onChange={handleChange}
            sx={{ color: '#e2e8f0', background: '#0f172a' }}
            disabled={loadingCategories}
          >
            {categories.map((cat) => (
              <MenuItem key={cat.id || cat._id} value={cat.id || cat._id}>{cat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box className={styles.buttonRow}>
          <Button type="submit" variant="contained" className={styles.submitButton}>{initialData ? 'Update' : 'Create'}</Button>
          <Button onClick={onCancel} variant="outlined" className={styles.cancelButton}>Cancel</Button>
        </Box>
      </Box>
    </Paper>
  );
}
