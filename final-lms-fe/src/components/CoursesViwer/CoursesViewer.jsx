import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Paper, Grid, Button, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { fetchCourses } from '../../api/authApi';
import { fetchCategories } from '../../api/categories';
import { useAuth } from '../../utils/AuthContext';
import styles from './CoursesViewer.module.css';
import clStyles from '../ContinueLearning/ContinueLearning.module.css';

/**
 * Component to fetch and display courses for the current instructor.
 * Handles loading, error, and reload logic.
 * Accepts onEdit and onDelete as props.
 */
const CoursesViewer = forwardRef(function CoursesViewer({ onEdit, onDelete, onConfigure }, ref) {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const descRefs = useRef({});
  const [overflowing, setOverflowing] = useState({});

  const loadCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, catRes] = await Promise.all([
        fetchCourses(),
        fetchCategories()
      ]);
      let cats = [];
      if (catRes.categories) cats = catRes.categories;
      else if (Array.isArray(catRes)) cats = catRes;
      setCategories(cats);
      if (res.success && user) {
        setCourses(res.courses.filter(c => String(c.instructor_id) === String(user.id)));
      } else {
        setCourses([]);
      }
    } catch (err) {
      setError(err);
      setCourses([]);
      setCategories([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) loadCourses();
  }, [user]);

  useEffect(() => {
    // Check overflow for each course description
    const newOverflowing = {};
    courses.forEach((course) => {
      const el = descRefs.current[course.id];
      if (el) {
        newOverflowing[course.id] = el.scrollHeight > el.clientHeight + 1;
      }
    });
    setOverflowing(newOverflowing);
  }, [courses, expanded]);

  useImperativeHandle(ref, () => ({
    reloadCourses: loadCourses
  }));

  if (loading) return (<div>Loading courses...</div>);
  if (error) return (<div>Error loading courses.</div>);

  return (
    <Paper sx={{
      backgroundColor: '#121212',
      '&.MuiPaper-root': {
        backgroundImage: 'none !important',
      }
    }}>
      <div className={clStyles.coursesGrid}>
        {courses.map((course) => {
          const isExpanded = expanded[course.id] || false;
          return (
            <div className={clStyles.courseCard} key={course.id}>
              <div className={`${clStyles.courseHeader} ${clStyles.blue}`}>
                {course.thumbnail_url && (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title || 'Course Thumbnail'}
                    className={clStyles.courseThumbnail}
                  />
                )}
              </div>
              <div className={clStyles.courseContent}>
                <h4 className={clStyles.courseTitle}>{course.title || 'Untitled Course'}</h4>
                <div className={clStyles.courseDescription}>
                  <span
                    ref={el => descRefs.current[course.id] = el}
                    className={!isExpanded ? clStyles.truncateDescription : undefined}
                  >
                    {course.description || 'No description available.'}
                  </span>
                  {overflowing[course.id] && (
                    <button
                      className={clStyles.showMoreBtn}
                      onClick={() => setExpanded(prev => ({ ...prev, [course.id]: !isExpanded }))}
                      type="button"
                    >
                      {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
                <div className={styles.categoryRow}>
                  <span><strong>Category:</strong> <span className={styles.categoryValue}>{(() => {
                    const cat = categories.find(cat => String(cat.id) === String(course.category_id) || String(cat._id) === String(course.category_id));
                    return cat ? cat.name : 'N/A';
                  })()}</span></span>
                  <span style={{ marginLeft: '1.2rem' }}><strong>Created:</strong> <span className={styles.dateValue}>{course.created_at ? new Date(course.created_at).toLocaleDateString('en-GB') : 'N/A'}</span></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    onClick={() => onConfigure(course)}
                    style={{ minWidth: 0, padding: '6px 12px', borderRadius: 8 }}
                  >
                    Configure
                  </Button>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => onEdit(course)}
                      style={{ minWidth: 0, padding: '6px 12px', borderRadius: 8 }}
                    >
                      <EditIcon />
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => onDelete(course.id)}
                      style={{ minWidth: 0, padding: '6px 12px', borderRadius: 8 }}
                    >
                      <DeleteIcon />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Paper>
  );
});

export default CoursesViewer;
