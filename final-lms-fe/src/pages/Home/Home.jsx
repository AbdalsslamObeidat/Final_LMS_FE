import styles from './Home.module.css';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className={styles.container}>
      <h1>Welcome to EdyMe</h1>
      <Link to="/register"><Button variant="contained">Register</Button></Link>
    </div>
  );
}