// Sidebar.jsx
import React from 'react';
import styles from './Sidebar.module.css';

const Sidebar = ({ activeItem, onItemClick, onLogout, menuItems, subtitle = 'Student Panel', logoutIcon: LogoutIcon }) => {
  const handleLogoutClick = async () => {
    try {
      if (onLogout) {
        await onLogout();
      } else {
        // Fallback in case onLogout is not provided
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Still try to redirect even if there's an error
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
  };

  return (
    <div className={styles.sidebar}>
      {/* Logo Section */}
      <div className={styles.logo}>
        <h2 className={styles.logoText}>EdyMe</h2>
        <p className={styles.logoSubtitle}>{subtitle}</p>
      </div>

      {/* Menu Items */}
      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.name;

          const handleClick = () => {
            if (item.onClick) {
              item.onClick();
            } else if (onItemClick) {
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
              {Icon && <Icon size={20} />}
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
          {/* Render logout icon if provided */}
          {LogoutIcon && <LogoutIcon size={20} style={{ marginRight: 8 }} />}
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;