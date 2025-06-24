import React, { useState, useEffect } from 'react';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions, 
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../utils/AuthContext';
import styles from './AllCoursesViewer.module.css';

const AllCoursesViewer = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState({});
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/courses/getall');
        setCourses(response.data.courses || []);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleViewCourse = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const handleEnroll = async (courseId) => {
    if (!user) {
      setSnackbar({
        open: true,
        message: 'Please log in to enroll in courses',
        severity: 'error'
      });
      return;
    }

    setEnrolling(prev => ({ ...prev, [courseId]: true }));
    
    try {
      const response = await axios.post('/api/enrollments/create', {
        course_id: courseId,
        user_id: user.id
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Successfully enrolled in the course!',
          severity: 'success'
        });
        // Update the course to show enrolled status
        setCourses(prevCourses => 
          prevCourses.map(course => 
            course.id === courseId || course._id === courseId
              ? { ...course, isEnrolled: true }
              : course
          )
        );
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to enroll in the course',
        severity: 'error'
      });
    } finally {
      setEnrolling(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <div className={styles.container}>
        <Typography variant="h4" component="h2" gutterBottom>
          All Courses
        </Typography>
        
        {courses.length === 0 ? (
          <Typography>No courses available at the moment.</Typography>
        ) : (
          <Box className={styles.coursesGrid}>
            {courses.map((course) => (
              <Card key={course.id || course._id} className={styles.courseCard}>
                {course.thumbnail_url && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={course.thumbnail_url}
                    alt={course.title || 'Course thumbnail'}
                  />
                )}
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {course.title || 'Untitled Course'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className={styles.courseDescription}>
                    {course.description || 'No description available.'}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', padding: '8px 16px 16px' }}>
                  <Button 
                    size="small" 
                    color="primary"
                    variant="outlined"
                    onClick={() => handleViewCourse(course.id || course._id)}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(99, 102, 241, 0.08)'
                      }
                    }}
                  >
                    View Course
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={course.isEnrolled || enrolling[course.id || course._id]}
                    onClick={() => handleEnroll(course.id || course._id)}
                    sx={{
                      background: course.isEnrolled 
                        ? 'linear-gradient(90deg, #10b981 10%, #059669 90%)' 
                        : 'linear-gradient(90deg, #6366f1 10%, #a21caf 90%)',
                      '&:hover': {
                        background: course.isEnrolled 
                          ? 'linear-gradient(90deg, #059669 10%, #047857 90%)' 
                          : 'linear-gradient(90deg, #a21caf 10%, #7e22ce 90%)',
                      },
                      '&.Mui-disabled': {
                        background: '#4b5563',
                        color: '#9ca3af'
                      }
                    }}
                  >
                    {enrolling[course.id || course._id] ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : course.isEnrolled ? (
                      'Enrolled'
                    ) : (
                      'Enroll Now'
                    )}
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </div>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AllCoursesViewer;
