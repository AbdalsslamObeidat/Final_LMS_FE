// Header.jsx
import React from 'react';
import styles from './Header.module.css';

const Header = ({ userName, subtitle = 'Ready to continue your journey?' }) => {
  return (
    <div className={styles.header}>
      <div className={styles.welcomeSection}>
        <h1 className={styles.title}>Welcome back, {userName}!</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </div>
  );
};

export default Header;