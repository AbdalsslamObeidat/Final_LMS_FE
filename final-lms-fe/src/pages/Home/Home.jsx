import styles from './Home.module.css';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className={styles.container}>
      <h1>Welcome to LMS</h1>
      <Link to="/catalog"><Button variant="contained">Browse Courses</Button></Link>
    </div>
  );
}