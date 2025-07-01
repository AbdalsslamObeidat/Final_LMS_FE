import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import styles from "./ViewCourse.module.css";

const ViewCoursePaper = ({
  modules,
  lessonsMap,
  lessonsLoading,
  lessonsError,
  expandedModule,
  setExpandedModule,
  expandedLesson,
  setExpandedLesson,
  checkedLessons,
  handleLessonCheck,
  handleLessonClick
}) => {
  if (modules.length === 0) {
    return <div className={styles.noModules}>No modules available.</div>;
  }

  return (
    <>
      {modules.map((module, idx) => (
        <Accordion
          key={module.id || idx}
          expanded={expandedModule === idx}
          onChange={() => setExpandedModule(expandedModule === idx ? -1 : idx)}
          sx={{
            background: "#1e293b",
            color: "#e2e8f0",
            borderBottom: idx !== modules.length - 1 ? "1px solid #334155" : undefined,
            boxShadow: "none",
            "&:before": { display: "none" },
            borderRadius: 0
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "#60a5fa" }} />}
            className={styles.accordionSummary}
          >
            <div>
              <div className={styles.moduleTitle}>
                {idx + 1}. {module.title}
              </div>
              {module.description && (
                <div className={styles.moduleDescription}>
                  {module.description}
                </div>
              )}
            </div>
          </AccordionSummary>

          <AccordionDetails className={styles.accordionDetails}>
            {lessonsLoading ? (
              <div className={styles.lessonsLoading}>Loading lessons...</div>
            ) : lessonsError ? (
              <div className={styles.lessonsError}>{lessonsError}</div>
            ) : lessonsMap[module.id] && lessonsMap[module.id].length > 0 ? (
              lessonsMap[module.id].map((lesson, lidx) => (
                <div key={lesson.id || lidx}>
                  <div
                    className={styles.lessonItem}
                    onClick={() => handleLessonClick && handleLessonClick(lesson, module.id)}
                  >
                    <label className={styles.lessonCheckboxLabel}>
                      <input
                        type="checkbox"
                        checked={checkedLessons.has(lesson.id)}
                        onChange={e => handleLessonCheck(lesson.id, e.target.checked)}
                        onClick={e => e.stopPropagation()}
                        className={styles.lessonCheckbox}
                      />
                      {checkedLessons.has(lesson.id) ? " Done" : " To Do"}
                    </label>

                    <span className={styles.lessonIcon}>
                      {lesson.content_type === "video" && "🎬"}
                      {lesson.content_type === "text" && "📄"}
                      {lesson.content_type === "project" && "🛠️"}
                    </span>

                    <span className={styles.lessonTitle}>{lesson.title}</span>

                    {lesson.content_type === "video" && lesson.duration > 0 && (
                      <span className={styles.lessonDuration}>
                        Video Duration: {lesson.duration} min
                      </span>
                    )}
                  </div>

                  {expandedLesson[module.id] === lidx && (
                    <div className={styles.lessonContent}>
                      {lesson.content_type === 'text' && lesson.content_text && (
                        <div className={styles.textContent}>
                          {lesson.content_text}
                        </div>
                      )}
                      {lesson.content_type === 'video' && lesson.content_url && (
                        <video width="100%" controls>
                          <source src={lesson.content_url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                      {lesson.content_type === 'project' && lesson.content_text && (
                        <div className={styles.projectContent}>
                          {lesson.content_text}
                        </div>
                      )}
                      {!lesson.content_text && !lesson.content_url && (
                        <div className={styles.noLessonContent}>
                          No lesson content available.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className={styles.noLessons}>No lessons in this module.</div>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};

export default ViewCoursePaper;
