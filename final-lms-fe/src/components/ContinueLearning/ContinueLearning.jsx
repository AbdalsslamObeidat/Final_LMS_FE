import React from 'react';
import styles from './ContinueLearning.module.css';

const CourseCard = ({
  course,
  onContinue = () => {}
}) => {
  const getColorClass = (color) => {
    if (color.includes('blue')) return 'blue';
    if (color.includes('purple')) return 'purple';
    if (color.includes('green')) return 'green';
    return 'blue';
  };

  const colorClass = getColorClass(course.color);

  return (
    <div className={styles.courseCard}>
      <div className={`${styles.courseHeader} ${styles[colorClass]}`}></div>
      <div className={styles.courseContent}>
        <h4 className={styles.courseTitle}>{course.title}</h4>
        <p className={styles.courseInstructor}>{course.instructor}</p>
        
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span className={styles.progressText}>{course.progress}% Complete</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={`${styles.progressFill} ${styles[colorClass]}`}
              style={{ width: `${course.progress}%` }}
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
  courses = [
    {
      id: 1,
      title: 'React Development',
      instructor: 'Fatima Al-Zahra',
      progress: 75,
      color: 'from-blue-500 to-blue-600',
      progressColor: 'bg-blue-500'
    },
    {
      id: 2,
      title: 'JavaScript ES6+',
      instructor: 'Omar Hassan',
      progress: 45,
      color: 'from-purple-500 to-purple-600',
      progressColor: 'bg-purple-500'
    },
    {
      id: 3,
      title: 'UI/UX Design',
      instructor: 'Layla Mansour',
      progress: 90,
      color: 'from-green-500 to-green-600',
      progressColor: 'bg-green-500'
    }
  ],
  onContinueCourse = () => {},
  className = ''
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      <h3 className={styles.title}>{title}</h3>
      
      <div className={styles.coursesGrid}>
        {courses.map((course) => (
          <CourseCard 
            key={course.id}
            course={course}
            onContinue={onContinueCourse}
          />
        ))}
      </div>
    </div>
  );
};

export default ContinueLearning;