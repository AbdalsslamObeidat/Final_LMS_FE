import React from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import { BookOpen, Users } from 'lucide-react';
import styles from './InstructorDashboard.module.css';

const InstructorDashboard = ({ stats, loading }) => {
  if (loading) {
    return (
      <Paper className={styles.dashboardCard}>
        <Box className={styles.loadingContainer}>
          <CircularProgress />
          <Typography>Loading dashboard data...</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper className={styles.dashboardCard}>
      <Box className={styles.dashboardTitle}>
        <Typography variant="h5">Instructor Dashboard</Typography>
      </Box>
      <Box className={styles.dashboardGrid}>
        <Paper className={styles.statCard}>
          <BookOpen size={32} className={styles.activeIcon} />
          <Typography variant="h6">Active Courses</Typography>
          <Typography variant="h4">{stats?.activeCourses || 0}</Typography>
        </Paper>
        <Paper className={styles.statCard}>
          <Users size={32} className={styles.studentIcon} />
          <Typography variant="h6">Total Students</Typography>
          <Typography variant="h4">{stats?.totalStudents || 0}</Typography>
        </Paper>
      </Box>
    </Paper>
  );
};

export default InstructorDashboard;
