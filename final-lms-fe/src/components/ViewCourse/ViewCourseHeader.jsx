import React from "react";
import styles from "./ViewCourse.module.css";

const fallbackImage = "https://img.freepik.com/free-vector/gradient-coding-illustration_23-2149374998.jpg";

const ViewCourseHeader = ({ course }) => {
  if (!course) return null;

  const courseImg = course.image || course.thumbnail_url || fallbackImage;

  return (
    <>
      {/* Header */}
      <div className={styles.courseHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.courseTitle}>{course.title}</h1>
          <div className={styles.courseMeta}></div>
        </div>
      </div>

      {/* Course Image and Description Section */}
      <div className={styles.section}>
        <div className={styles.courseDescriptionContainer}>
          <img
            src={courseImg}
            alt="Course"
            className={styles.courseImage}
          />
          <h2 className={styles.descriptionTitle}>Course Description</h2>
          <p className={styles.courseDescription}>
            {course.description}
          </p>
        </div>
      </div>
    </>
  );
};

export default ViewCourseHeader;
