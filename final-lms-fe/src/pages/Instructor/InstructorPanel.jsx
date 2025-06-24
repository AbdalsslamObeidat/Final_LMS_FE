import React, { useState } from 'react';
import { Container, Button } from '@mui/material';
import CourseForm from '../../components/CourseForm/CourseForm';
import CoursesViewer from '../../components/CoursesViwer/CoursesViewer.jsx';
import styles from './InstructorPanel.module.css';

export default function InstructorPanel() {
  const [showForm, setShowForm] = useState(false);
  const [editCourse, setEditCourse] = useState(null);

  const handleCreate = () => {
    setEditCourse(null);
    setShowForm(true);
  };
  const handleEdit = (course) => {
    setEditCourse(course);
    setShowForm(true);
  };
  const handleDelete = (id) => {
    // You may want to trigger a reload in CoursesViwer via a callback or context if needed
  };
  const handleFormSubmit = async (data) => {
    setShowForm(false);
    setEditCourse(null);
    // You may want to trigger a reload in CoursesViwer via a callback or context if needed
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
      <CoursesViewer onEdit={handleEdit} onDelete={handleDelete} />
    </Container>
  );
}