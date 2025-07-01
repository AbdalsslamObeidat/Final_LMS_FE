import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./ViewCourse.module.css";
import ViewCourseHeader from './ViewCourseHeader';
import ViewCoursePaper from './ViewCoursePaper';
import { fetchModulesByCourse } from '../../api/modules';
import { fetchLessonsByModule } from '../../api/lessons';

const ViewCourse = () => {
  const { id } = useParams();

  // ─── State ─────────────────────────
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [courseId, setCourseId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modules, setModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [modulesError, setModulesError] = useState(null);

  const [lessonsMap, setLessonsMap] = useState({});
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonsError, setLessonsError] = useState(null);

  const [checkedLessons, setCheckedLessons] = useState(new Set());
  const [saveStatus, setSaveStatus] = useState('');

  const [expandedModule, setExpandedModule] = useState(0);
  const [expandedLesson, setExpandedLesson] = useState({});

  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isLessonPanelOpen, setIsLessonPanelOpen] = useState(false);

  const [refreshEnrollment, setRefreshEnrollment] = useState(true);

  // ─── Handlers ──────────────────────
  const handleLessonClick = (lesson, moduleId) => {
    const lessonIndex = lessonsMap[moduleId]?.findIndex(l => l.id === lesson.id);
    setExpandedLesson(prev => ({
      ...prev,
      [moduleId]: prev[moduleId] === lessonIndex ? -1 : lessonIndex
    }));
  };

  const handleLessonCheck = (lessonId, checked) => {
    setCheckedLessons(prev => {
      const newSet = new Set(prev);
      checked ? newSet.add(lessonId) : newSet.delete(lessonId);

      if (enrollment?.id) {
        const totalLessons = Object.values(lessonsMap).reduce((sum, arr) => sum + (arr?.length || 0), 0);
        const newProgress = totalLessons > 0 ? Math.round((newSet.size / totalLessons) * 100) : 0;

        if (newProgress !== enrollment.progress) {
          axios.patch(`/api/enrollments/progress/${enrollment.id}`, { progress: newProgress })
            .then(() => {
              setSaveStatus('Saved!');
              setTimeout(() => setSaveStatus(''), 1200);
              setRefreshEnrollment(true);
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

  // ─── Fetch Enrollment ──────────────
  useEffect(() => {
    let isMounted = true;
    if (!id || !refreshEnrollment) return;

    setLoading(true);
    axios.get(`/api/enrollments/get/${id}`)
      .then(async res => {
        if (res.data?.success && res.data.enrollment) {
          if (!isMounted) return;
          setEnrollment(res.data.enrollment);
          setCourseId(res.data.enrollment.course_id);
        } else {
          try {
            const token = localStorage.getItem("token");
            const me = await axios.get("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
            const userId = me.data?.user?.id;

            if (userId) {
              const enrollmentsRes = await axios.get(`/api/enrollments/user/${userId}`);
              const enrollments = Array.isArray(enrollmentsRes.data)
                ? enrollmentsRes.data
                : enrollmentsRes.data.enrollments || [];

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
        setRefreshEnrollment(false);
      })
      .catch(() => {
        setEnrollment(null);
        setCourseId(id);
        setLoading(false);
        setRefreshEnrollment(false);
      });

    return () => { isMounted = false; };
  }, [id, refreshEnrollment]);

  // ─── Fetch Course, Modules, Lessons ──
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

        return Promise.all(
          mods.map(mod =>
            fetchLessonsByModule(mod.id)
              .then(lessons => ({ moduleId: mod.id, lessons }))
              .catch(() => ({ moduleId: mod.id, lessons: [] }))
          )
        );
      })
      .then(results => {
        const map = {};
        results.forEach(({ moduleId, lessons }) => {
          map[moduleId] = lessons;
        });
        setLessonsMap(map);
        setLessonsLoading(false);
      })
      .catch(() => {
        setModulesError("Failed to fetch modules.");
        setLessonsLoading(false);
      });
  }, [courseId]);

  // ─── Sync Checked Lessons ────────────
  useEffect(() => {
    if (!enrollment?.progress || !Object.keys(lessonsMap).length) return;

    const allLessonIds = Object.values(lessonsMap).flat().map(l => l.id);
    const numToCheck = Math.round((enrollment.progress / 100) * allLessonIds.length);
    setCheckedLessons(new Set(allLessonIds.slice(0, numToCheck)));
  }, [enrollment, lessonsMap]);

  // ─── Calculated Progress ─────────────
  const totalLessons = Object.values(lessonsMap).reduce((sum, arr) => sum + (arr?.length || 0), 0);
  const percentComplete = totalLessons > 0
    ? Math.round((checkedLessons.size / totalLessons) * 100)
    : 0;

  // ─── Render ─────────────────────────
  if (loading) return <div className={styles.container}><div className={styles.loading}>Loading...</div></div>;
  if (error) return <div className={styles.container}><div className={styles.error}>{error}</div></div>;
  if (!course) return null;

  return (
    <div className={styles.container}>
      {/* Lesson Side Panel */}
      {isLessonPanelOpen && selectedLesson && (
        <div className={styles.lessonOverlay} onClick={() => setIsLessonPanelOpen(false)}>
          <div className={styles.lessonPanel} onClick={e => e.stopPropagation()}>
            <div className={styles.lessonHeader}>
              <h3>{selectedLesson.title || 'Lesson'}</h3>
              <button className={styles.closeButton} onClick={() => setIsLessonPanelOpen(false)}>&times;</button>
            </div>
            <div className={styles.lessonContent}>
              {selectedLesson.content ? (
                <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
              ) : (
                <div className={styles.noContent}>
                  <p>No content available for this lesson.</p>
                  {selectedLesson.video_url && (
                    <div className={styles.videoContainer}>
                      <video controls className={styles.video}>
                        <source src={selectedLesson.video_url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className={styles.lessonNavigation}>
              <button className={styles.navButton}>Previous</button>
              <div className={styles.progressContainer}>
                <div
                  className={styles.progressBar}
                  style={{ width: `${(checkedLessons.size / totalLessons) * 100}%` }}
                ></div>
              </div>
              <button className={styles.navButton}>Next</button>
            </div>
          </div>
        </div>
      )}

      {/* Course Header */}
      <ViewCourseHeader course={course} />

      {/* Main Content */}
      <div className={styles.courseContent}>
        <div className={styles.mainContent}>
          <div className={styles.section}>
            <h2 className={styles.courseContentTitle}>Course Content</h2>
            <div className={styles.progressText}>
              Progress: {percentComplete}%
              {saveStatus && (
                <span className={`${styles.saveStatus} ${saveStatus === 'Saved!' ? styles.saved : styles.errorStatus}`}>
                  {saveStatus}
                </span>
              )}
            </div>

            {modulesLoading && <div className={styles.modulesLoading}>Loading modules...</div>}
            {modulesError && <div className={styles.error}>{modulesError}</div>}

            {!modulesLoading && (
              <ViewCoursePaper
                modules={modules}
                lessonsMap={lessonsMap}
                lessonsLoading={lessonsLoading}
                lessonsError={lessonsError}
                expandedModule={expandedModule}
                setExpandedModule={setExpandedModule}
                expandedLesson={expandedLesson}
                setExpandedLesson={setExpandedLesson}
                checkedLessons={checkedLessons}
                handleLessonCheck={handleLessonCheck}
                handleLessonClick={handleLessonClick}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCourse;
