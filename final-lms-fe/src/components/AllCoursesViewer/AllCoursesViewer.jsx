import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../utils/AuthContext";
import styles from "./AllCoursesViewer.module.css";

const AllCoursesViewer = () => {
  // State declarations
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState({});
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [showMoreVisible, setShowMoreVisible] = useState({});

  const descriptionRefs = useRef({});
  const navigate = useNavigate();
  const { user } = useAuth();

  // Function to check if text exceeds 2 lines
  const checkTextOverflow = (element) => {
    if (!element) return false;

    // Get computed styles
    const computedStyle = window.getComputedStyle(element);
    const lineHeight = parseFloat(computedStyle.lineHeight);

    // If lineHeight is "normal" or NaN, calculate it based on font size
    const fontSize = parseFloat(computedStyle.fontSize);
    const actualLineHeight = isNaN(lineHeight) ? fontSize * 1.2 : lineHeight;

    // Calculate height for 2 lines (with some tolerance)
    const twoLineHeight = actualLineHeight * 2;

    // Check if scroll height exceeds 2 lines
    return element.scrollHeight > twoLineHeight + 5; // +5px tolerance
  };

  // Detect if description overflows two lines for each course
  useEffect(() => {
    // Use setTimeout to ensure DOM has rendered
    const timeoutId = setTimeout(() => {
      const newShowMoreVisible = {};

      courses.forEach((course) => {
        const courseId = course.id || course._id;
        const element = descriptionRefs.current[courseId];

        if (element) {
          // Temporarily reset styles to measure natural height
          const originalStyles = {
            webkitLineClamp: element.style.webkitLineClamp,
            webkitBoxOrient: element.style.webkitBoxOrient,
            overflow: element.style.overflow,
            display: element.style.display,
          };

          // Reset to single line to get natural height
          element.style.webkitLineClamp = "unset";
          element.style.webkitBoxOrient = "unset";
          element.style.overflow = "visible";
          element.style.display = "block";

          const exceedsTwoLines = checkTextOverflow(element);
          newShowMoreVisible[courseId] = exceedsTwoLines;

          // Restore original styles if not expanded
          if (!expandedDescriptions[courseId]) {
            element.style.webkitLineClamp =
              originalStyles.webkitLineClamp || "";
            element.style.webkitBoxOrient =
              originalStyles.webkitBoxOrient || "";
            element.style.overflow = originalStyles.overflow || "";
            element.style.display = originalStyles.display || "";
          }
        }
      });

      setShowMoreVisible(newShowMoreVisible);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [courses, expandedDescriptions]);

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("/api/courses/getall");
        setCourses(response.data.courses || []);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses. Please try again later.");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Toggle expanded/collapsed state for a course description
  const handleToggleDescription = (courseId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  const handleViewCourse = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const handleEnroll = async (courseId) => {
    if (!user) {
      setSnackbar({
        open: true,
        message: "Please log in to enroll in courses",
        severity: "error",
      });
      return;
    }

    setEnrolling((prev) => ({ ...prev, [courseId]: true }));

    try {
      const response = await axios.post(
        "/api/enrollments/create",
        {
          course_id: courseId,
          user_id: user.id,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Successfully enrolled in the course!",
          severity: "success",
        });
        // Update the course to show enrolled status
        setCourses((prevCourses) =>
          prevCourses.map((course) =>
            course.id === courseId || course._id === courseId
              ? { ...course, isEnrolled: true }
              : course
          )
        );
      }
    } catch (err) {
      console.error("Enrollment error:", err);
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message || "Failed to enroll in the course",
        severity: "error",
      });
    } finally {
      setEnrolling((prev) => ({ ...prev, [courseId]: false }));
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <Typography variant="h4" component="h2" gutterBottom>
          All Courses
        </Typography>

        {courses.length === 0 ? (
          <Typography>No courses available at the moment.</Typography>
        ) : (
          <Box className={styles.coursesGrid}>
            {courses.map((course) => {
              const courseId = course.id || course._id;
              const isExpanded = expandedDescriptions[courseId];

              return (
                <Card key={courseId} className={styles.courseCard}>
                  {course.thumbnail_url && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={course.thumbnail_url}
                      alt={course.title || "Course thumbnail"}
                    />
                  )}
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {course.title || "Untitled Course"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      className={
                        isExpanded ? undefined : styles.courseDescription
                      }
                      style={
                        isExpanded
                          ? {
                              overflow: "visible",
                              display: "block",
                              WebkitLineClamp: "unset",
                              WebkitBoxOrient: "unset",
                            }
                          : {
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }
                      }
                      ref={(el) => {
                        if (el) {
                          descriptionRefs.current[courseId] = el;
                        }
                      }}
                    >
                      {course.description || "No description available."}
                    </Typography>
                    {showMoreVisible[courseId] && (
                      <Button
                        size="small"
                        color="secondary"
                        sx={{
                          marginLeft: 0,
                          marginTop: "4px",
                          textTransform: "none",
                          padding: "2px 4px",
                          minWidth: "auto",
                        }}
                        onClick={() => handleToggleDescription(courseId)}
                      >
                        {isExpanded ? "Show Less" : "Show More"}
                      </Button>
                    )}
                  </CardContent>
                  <CardActions
                    sx={{
                      justifyContent: "space-between",
                      padding: "8px 16px 16px",
                    }}
                  >
                    <Button
                      size="small"
                      variant="contained"
                      disabled={course.isEnrolled || enrolling[courseId]}
                      onClick={() => handleEnroll(courseId)}
                      sx={{
                        background: course.isEnrolled
                          ? "linear-gradient(90deg, #10b981 10%, #059669 90%)"
                          : "linear-gradient(90deg, #6366f1 10%, #a21caf 90%)",
                        "&:hover": {
                          background: course.isEnrolled
                            ? "linear-gradient(90deg, #059669 10%, #047857 90%)"
                            : "linear-gradient(90deg, #a21caf 10%, #7e22ce 90%)",
                        },
                        "&.Mui-disabled": {
                          background: "#4b5563",
                          color: "#9ca3af",
                        },
                      }}
                    >
                      {enrolling[courseId] ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : course.isEnrolled ? (
                        "Enrolled"
                      ) : (
                        "Enroll Now"
                      )}
                    </Button>
                  </CardActions>
                </Card>
              );
            })}
          </Box>
        )}
      </div>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AllCoursesViewer;
