import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import StatsCards from "../../components/StatsCards/StatsCards";
import ContinueLearning from "../../components/ContinueLearning/ContinueLearning";
import RecentActivity from "../../components/RecentActivity/RecentActivity";
import styles from "./StudentPanel.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const StudentPanel = () => {
  const [activeMenuItem, setActiveMenuItem] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const handleMenuItemClick = (item) => {
    setActiveMenuItem(item);
    console.log("Navigate to:", item);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    console.log("Search query:", query);
  };

  const handleProfileClick = () => {
    console.log("Profile clicked");
  };

  const handleContinueCourse = (course) => {
    console.log("Continue course:", course);
  };

  const handleActivityClick = (activity) => {
    console.log("Activity clicked:", activity);
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login");
    }
  };

  const statsData = [
    { label: "Enrolled Courses", value: "12", color: "bg-blue-500" },
    { label: "Completed", value: "8", color: "bg-purple-500" },
    { label: "Hours Learned", value: "156", color: "bg-blue-500" },
  ];

  // Fetch courses, instructors, and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, usersRes, categoriesRes] = await Promise.all([
          axios.get("/api/courses/getall"),
          axios.get("/api/admin/users"),
          axios.get("/api/categories/getall"),
        ]);
        setCourses(coursesRes.data.courses || []);
        // Filter instructors by role
        const allUsers = usersRes.data.users || [];
        const instructorsOnly = allUsers.filter(
          (user) => user.role === "instructor"
        );
        setInstructors(instructorsOnly);
        setCategories(categoriesRes.data.categories || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setCourses([]);
        setInstructors([]);
        setCategories([]);
      }
    };
    fetchData();
  }, []);

  const activitiesData = [
    {
      id: 1,
      type: "quiz",
      title: "Quiz completed",
      subtitle: "React Fundamentals - Chapter 3",
      time: "2 hours ago",
      icon: "CheckCircle",
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      id: 2,
      type: "assignment",
      title: "Assignment submitted",
      subtitle: "JavaScript Project - Todo App",
      time: "1 day ago",
      icon: "FileText",
      color: "text-purple-500 bg-purple-500/10",
    },
    {
      id: 3,
      type: "enrollment",
      title: "New course enrolled",
      subtitle: "Python for Data Science",
      time: "3 days ago",
      icon: "BookOpen",
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      id: 4,
      type: "grade",
      title: "Grade received",
      subtitle: "UI Design Project - Grade: A",
      time: "1 week ago",
      icon: "GraduationCap",
      color: "text-purple-500 bg-purple-500/10",
    },
  ];

  const menuItems = ["Dashboard", "Courses", "Assignments", "Quizzes"];

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <Sidebar
          activeItem={activeMenuItem}
          onItemClick={handleMenuItemClick}
          onLogout={handleLogout}
          menuItems={menuItems}
        />
      </div>

      <div className={styles.mainContent} style={{ marginLeft: "16rem" }}>
        <Header
          userName="Ahmed"
          onSearch={handleSearch}
          onProfileClick={handleProfileClick}
          showNotifications={false}
        />

        <div className={styles.statsSection}>
          <StatsCards stats={statsData} />
        </div>

        <div className={styles.continueLearningSection}>
          <ContinueLearning
            courses={courses}
            instructors={instructors}
            categories={categories}
            onContinueCourse={handleContinueCourse}
          />
        </div>

        <div className={styles.bottomSection}>
          <RecentActivity
            activities={activitiesData}
            onActivityClick={handleActivityClick}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentPanel;