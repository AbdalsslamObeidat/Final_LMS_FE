import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Paper, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { fetchCourses } from '../../api/authApi';
import { fetchCategories } from '../../api/categories';
import { useAuth } from '../../utils/AuthContext';
import styles from './CoursesViewer.module.css';
import clStyles from '../ContinueLearning/ContinueLearning.module.css';

const CoursesViewer = forwardRef(function CoursesViewer({ onEdit, onConfigure }, ref) {
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
      const cats = Array.isArray(catRes) ? catRes : catRes.categories || [];
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

  if (loading) return (<div className={styles.loading}>Loading courses...</div>);
  if (error) return (<div className={styles.error}>Error loading courses.</div>);

  return (
    <Paper className={styles.paper}>
      <div className={clStyles.coursesGrid}>
        {courses.map((course) => {
          const isExpanded = expanded[course.id] || false;
          return (
            <div className={`${clStyles.courseCard} ${styles.courseCard}`} key={course.id}>
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
                  <span className={styles.createdDate}>
                    <strong>Created:</strong> <span className={styles.dateValue}>
                      {course.created_at ? new Date(course.created_at).toLocaleDateString('en-GB') : 'N/A'}
                    </span>
                  </span>
                </div>

                <div className={styles.buttonRow}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    onClick={() => onConfigure(course)}
                    className={styles.configureButton}
                  >
                    Configure
                  </Button>

                  <div className={styles.actionButtons}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => onEdit(course)}
                      className={styles.editButton}
                    >
                      <EditIcon />
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
