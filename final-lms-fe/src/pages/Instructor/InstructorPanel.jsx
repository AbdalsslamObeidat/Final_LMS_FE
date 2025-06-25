import React, { useState, useRef } from 'react';
import { Container, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CourseForm from '../../components/CourseForm/CourseForm';
import CoursesViewer from '../../components/CoursesViwer/CoursesViewer.jsx';
import CourseConfig from '../../components/CourseConfig/CourseConfig';
import Sidebar from '../../components/Sidebar/Sidebar';
import styles from './InstructorPanel.module.css';
import { useAuth } from '../../utils/AuthContext';
import {
  BookOpen,
  GraduationCap,
  BarChart3,
  FileText,
  LogOut,
} from 'lucide-react';
import Header from '../../components/Header/Header';

export default function InstructorPanel() {
  const [showForm, setShowForm] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [configCourse, setConfigCourse] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [userData, setUserData] = useState({});
  const coursesViewerRef = useRef();
  const [activeSidebar, setActiveSidebar] = useState('My Courses');
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Set user data when component mounts
  React.useEffect(() => {
    if (user) {
      setUserData({
        name: user.name || 'Instructor',
        email: user.email
      });
    }
  }, [user]);

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

  // Instructor-specific sidebar menu
  const instructorMenu = [
    { name: 'Dashboard', icon: BarChart3 },
    { name: 'My Courses', icon: BookOpen },
    { name: 'Submitted Assignments', icon: FileText },
    { name: 'Submitted Quizzes', icon: GraduationCap },
  ];

  const handleSidebarClick = (item) => setActiveSidebar(item);

  const handleCreate = () => {
    setEditCourse(null);
    setShowForm(true);
  };
  const handleEdit = (course) => {
    setEditCourse(course);
    setShowForm(true);
  };
  const handleDelete = (id) => {
    if (coursesViewerRef.current && coursesViewerRef.current.reloadCourses) {
      coursesViewerRef.current.reloadCourses();
    }
  };
  const handleFormSubmit = async (data) => {
    setShowForm(false);
    setEditCourse(null);
    if (coursesViewerRef.current && coursesViewerRef.current.reloadCourses) {
      coursesViewerRef.current.reloadCourses();
    }
  };
  const handleCancel = () => {
    setShowForm(false);
    setEditCourse(null);
  };
  // New: handle configure
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
        onMenuItemClick={handleSidebarClick}
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
            <Button variant="contained" onClick={handleCreate} sx={{ mb: 2, mt: 2 }}>Create Course</Button>
            {showForm && (
              <CourseForm
                onSubmit={handleFormSubmit}
                onCancel={handleCancel}
                initialData={editCourse}
              />
            )}
            <CoursesViewer ref={coursesViewerRef} onEdit={handleEdit} onDelete={handleDelete} onConfigure={handleConfigure} />
            <CourseConfig open={showConfig} onClose={handleConfigClose} course={configCourse} />
          </>
        )}
        {activeSidebar === 'Dashboard' && (
          <div style={{ marginTop: 32 }}>
            <h2>Instructor Dashboard</h2>
            <p>Overview, stats, and analytics coming soon.</p>
          </div>
        )}
        {activeSidebar === 'Submitted Assignments' && (
          <div style={{ marginTop: 32 }}>
            <h2>Submitted Assignments</h2>
            <p>Assignment submissions management coming soon.</p>
          </div>
        )}
        {activeSidebar === 'Submitted Quizzes' && (
          <div style={{ marginTop: 32 }}>
            <h2>Submitted Quizzes</h2>
            <p>Quiz submissions management coming soon.</p>
          </div>
        )}
      </Container>
    </div>
  );
}