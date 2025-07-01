import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, TextField, Button, MenuItem, CircularProgress, Select, FormControl, InputLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useAuth } from '../../utils/AuthContext';
import styles from './EditCourse.module.css';

export default function EditCourse({ onSubmit, onCancel, course, onDelete, onCourseDeleted }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    category_id: '',
    is_published: false,
  });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const auth = useAuth();
  const user = auth?.user;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories...');
        const res = await axios.get('/api/categories/getall');
        console.log('Categories API response:', res.data);
        
        const cats = Array.isArray(res.data) ? res.data : res.data.categories || [];
        console.log('Processed categories:', cats);
        
        setCategories(cats);
        setError('');
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (course && categories.length > 0) {
      console.log('Setting form with course data:', course);
      console.log('Available categories:', categories);
      
      // Convert all category IDs to strings for consistent comparison
      const categoryId = String(course.category_id);
      const categoryExists = categories.some(
        cat => String(cat.id || cat._id) === categoryId
      );
      
      console.log('Category exists check:', { categoryId, categoryExists });
      
      setForm({
        title: course.title || '',
        description: course.description || '',
        thumbnail_url: course.thumbnail_url || '',
        category_id: categoryExists ? categoryId : '',
        is_published: course.is_published || false,
      });
      
      setIsInitialized(true);
    }
  }, [course, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await onSubmit(form);
    } catch (err) {
      console.error('Error saving course:', err);
      setError('Failed to save course. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this course? This action will permanently remove the course and all its contents.')) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      };

      console.log('Attempting to delete course ID:', course.id);
      
      try {
        // Try the primary delete endpoint
        const response = await axios.delete(`/api/courses/delete/${course.id}`, {
          headers,
          withCredentials: true,
          validateStatus: (status) => true // Don't throw on any status code
        });

        console.log('Delete response:', response);
        
        if (response.status === 200 && response.data?.success) {
          handleDeleteSuccess();
          return;
        }
        
        // Handle specific error cases
        if (response.status === 500 && response.data?.message?.includes('associated records')) {
          // Show a more helpful message for associated records
          setError(
            'This course cannot be deleted because it has associated records (like enrollments, lessons, etc.). ' +
            'Please remove all associated content before deleting the course.'
          );
          return;
        }
        
        // For other error cases
        throw new Error(response.data?.message || `Server returned status ${response.status}`);
        
      } catch (error) {
        console.error('Error in delete request:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config
        });
        
        // Handle network errors or other request failures
        if (!error.response) {
          throw new Error('Network error. Please check your connection and try again.');
        }
        
        // Handle specific error cases from the server
        if (error.response.data?.message?.includes('associated records')) {
          setError(
            'This course cannot be deleted because it has associated records (like enrollments, lessons, etc.). ' +
            'Please remove all associated content before deleting the course.'
          );
          return;
        }
        
        // For other error cases, use the server's error message or a generic one
        throw new Error(
          error.response.data?.message || 
          `Server error (${error.response.status}): ${JSON.stringify(error.response.data)}`
        );
      }
      
    } catch (error) {
      console.error('Failed to delete course:', error);
      
      // Set user-friendly error message
      let errorMessage = 'Failed to delete course. ';
      
      if (error.response?.status === 401) {
        errorMessage = 'You are not authorized to perform this action. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to delete this course.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Course not found. It may have already been deleted.';
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteSuccess = () => {
    alert('Course deleted successfully');
    if (onCourseDeleted) onCourseDeleted();
    if (onCancel) onCancel();
  };

  // Don't render until categories are loaded and form is initialized
  if (!course) return <div>Course not found</div>;
  if (!isInitialized) return <div>Loading course data...</div>;

  return (
    <Paper className={styles.paper}>
      <Typography variant="h5" className={styles.title}>
        Edit Course
      </Typography>

      {error && (
        <Typography color="error" className={styles.error}>
          {error}
        </Typography>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <TextField
          label="Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />

        <TextField
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          fullWidth
          multiline
          rows={4}
          margin="normal"
          required
        />

        <FormControl fullWidth margin="normal" required error={!form.category_id && form.category_id !== ''}>
          <InputLabel id="category-select-label">Category</InputLabel>
          <Select
            labelId="category-select-label"
            id="category_id"
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            disabled={isLoadingCategories}
            displayEmpty
            label="Category"
          >
            <MenuItem value="" disabled>
              {categories.length === 0 ? 'No categories available' : 'Select a category'}
            </MenuItem>
            {categories.map((category) => {
              const categoryId = String(category.id || category._id);
              return (
                <MenuItem key={categoryId} value={categoryId}>
                  {category.name}
                </MenuItem>
              );
            })}
          </Select>
          {isLoadingCategories && (
            <Typography variant="caption" color="textSecondary">
              Loading categories...
            </Typography>
          )}
        </FormControl>

        <TextField
          label="Thumbnail URL"
          name="thumbnail_url"
          value={form.thumbnail_url}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />

        <Box className={styles.buttonGroup}>
          <div className={styles.leftButtons}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={isLoading}
              className={styles.button}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>

            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              disabled={isLoading}
              className={`${styles.button} ${styles.deleteButton}`}
              startIcon={<DeleteIcon />}
            >
              {isLoading ? 'Deleting...' : 'Delete Course'}
            </Button>
          </div>

          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={isLoading}
            className={`${styles.button} ${styles.cancelButton}`}
          >
            Cancel
          </Button>
        </Box>
      </form>
    </Paper>
  );
}
