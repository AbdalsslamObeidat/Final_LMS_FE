// StatsCards.jsx
import React from 'react';
import { BookOpen, GraduationCap, Clock, TrendingUp } from 'lucide-react';
import styles from './StatsCards.module.css';

const StatsCards = ({ stats, className = '' }) => {
  const getIcon = (label) => {
    switch (label.toLowerCase()) {
      case 'enrolled courses':
        return BookOpen;
      case 'completed':
        return GraduationCap;
      case 'hours learned':
        return Clock;
      default:
        return TrendingUp;
    }
  };

  const getIconColor = (color) => {
    if (color.includes('blue')) return styles.iconBlue;
    if (color.includes('purple')) return styles.iconPurple;
    if (color.includes('green')) return styles.iconGreen;
    if (color.includes('red')) return styles.iconRed;
    return styles.iconBlue;
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {stats.map((stat, index) => {
        const Icon = getIcon(stat.label);
        const iconColorClass = getIconColor(stat.color);
        
        return (
          <div key={index} className={styles.card}>
            <div className={styles.cardContent}>
              <div className={`${styles.iconContainer} ${iconColorClass}`}>
                <Icon size={24} color="white" />
              </div>
              <div className={styles.textContent}>
                <p className={styles.label}>{stat.label}</p>
                <p className={styles.value}>{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;