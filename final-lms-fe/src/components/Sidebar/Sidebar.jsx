// Sidebar.jsx
import React, { useCallback, memo } from 'react';
import styles from './Sidebar.module.css';

const Sidebar = memo(({ 
  activeItem, 
  onItemClick, 
  onLogout, 
  menuItems, 
  subtitle = 'Student Panel', 
  logoutIcon: LogoutIcon 
}) => {
  console.log('Sidebar rendered with props:', { activeItem, onItemClick: typeof onItemClick });
  
  const handleLogoutClick = useCallback(async () => {
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
  }, [onLogout]);
  
  // Memoize the menu item rendering
  const renderMenuItem = useCallback((item) => {
    const Icon = item.icon;
    const isActive = activeItem === item.name || 
                   (item.submenu && item.submenu.some(subItem => activeItem === subItem.name));
                   
    const handleSubItemClick = useCallback((subItemName) => {
      onItemClick?.(subItemName);
    }, [onItemClick]);
    
    const handleMainItemClick = useCallback(() => {
      onItemClick?.(item.name);
    }, [onItemClick, item.name]);
    
    return (
      <div key={item.name} className={styles.menuItemContainer}>
        <button
          onClick={handleMainItemClick}
          className={`${styles.menuItem} ${
            isActive ? styles.menuItemActive : styles.menuItemInactive
          }`}
        >
          <div className={styles.menuItemContent}>
            {Icon && <Icon size={18} />}
            <span>{item.name}</span>
          </div>
        </button>
        
        {item.submenu && (
          <div className={styles.submenu}>
            {item.submenu.map((subItem) => (
              <button
                key={subItem.name}
                onClick={() => handleSubItemClick(subItem.name)}
                className={`${styles.menuItem} ${styles.submenuItem} ${
                  activeItem === subItem.name ? styles.menuItemActive : styles.menuItemInactive
                }`}
              >
                <div className={styles.menuItemContent}>
                  {subItem.icon && <subItem.icon size={16} />}
                  <span>{subItem.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }, [activeItem, onItemClick]);

  return (
    <div className={styles.sidebar}>
      {/* Logo Section */}
      <div className={styles.logo}>
        <h2 className={styles.logoText}>EdyMe</h2>
        <p className={styles.logoSubtitle}>{subtitle}</p>
      </div>

      {/* Menu Items */}
      <nav className={styles.nav}>
        {menuItems.map(renderMenuItem)}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <button 
          className={styles.logoutButton}
          onClick={handleLogoutClick}
        >
          {LogoutIcon && <LogoutIcon size={20} style={{ marginRight: 8 }} />}
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.activeItem === nextProps.activeItem &&
    prevProps.onItemClick === nextProps.onItemClick &&
    prevProps.onLogout === nextProps.onLogout &&
    prevProps.subtitle === nextProps.subtitle &&
    JSON.stringify(prevProps.menuItems) === JSON.stringify(nextProps.menuItems) &&
    prevProps.logoutIcon === nextProps.logoutIcon
  );
});

export default Sidebar;