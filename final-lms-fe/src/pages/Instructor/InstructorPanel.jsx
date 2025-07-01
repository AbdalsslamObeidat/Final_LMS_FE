import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateCourse from '../../components/CreateCourse/CreateCourse';
import EditCourse from '../../components/EditCourse/EditCourse';
import CoursesViewer from '../../components/CoursesViwer/CoursesViewer';
import CourseConfig from '../../components/CourseConfig/CourseConfig';
import Sidebar from '../../components/Sidebar/Sidebar';
import InstructorDashboard from '../../components/InstructorDashboard/InstructorDashboard';
import { useAuth } from '../../utils/AuthContext';
import {
  BookOpen,
  GraduationCap,
  BarChart2,
  FileText,
  LogOut,
  CheckCircle,
} from 'lucide-react';
import Header from '../../components/Header/Header';
import styles from './InstructorPanel.module.css';

export default function InstructorPanel() {
  const [editingCourse, setEditingCourse] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [configCourse, setConfigCourse] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [userData, setUserData] = useState({});
  const [dashboardStats, setDashboardStats] = useState({
    activeCourses: 0,
    totalStudents: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const coursesViewerRef = useRef();
  const [activeSidebar, setActiveSidebar] = useState('Dashboard');
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const fetchInstructorData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      // Set user data
      setUserData({
        name: user.name || 'Instructor',
        email: user.email,
      });
      
      // Fetch instructor's courses
      const { data: coursesData } = await axios.get(
        `/api/courses/getall?instructor_id=${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!coursesData?.success || !Array.isArray(coursesData.courses)) {
        console.error('Invalid courses data received:', coursesData);
        return;
      }

      const instructorCourses = coursesData.courses.filter(course => 
        course?.instructor_id === user.id
      );

      // Count unique students across all courses
      const uniqueStudents = new Set();
      let totalEnrollments = 0;

      // Process enrollments for each course
      for (const course of instructorCourses) {
        try {
          const { data: enrollmentsData } = await axios.get(
            `/api/enrollments/course/${course.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const enrollments = enrollmentsData?.success && Array.isArray(enrollmentsData.enrollments)
            ? enrollmentsData.enrollments
            : [];

          enrollments.forEach(enrollment => {
            if (enrollment?.student_id) {
              uniqueStudents.add(enrollment.student_id.toString());
            }
          });

          totalEnrollments += enrollments.length;
        } catch (error) {
          console.error(`Error fetching enrollments for course ${course.id}:`, error.message);
        }
      }
      
      setDashboardStats({
        activeCourses: instructorCourses.length,
        totalStudents: uniqueStudents.size
      });
    } catch (error) {
      console.error('Error in fetchInstructorData:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInstructorData();
  }, [fetchInstructorData]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      navigate('/login');
    }
  };

  const instructorMenu = [
    { name: 'Dashboard', icon: BarChart2 },
    { 
      name: 'My Courses', 
      icon: BookOpen,
      submenu: [{ name: 'Create Course', icon: BookOpen }],
    },
    { name: 'Submitted Assignments', icon: FileText },
    { name: 'Submitted Quizzes', icon: GraduationCap },
  ];

  const handleSidebarClick = (itemName) => {
    setActiveSidebar(itemName);
  };

  const handleCreate = () => {
    setShowCreateForm(true);
    setEditingCourse(null);
    setActiveSidebar('My Courses');
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/courses/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (coursesViewerRef.current?.reloadCourses) {
          coursesViewerRef.current.reloadCourses();
        }
        alert('Course deleted successfully');
      } catch (error) {
        alert('Failed to delete course. Please try again.');
      }
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      Object.keys(data).forEach((key) => {
        if (key === 'thumbnail' && data.thumbnail) {
          formData.append('thumbnail', data.thumbnail);
        } else if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });

      if (editingCourse) {
        await axios.put(`/api/courses/update/${editingCourse.id}`, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        await axios.post('/api/courses/create', formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
      }

      setEditingCourse(null);
      setShowCreateForm(false);
      setActiveSidebar('My Courses');
      if (coursesViewerRef.current?.reloadCourses) {
        coursesViewerRef.current.reloadCourses();
      }
      alert(`Course ${editingCourse ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      alert(`Failed to ${editingCourse ? 'update' : 'create'} course.`);
    }
  };

  const handleCancel = () => {
    setEditingCourse(null);
    setShowCreateForm(false);
  };

  const handleConfigure = (course) => {
    setConfigCourse(course);
    setShowConfig(true);
  };

  const handleConfigClose = () => {
    setShowConfig(false);
    setConfigCourse(null);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        menuItems={instructorMenu}
        subtitle="Instructor Panel"
        activeItem={activeSidebar}
        onItemClick={handleSidebarClick}
        onLogout={handleLogout}
        logoutIcon={LogOut}
      />
      <Container maxWidth="lg" sx={{ mt: 4, flex: 1 }}>
        {activeSidebar === 'My Courses' && (
          <>
            <Header
              userName={userData?.name || 'Instructor'}
              subtitle="Manage your courses and track student progress"
            />
            {showCreateForm ? (
              <CreateCourse
                onSubmit={handleFormSubmit}
                onCancel={handleCancel}
                initialData={null}
              />
            ) : editingCourse ? (
              <EditCourse
                course={editingCourse}
                onSubmit={handleFormSubmit}
                onCancel={handleCancel}
                onDelete={handleDelete}
              />
            ) : (
              <CoursesViewer 
                ref={coursesViewerRef} 
                onEdit={handleEdit}
                onConfigure={handleConfigure} 
              />
            )}
            <CourseConfig open={showConfig} onClose={handleConfigClose} course={configCourse} />
          </>
        )}

        {activeSidebar === 'Create Course' && (
          <Box>
            <Header
              userName={userData?.name || 'Instructor'}
              subtitle="Create a new course"
            />
            <CreateCourse
              onSubmit={(data) => {
                handleFormSubmit(data);
                setActiveSidebar('My Courses');
              }}
              onCancel={() => setActiveSidebar('My Courses')}
              initialData={null}
            />
          </Box>
        )}

        {activeSidebar === 'Dashboard' && (
          <InstructorDashboard stats={dashboardStats} loading={isLoading} />
        )}

        {activeSidebar === 'Submitted Assignments' && (
          <Paper className={styles.sectionCard}>
            <Box className={styles.sectionTitle}>
              <FileText size={24} className={styles.iconTitle} />
              <Typography variant="h5">Submitted Assignments</Typography>
            </Box>
            <Box className={styles.emptyState}>
              <CheckCircle size={48} className={styles.emptyIcon} />
              <Typography variant="h6">No assignments to review</Typography>
              <Typography variant="body2">
                Student submissions will appear here once they submit their work.
              </Typography>
            </Box>
          </Paper>
        )}

        {activeSidebar === 'Submitted Quizzes' && (
          <Paper className={styles.sectionCard}>
            <Box className={styles.sectionTitle}>
              <GraduationCap size={24} className={styles.iconTitle} />
              <Typography variant="h5">Submitted Quizzes</Typography>
            </Box>
            <Box className={styles.emptyState}>
              <CheckCircle size={48} className={styles.emptyIcon} />
              <Typography variant="h6">No quiz attempts to review</Typography>
              <Typography variant="body2">
                Student quiz attempts will appear here once they complete a quiz.
              </Typography>
            </Box>
          </Paper>
        )}
      </Container>
    </div>
  );
}
