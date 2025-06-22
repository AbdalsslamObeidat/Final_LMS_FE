// Header.jsx
import React, { useState } from 'react';
import { Search, Bell, User } from 'lucide-react';
import styles from './Header.module.css';

const Header = ({ userName, onSearch, onProfileClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className={styles.header}>
      <div className={styles.welcomeSection}>
        <h1 className={styles.title}>Welcome back, {userName}!</h1>
        <p className={styles.subtitle}>Ready to continue your learning journey?</p>
      </div>
      
      <div className={styles.actions}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>
    
        
        <button 
          onClick={onProfileClick}
          className={styles.profileButton}
        >
          <User size={20} />
        </button>
      </div>
    </div>
  );
};

export default Header;