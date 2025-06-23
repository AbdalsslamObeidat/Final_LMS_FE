import React from 'react';
import styles from './ContinueLearning.module.css';

const CourseCard = ({
  course,
  onContinue = () => {},
  instructors = [],
  categories = []
}) => {
  // Safely handle color property
  const getColorClass = (color) => {
    if (typeof color === 'string') {
      if (color.includes('blue')) return 'blue';
      if (color.includes('purple')) return 'purple';
      if (color.includes('green')) return 'green';
    }
    return 'blue'; // default
  };

  const colorClass = getColorClass(course.color || '');

  // Find instructor name by id (support id or _id)
  const instructorObj = instructors.find(
    (inst) =>
      String(inst.id ?? inst._id) === String(course.instructor_id ?? course.instructor?._id ?? course.instructor?.id)
  );
  const instructorName = instructorObj ? instructorObj.name : 'Unknown Instructor';

  // Find category name by id
  const categoryObj = categories.find(
    (cat) => String(cat.id) === String(course.category_id)
  );
  const categoryName = categoryObj ? categoryObj.name : 'Unknown Category';

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
        <p className={styles.courseDescription}>{course.description || 'No description available.'}</p>
        <p className={styles.courseInstructor}><strong>Instructor:</strong> {instructorName}</p>
        <p className={styles.courseCategory}><strong>Category:</strong> {categoryName}</p>
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
  instructors = [],
  categories = [],
  onContinueCourse = () => {},
  className = ''
}) => {
  // Defensive: always use an array
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
              instructors={instructors}
              categories={categories}
              onContinue={onContinueCourse}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ContinueLearning;