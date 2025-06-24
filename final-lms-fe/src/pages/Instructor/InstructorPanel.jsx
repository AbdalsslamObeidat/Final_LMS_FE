import React, { useState, useRef } from 'react';
import { Container, Button } from '@mui/material';
import CourseForm from '../../components/CourseForm/CourseForm';
import CoursesViewer from '../../components/CoursesViwer/CoursesViewer.jsx';
import styles from './InstructorPanel.module.css';

export default function InstructorPanel() {
  const [showForm, setShowForm] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const coursesViewerRef = useRef();

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

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Button variant="contained" onClick={handleCreate} sx={{ mb: 2 }}>Create Course</Button>
      {showForm && (
        <CourseForm
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          initialData={editCourse}
        />
      )}
      <CoursesViewer ref={coursesViewerRef} onEdit={handleEdit} onDelete={handleDelete} />
    </Container>
  );
}