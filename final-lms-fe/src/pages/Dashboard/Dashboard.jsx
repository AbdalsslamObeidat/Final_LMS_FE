import styles from './Dashboard.module.css';
import { Typography } from '@mui/material';

export default function Dashboard({ role }) {
  return (
    <div className={styles.container}>
      {role === 'admin' && <Typography variant="h5">Admin Dashboard</Typography>}
      {role === 'instructor' && <Typography variant="h5">Instructor Dashboard</Typography>}
      {role === 'student' && <Typography variant="h5">Student Dashboard</Typography>}
    </div>
  );
}