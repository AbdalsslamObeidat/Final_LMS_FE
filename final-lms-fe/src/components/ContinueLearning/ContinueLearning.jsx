import React, { useState, useRef, useEffect } from 'react';
import styles from './ContinueLearning.module.css';

const CourseCard = ({
  course,
  onContinue = () => {},
  // Remove instructors and categories props
  // instructors = [],
  // categories = []
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const descRef = useRef(null);

  // Check if description overflows 2 lines
  useEffect(() => {
    const el = descRef.current;
    if (el) {
      setIsOverflowing(el.scrollHeight > el.clientHeight + 1);
    }
  }, [course.description]);

  // Color logic (optional, keep as before)
  const getColorClass = (color) => {
    if (typeof color === 'string') {
      if (color.includes('blue')) return 'blue';
      if (color.includes('purple')) return 'purple';
      if (color.includes('green')) return 'green';
    }
    return 'blue';
  };
  const colorClass = getColorClass(course.color || '');

  return (
    <div className={styles.courseCard}>
      <div className={`${styles.courseHeader} ${styles[colorClass]}`}>
        {course.thumbnail_url && (
          <img
            src={course.thumbnail_url}
            alt={course.title || 'Course Thumbnail'}
            className={styles.courseThumbnail}
          />
        )}
      </div>
      <div className={styles.courseContent}>
        <h4 className={styles.courseTitle}>{course.title || 'Untitled Course'}</h4>
        <div className={styles.courseDescription}>
          <span
            ref={descRef}
            className={!expanded ? styles.truncateDescription : undefined}
          >
            {course.description || 'No description available.'}
          </span>
          {isOverflowing && (
            <button
              className={styles.showMoreBtn}
              onClick={() => setExpanded((prev) => !prev)}
              type="button"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
        {/* Remove instructor and category display */}
        {/* <p className={styles.courseInstructor}><strong>Instructor:</strong> {instructorName}</p>
        <p className={styles.courseCategory}><strong>Category:</strong> {categoryName}</p> */}
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span className={styles.progressText}>
              {typeof course.progress === 'number' ? course.progress : 0}% Complete
            </span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={`${styles.progressFill} ${styles[colorClass]}`}
              style={{ width: `${typeof course.progress === 'number' ? course.progress : 0}%` }}
            ></div>
          </div>
        </div>
        <button 
          onClick={() => onContinue(course)}
          className={`${styles.continueButton} ${styles[colorClass]}`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

const ContinueLearning = ({
  title = 'Continue Learning',
  courses = [],
  // Remove instructors and categories props
  // instructors = [],
  // categories = [],
  onContinueCourse = () => {},
  className = ''
}) => {
  const safeCourses = Array.isArray(courses) ? courses : [];

  return (
    <div className={`${styles.container} ${className}`}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.coursesGrid}>
        {safeCourses.length === 0 ? (
          <div className={styles.noCourses}>No courses to display.</div>
        ) : (
          safeCourses.map((course) => (
            <CourseCard 
              key={course.id || course._id || course.title}
              course={course}
              // Remove instructors and categories props
              // instructors={instructors}
              // categories={categories}
              onContinue={onContinueCourse}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ContinueLearning;