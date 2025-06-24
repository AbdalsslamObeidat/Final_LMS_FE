import React, { useState, useEffect } from 'react';
import { Container, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import StatsCards from '../../components/StatsCards/StatsCards';
import ContinueLearning from '../../components/ContinueLearning/ContinueLearning';
import styles from './StudentPanel.module.css';
import { useAuth } from '../../utils/AuthContext';
import {
  BookOpen,
  GraduationCap,
  BarChart3,
  FileText,
  LogOut,
} from 'lucide-react';

const StudentPanel = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Student-specific sidebar menu
  const studentMenu = [
    { name: 'Dashboard', icon: BarChart3 },
    { name: 'All Courses', icon: BookOpen },
    { name: 'Assignments', icon: FileText },
    { name: 'Quizzes', icon: GraduationCap },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if the API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      navigate('/login');
    }
  };

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
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        menuItems={studentMenu}
        subtitle="Student Panel"
        activeItem={activeMenuItem}
        onItemClick={handleMenuItemClick}
        onLogout={handleLogout}
        logoutIcon={LogOut}
      />
      <Container maxWidth="lg" sx={{ mt: 4, flex: 1, px: 3 }}>
        {activeMenuItem === 'Dashboard' && (
          <>
            <Header
              userName={userData?.name || 'Student'}
              subtitle="Continue your learning journey"
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
          </>
        )}
        {activeMenuItem === 'My Courses' && (
          <div style={{ marginTop: 32 }}>
            <h2>Courses</h2>
            <p>Your enrolled courses will be displayed here.</p>
          </div>
        )}
        {activeMenuItem === 'Assignments' && (
          <div style={{ marginTop: 32 }}>
            <h2>Assignments</h2>
            <p>Your assignments will be displayed here.</p>
          </div>
        )}
        {activeMenuItem === 'Quizzes' && (
          <div style={{ marginTop: 32 }}>
            <h2>Quizzes</h2>
            <p>Your quizzes will be displayed here.</p>
          </div>
        )}
      </Container>
    </div>
  );
};

export default StudentPanel;