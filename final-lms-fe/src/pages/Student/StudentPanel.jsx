import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import StatsCards from "../../components/StatsCards/StatsCards";
import ContinueLearning from "../../components/ContinueLearning/ContinueLearning";
import styles from "./StudentPanel.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const StudentPanel = () => {
  const [activeMenuItem, setActiveMenuItem] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();

  const handleMenuItemClick = (item) => {
    setActiveMenuItem(item);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleProfileClick = () => {
    // Profile click logic
  };

  const handleContinueCourse = (course) => {
    // Continue course logic
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      navigate("/login");
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login");
    }
  };

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setUserData({});
          navigate("/login");
          return;
        }
        const res = await axios.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setUserData(res.data.user || {});
      } catch (error) {
        setUserData({});
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  // Fetch enrollments and courses after userData.id is set
useEffect(() => {
  const fetchEnrollmentsAndCourses = async () => {
    if (!userData.id) return;
    try {
      const token = localStorage.getItem("token");
      const [enrollmentsRes, coursesRes] = await Promise.all([
        axios.get(`/api/enrollments/user/${userData.id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }),
        axios.get("/api/courses/getall"),
      ]);
      // Handle enrollments as array or object
      const enrollmentsData = Array.isArray(enrollmentsRes.data)
        ? enrollmentsRes.data
        : enrollmentsRes.data.enrollments || [];
      setEnrollments(enrollmentsData);
      setCourses(coursesRes.data.courses || []);
    } catch (error) {
      setEnrollments([]);
      setCourses([]);
    }
  };
  fetchEnrollmentsAndCourses();
}, [userData.id]);

  const menuItems = ["Dashboard", "Courses", "Assignments", "Quizzes"];
console.log("Enrollments:", enrollments);
console.log("Courses:", courses);
  // Prepare courses array for ContinueLearning from enrollments and courses
  const coursesFromEnrollments = enrollments.map((enrollment) => {
  const course = courses.find(
    (c) => String(c.id) === String(enrollment.course_id) || String(c._id) === String(enrollment.course_id)
  ) || {};
  return {
    ...course,
    progress: enrollment.progress ?? 0,
  };
});

  const userStats = {
    enrolledCourses: enrollments.length,
    completedCourses: enrollments.filter((e) => e.progress === 100).length,
  };

 return (
  <div className={styles.container}>
    <aside className={styles.sidebar}>
      <Sidebar
        activeItem={activeMenuItem}
        onItemClick={handleMenuItemClick}
        onLogout={handleLogout}
        menuItems={menuItems}
      />
    </aside>

    <main className={styles.mainContent}>
      <Header
        userName={userData.name || "Student"}
        onSearch={handleSearch}
        onProfileClick={handleProfileClick}
        showNotifications={false}
      />

      <div className={styles.statsSection}>
        <StatsCards userData={userStats} />
      </div>

      <div className={styles.continueLearningSection}>
        <ContinueLearning
          courses={coursesFromEnrollments}
          onContinueCourse={handleContinueCourse}
        />
      </div>
    </main>
  </div>
);

};

export default StudentPanel;