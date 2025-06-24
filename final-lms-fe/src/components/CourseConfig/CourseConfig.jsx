import React from 'react';
import styles from './CourseConfig.module.css';

export default function CourseConfig({ children }) {
  return (
    <div className={styles.configContainer}>
      {/* Add your course config UI here */}
      {children}
    </div>
  );
}
