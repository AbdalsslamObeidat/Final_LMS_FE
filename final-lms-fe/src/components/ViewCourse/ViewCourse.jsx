import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./ViewCourse.module.css";
import CheckIcon from "@mui/icons-material/Check";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { fetchModulesByCourse } from '../../api/modules';
import { fetchLessonsByModule } from '../../api/lessons';

const fallbackImage = "https://img.freepik.com/free-vector/gradient-coding-illustration_23-2149374998.jpg";

const ViewCourse = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [modulesError, setModulesError] = useState(null);
  const [lessonsMap, setLessonsMap] = useState({}); // { moduleId: [lessons] }
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonsError, setLessonsError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Expanded state hooks moved to top-level
  const [expandedModule, setExpandedModule] = React.useState(0); // index of expanded module
  const [expandedLesson, setExpandedLesson] = React.useState({}); // { moduleId: lessonIdx }

  useEffect(() => {
    if (!id) {
      setError("No course ID provided.");
      setLoading(false);
      return;
    }
    setLoading(true);
    axios.get(`/api/courses/get/${id}`)
      .then(res => {
        if (res.data && res.data.success && res.data.course) {
          setCourse(res.data.course);
        } else {
          setError("Course not found.");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch course data.");
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setModulesLoading(true);
    fetchModulesByCourse(id)
      .then(mods => {
        setModules(Array.isArray(mods) ? mods : []);
        setModulesLoading(false);
        // Fetch lessons for each module
        setLessonsLoading(true);
        Promise.all(
          (Array.isArray(mods) ? mods : []).map(mod =>
            fetchLessonsByModule(mod.id).then(lessons => ({ moduleId: mod.id, lessons })).catch(() => ({ moduleId: mod.id, lessons: [] }))
          )
        ).then(results => {
          const map = {};
          results.forEach(({ moduleId, lessons }) => {
            map[moduleId] = lessons;
          });
          setLessonsMap(map);
          setLessonsLoading(false);
        }).catch(() => {
          setLessonsError("Failed to fetch lessons for modules.");
          setLessonsLoading(false);
        });
      })
      .catch(() => {
        setModulesError("Failed to fetch modules.");
        setModulesLoading(false);
      });
  }, [id]);

  if (loading) return <div className={styles.container}><div>Loading...</div></div>;
  if (error) return <div className={styles.container}><div style={{color: 'red'}}>{error}</div></div>;
  if (!course) return null;

  const instructor = course.instructor?.name || "N/A";
  const lastUpdated = course.updatedAt
    ? new Date(course.updatedAt).toLocaleDateString()
    : "N/A";
  const courseImg = course.image || course.thumbnail_url || fallbackImage;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.courseHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.courseTitle}>{course.title}</h1>
          <div className={styles.courseMeta}>
            <div className={styles.metaItem}>
              <span role="img" aria-label="Instructor">
                👤
              </span>{" "}
              Instructor: {instructor}
            </div>
            <div className={styles.metaItem}>
              <span role="img" aria-label="Clock">
                🕒
              </span>{" "}
              Last updated: {lastUpdated}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className={styles.courseContent}>
        {/* Main Content */}
        <div className={styles.mainContent}>
          {/* Tabs */}
          {/* Course Image and Description */}
          <div className={styles.section}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
              <img
                src={courseImg}
                alt="Course"
                style={{ width: "320px", borderRadius: "12px", background: "#0f172a", marginBottom: 18 }}
              />
              <h2 style={{ color: "#fff", marginBottom: 8 }}>Course Description</h2>
              <p style={{ maxWidth: 700, color: '#e2e8f0', textAlign: 'center', fontSize: 18 }}>{course.description}</p>
            </div>
          </div>

          {/* Course Content (Modules & Lessons) */}
<div className={styles.section}>
  <h2 style={{ color: "#fff" }}>Course Content</h2>
  {modulesLoading && <div style={{ color: '#94a3b8' }}>Loading modules...</div>}
  {modulesError && <div style={{ color: 'red' }}>{modulesError}</div>}
  {!modulesLoading && modules.length === 0 && (
    <div style={{ background: "#1e293b", padding: "1rem 1.5rem" }}>
      No modules available.
    </div>
  )}
  {/* State for expanded modules and lessons */}
  {!modulesLoading && modules.length > 0 && modules.map((module, idx) => (
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
        sx={{ fontWeight: 600, padding: "0 1.5rem", minHeight: 56 }}
      >
        <div>
          <div style={{
            background: 'linear-gradient(90deg, #60a5fa, #38d39f 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            fontSize: 20,
            display: 'inline-block'
          }}>{idx + 1}. {module.title}</div>
          {module.description && (
            <div style={{ color: '#94a3b8', fontWeight: 400, fontSize: 15, marginTop: 6 }}>{module.description}</div>
          )}
        </div>
      </AccordionSummary>
      <AccordionDetails sx={{ background: "#0f172a", padding: "0 2rem 1rem" }}>
        {lessonsLoading ? (
          <div style={{ color: '#94a3b8' }}>Loading lessons...</div>
        ) : lessonsError ? (
          <div style={{ color: 'red' }}>{lessonsError}</div>
        ) : lessonsMap[module.id] && lessonsMap[module.id].length > 0 ? (
          lessonsMap[module.id].map((lesson, lidx) => (
            <div key={lesson.id || lidx}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#60a5fa",
                  margin: "0.5rem 0",
                  padding: "8px 0",
                  borderBottom: lidx !== lessonsMap[module.id].length - 1 ? "1px solid #334155" : undefined,
                  cursor: "pointer"
                }}
                onClick={() => setExpandedLesson(expandedLesson[module.id] === lidx ? { ...expandedLesson, [module.id]: -1 } : { ...expandedLesson, [module.id]: lidx })}
              >
                <span style={{ marginRight: 12, fontSize: 18 }}>
                  {lesson.content_type === "video" && "🎬"}
                  {lesson.content_type === "text" && "📄"}
                  {lesson.content_type === "project" && "🛠️"}
                </span>
                <span style={{ flex: 1 }}>{lesson.title}</span>
                <span style={{ marginLeft: 16, color: "#94a3b8", fontSize: 14 }}>
                  {lesson.duration ? lesson.duration + ' min' : ''}
                </span>
              </div>
              {/* Lesson content shown only if lesson is expanded */}
              {expandedLesson[module.id] === lidx && (
                <div style={{ background: '#172136', color: '#e0e7ef', padding: '1rem 2rem', borderRadius: 6, margin: '8px 0 16px 0' }}>
                  {lesson.content_type === 'text' && lesson.content_text && (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{lesson.content_text}</div>
                  )}
                  {lesson.content_type === 'video' && lesson.content_url && (
                    <div>
                      <video width="100%" controls>
                        <source src={lesson.content_url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                  {lesson.content_type === 'project' && lesson.content_text && (
                    <div style={{ fontStyle: 'italic' }}>{lesson.content_text}</div>
                  )}
                  {/* Fallback for other types */}
                  {!lesson.content_text && !lesson.content_url && (
                    <div style={{ color: '#94a3b8' }}>No lesson content available.</div>
                  )}
                </div>
              )}
              {/* Toggle lesson content visibility on click */}
              {/* The above block already achieves this: clicking toggles expandedLesson[module.id] === lidx */}
            </div>
          ))
        ) : (
          <div style={{ color: "#94a3b8" }}>No lessons in this module.</div>
        )}
      </AccordionDetails>
    </Accordion>
  ))}


</div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div style={{ background: "#1e293b", borderRadius: 8, overflow: "hidden" }}>
   
        <div style={{ padding: "2rem" }}>
          <div style={{ color: "#cbd5e1", marginBottom: 12, fontWeight: 600 }}>
            Course Includes:
          </div>
          <ul style={{ color: "#38d39f", paddingLeft: 20, margin: 0, listStyle: "none" }}>
            <li style={{ marginBottom: 8 }}>
              <CheckIcon fontSize="small" style={{ verticalAlign: "middle" }} />
              {" "}On-demand video lectures
            </li>
            <li style={{ marginBottom: 8 }}>
              <CheckIcon fontSize="small" style={{ verticalAlign: "middle" }} />
              {" "}Downloadable resources
            </li>
            <li style={{ marginBottom: 8 }}>
              <CheckIcon fontSize="small" style={{ verticalAlign: "middle" }} />
              {" "}Full lifetime access
            </li>
            <li style={{ marginBottom: 8 }}>
              <CheckIcon fontSize="small" style={{ verticalAlign: "middle" }} />
              {" "}Certificate of completion
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  );
}

export default ViewCourse;
