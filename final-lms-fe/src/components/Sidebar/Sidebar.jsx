// Sidebar.jsx
import React from 'react';
import {
  BookOpen,
  GraduationCap,
  BarChart3,
  FileText,
  LogOut,
} from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = ({ activeItem, onItemClick, onLogout }) => {
  const menuItems = [
    { name: 'Dashboard', icon: BarChart3 },
    { name: 'Courses', icon: BookOpen },
    { name: 'Assignments', icon: FileText },
    { name: 'Quizzes', icon: GraduationCap },
  ];

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className={styles.sidebar}>
      {/* Logo Section */}
      <div className={styles.logo}>
        <h2 className={styles.logoText}>EdyMe</h2>
        <p className={styles.logoSubtitle}>Student Panel</p>
      </div>

      {/* Menu Items */}
      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.name;

          const handleClick = () => {
            if (item.name === 'Dashboard') {
              window.location.href = '/studentPanel';
            } else {
              onItemClick(item.name);
            }
          };

          return (
            <button
              key={item.name}
              onClick={handleClick}
              className={`${styles.menuItem} ${
                isActive ? styles.menuItemActive : styles.menuItemInactive
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <button 
          className={styles.logoutButton}
          onClick={handleLogoutClick}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;