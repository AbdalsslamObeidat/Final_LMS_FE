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
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modules, setModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [modulesError, setModulesError] = useState(null);
  const [lessonsMap, setLessonsMap] = useState({}); // { moduleId: [lessons] }
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonsError, setLessonsError] = useState(null);
  // Expanded state hooks moved to top-level
  const [expandedModule, setExpandedModule] = React.useState(0); // index of expanded module
  const [expandedLesson, setExpandedLesson] = React.useState({}); // { moduleId: lessonIdx }

  // Track checked lessons by lesson ID
  const [checkedLessons, setCheckedLessons] = useState(new Set());

  // Calculate percent complete
  const totalLessons = Object.values(lessonsMap).reduce((sum, arr) => sum + (arr?.length || 0), 0);
  const percentComplete = totalLessons > 0 ? Math.round((checkedLessons.size / totalLessons) * 100) : 0;

  // Handle checkbox change
  const [saveStatus, setSaveStatus] = useState('');
  const handleLessonCheck = (lessonId, checked) => {
    setCheckedLessons(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(lessonId);
      } else {
        newSet.delete(lessonId);
      }
      // PATCH progress to backend ONLY if progress changed
      if (enrollment && enrollment.id) {
        const newPercent = totalLessons > 0 ? Math.round((newSet.size / totalLessons) * 100) : 0;
        if (newPercent !== enrollment.progress) {
          axios.patch(`/api/enrollments/progress/${enrollment.id}`, { progress: newPercent })
            .then(() => {
              setSaveStatus('Saved!');
              setTimeout(() => setSaveStatus(''), 1200);
              setRefreshEnrollment(true); // Only refresh enrollment after PATCH and only if progress changed
            })
            .catch(() => {
              setSaveStatus('Error saving progress');
              setTimeout(() => setSaveStatus(''), 2000);
            });
        }
      }
      return newSet;
    });
  };




  useEffect(() => {
    if (!id) {
      setError("No ID provided.");
      setLoading(false);
      return;
    }
    setLoading(true);
    // Try to fetch enrollment by ID first
    axios.get(`/api/enrollments/get/${id}`)
      .then(async res => {
        if (res.data && res.data.success && res.data.enrollment) {
          const enrollment = res.data.enrollment;
          setEnrollment(enrollment);
          // Restore checked lessons from progress (if available and lessonsMap is loaded)
          if (enrollment.progress && lessonsMap && Object.keys(lessonsMap).length > 0) {
            const allLessonIds = Object.values(lessonsMap).flat().map(l => l.id);
            const numToCheck = Math.round((enrollment.progress / 100) * allLessonIds.length);
            setCheckedLessons(new Set(allLessonIds.slice(0, numToCheck)));
          }
          // Fetch course by course_id from enrollment
          if (enrollment.course_id) {
            try {
              const courseRes = await axios.get(`/api/courses/get/${enrollment.course_id}`);
              setCourse(courseRes.data.course || courseRes.data);
            } catch {
              setError("Failed to fetch course data.");
            }
          }
        } else {
          // If not found as enrollment, treat as courseId and find enrollment by user+course
          try {
            const token = localStorage.getItem("token");
            const me = await axios.get("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
            const userId = me.data?.user?.id;
            if (userId) {
              const enrollmentsRes = await axios.get(`/api/enrollments/user/${userId}`);
              const enrollments = Array.isArray(enrollmentsRes.data) ? enrollmentsRes.data : enrollmentsRes.data.enrollments || [];
              const found = enrollments.find(e => String(e.course_id) === String(id));
              if (found) {
                setEnrollment(found);
                // Restore checked lessons from progress (if available and lessonsMap is loaded)
                if (found.progress && lessonsMap && Object.keys(lessonsMap).length > 0) {
                  const allLessonIds = Object.values(lessonsMap).flat().map(l => l.id);
                  const numToCheck = Math.round((found.progress / 100) * allLessonIds.length);
                  setCheckedLessons(new Set(allLessonIds.slice(0, numToCheck)));
                }
                // Fetch course by course_id from enrollment
                try {
                  const courseRes = await axios.get(`/api/courses/get/${found.course_id}`);
                  setCourse(courseRes.data.course || courseRes.data);
                } catch {
                  setError("Failed to fetch course data.");
                }
              } else {
                // Fallback: fetch course directly
                try {
                  const courseRes = await axios.get(`/api/courses/get/${id}`);
                  setCourse(courseRes.data.course || courseRes.data);
                } catch {
                  setError("Failed to fetch course data.");
                }
              }
            } else {
              setError("Not logged in");
            }
          } catch {
            setError("Failed to fetch enrollment data.");
          }
        }
        setLoading(false);
      })
      .catch(async err => {
        // If not found by enrollment ID, treat as courseId and find enrollment by user+course
        try {
          const token = localStorage.getItem("token");
          const me = await axios.get("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
          const userId = me.data?.user?.id;
          if (userId) {
            const enrollmentsRes = await axios.get(`/api/enrollments/user/${userId}`);
            const enrollments = Array.isArray(enrollmentsRes.data) ? enrollmentsRes.data : enrollmentsRes.data.enrollments || [];
            const found = enrollments.find(e => String(e.course_id) === String(id));
            if (found) {
              setEnrollment(found);
              // Restore checked lessons from progress (if available and lessonsMap is loaded)
              if (found.progress && lessonsMap && Object.keys(lessonsMap).length > 0) {
                const allLessonIds = Object.values(lessonsMap).flat().map(l => l.id);
                const numToCheck = Math.round((found.progress / 100) * allLessonIds.length);
                setCheckedLessons(new Set(allLessonIds.slice(0, numToCheck)));
              }
              // Fetch course by course_id from enrollment
              try {
                const courseRes = await axios.get(`/api/courses/get/${found.course_id}`);
                setCourse(courseRes.data.course || courseRes.data);
              } catch {
                setError("Failed to fetch course data.");
              }
            } else {
              // Fallback: fetch course directly
              try {
                const courseRes = await axios.get(`/api/courses/get/${id}`);
                setCourse(courseRes.data.course || courseRes.data);
              } catch {
                setError("Failed to fetch course data.");
              }
            }
          } else {
            setError("Not logged in");
          }
        } catch {
          setError("Failed to fetch enrollment data.");
        }
        setLoading(false);
      });
  }, [id, lessonsMap]);

  // Clean, stepwise data loading
  const [courseId, setCourseId] = useState(null);

  // Control when to refresh enrollment after PATCH
  const [refreshEnrollment, setRefreshEnrollment] = useState(true);

  // 1. Fetch enrollment and set courseId
  useEffect(() => {
    let isMounted = true;
    if (!id || !refreshEnrollment) return;
    setLoading(true);
    axios.get(`/api/enrollments/get/${id}`)
      .then(async res => {
        if (res.data && res.data.success && res.data.enrollment) {
          const enrollment = res.data.enrollment;
          if (!isMounted) return;
          setEnrollment(enrollment);
          setCourseId(enrollment.course_id);
        } else {
          // If not found as enrollment, treat as courseId and find enrollment by user+course
          try {
            const token = localStorage.getItem("token");
            const me = await axios.get("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
            const userId = me.data?.user?.id;
            if (userId) {
              const enrollmentsRes = await axios.get(`/api/enrollments/user/${userId}`);
              const enrollments = Array.isArray(enrollmentsRes.data) ? enrollmentsRes.data : enrollmentsRes.data.enrollments || [];
              const found = enrollments.find(e => String(e.course_id) === String(id));
              if (found) {
                if (!isMounted) return;
                setEnrollment(found);
                setCourseId(found.course_id);
              } else {
                setEnrollment(null);
                setCourseId(id);
              }
            } else {
              setError("Not logged in");
            }
          } catch {
            setError("Failed to fetch enrollment data.");
          }
        }
        setLoading(false);
        setRefreshEnrollment(false); // Only fetch once unless explicitly refreshed
      })
      .catch(() => {
        setEnrollment(null);
        setCourseId(id);
        setLoading(false);
        setRefreshEnrollment(false);
      });
    return () => { isMounted = false; };
  }, [id, refreshEnrollment]);


  // 2. Fetch course, modules, lessons when courseId changes
  useEffect(() => {
    if (!courseId) return;
    setModules([]);
    setLessonsMap({});
    setModulesLoading(true);
    setLessonsLoading(true);
    axios.get(`/api/courses/get/${courseId}`)
      .then(res => setCourse(res.data.course || res.data))
      .catch(() => setCourse(null));
    fetchModulesByCourse(courseId)
      .then(mods => {
        setModules(Array.isArray(mods) ? mods : []);
        setModulesLoading(false);
        // Fetch lessons for each module
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
  }, [courseId]);

  // 3. Only update checkedLessons from progress after lessons are loaded
  useEffect(() => {
    if (!enrollment || !enrollment.progress || !lessonsMap || Object.keys(lessonsMap).length === 0) return;
    const allLessonIds = Object.values(lessonsMap).flat().map(l => l.id);
    const numToCheck = Math.round((enrollment.progress / 100) * allLessonIds.length);
    setCheckedLessons(new Set(allLessonIds.slice(0, numToCheck)));
  }, [enrollment, lessonsMap]);

  if (loading) return <div className={styles.container}><div>Loading...</div></div>;
  if (error) return <div className={styles.container}><div style={{color: 'red'}}>{error}</div></div>;
  if (!course) return null;

  let instructor = course?.instructor_name || course?.instructor || (course?.instructor && course?.instructor.name) || '';
if (instructor && typeof instructor === 'object' && instructor.name) {
  instructor = instructor.name;
}
if (!instructor || instructor === '[object Object]') instructor = 'N/A';
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
<div style={{ color: '#38d39f', fontWeight: 600, marginBottom: 12 }}>
  Progress: {percentComplete}%
  {saveStatus && (
    <span style={{ marginLeft: 16, color: saveStatus === 'Saved!' ? '#38d39f' : 'orange', fontWeight: 400, fontSize: 15 }}>
      {saveStatus}
    </span>
  )}
</div>
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
              >
                <input
                  type="checkbox"
                  checked={checkedLessons.has(lesson.id)}
                  onChange={e => handleLessonCheck(lesson.id, e.target.checked)}
                  style={{ marginRight: 12 }}
                  onClick={e => e.stopPropagation()}
                />
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
