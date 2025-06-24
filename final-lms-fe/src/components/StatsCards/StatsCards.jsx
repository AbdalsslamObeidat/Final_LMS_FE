// StatsCards.jsx
import React from 'react';
import { BookOpen, GraduationCap, TrendingUp } from 'lucide-react';
import styles from './StatsCards.module.css';

const StatsCards = ({ stats, userData, className = '' }) => {
  // If userData is provided, use its values; otherwise fallback to stats prop
  const cards = userData
    ? [
        {
          label: 'Enrolled Courses',
          value: userData.enrolledCourses ?? 0,
          color: 'bg-blue-500',
        },
        {
          label: 'Completed',
          value: userData.completedCourses ?? 0,
          color: 'bg-purple-500',
        },
        // Removed "Hours Learned"
      ]
    : stats?.filter(
        (stat) => stat.label.toLowerCase() !== 'hours learned'
      );

  const getIcon = (label) => {
    switch (label.toLowerCase()) {
      case 'enrolled courses':
        return BookOpen;
      case 'completed':
        return GraduationCap;
      // Removed 'hours learned'
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
      {cards.map((stat, index) => {
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