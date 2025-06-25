import { useEffect, useState } from 'react';
import { fetchCourses } from '../../api/authApi';
import { useAuth } from '../../utils/AuthContext';

/**
 * Custom React hook to fetch and filter courses for the current instructor.
 * Returns { courses, loading, error, reload }
 */
export default function useInstructorCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCourses();
      if (res.success && user) {
        setCourses(res.courses.filter(c => String(c.instructor_id) === String(user.id)));
      } else {
        setCourses([]);
      }
    } catch (err) {
      setError(err);
      setCourses([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) loadCourses();
  }, [user]);

  return { courses, loading, error, reload: loadCourses };
}
