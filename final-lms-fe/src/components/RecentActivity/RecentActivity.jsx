import React from 'react';
import {
  CheckCircle,
  FileText,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import styles from './RecentActivity.module.css';

const ICONS = {
  quiz: CheckCircle,
  assignment: FileText,
  enrollment: BookOpen,
  grade: GraduationCap
};

const ActivityItem = ({ activity, onClick = () => {} }) => {
  const Icon = ICONS[activity.type] || CheckCircle;

  return (
    <div 
      className={styles.activityItem}
      onClick={() => onClick(activity)}
    >
      <div className={`${styles.iconContainer} ${styles[activity.type]}`}>
        <Icon size={20} />
      </div>
      <div className={styles.activityContent}>
        <div className={styles.activityTitle}>{activity.title}</div>
        <div className={styles.activitySubtitle}>{activity.subtitle}</div>
        <div className={styles.activityTime}>{activity.time}</div>
      </div>
    </div>
  );
};

const RecentActivity = ({
  title = 'Recent Activity',
  activities = [
    {
      id: 1,
      type: 'quiz',
      title: 'Quiz completed',
      subtitle: 'React Fundamentals - Chapter 3',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'assignment',
      title: 'Assignment submitted',
      subtitle: 'JavaScript Project - Todo App',
      time: '1 day ago'
    },
    {
      id: 3,
      type: 'enrollment',
      title: 'New course enrolled',
      subtitle: 'Python for Data Science',
      time: '3 days ago'
    },
    {
      id: 4,
      type: 'grade',
      title: 'Grade received',
      subtitle: 'UI Design Project - Grade: A',
      time: '1 week ago'
    }
  ],
  onActivityClick = () => {},
  className = ''
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      <h4 className={styles.title}>{title}</h4>
      
      <div className={styles.activitiesList}>
        {activities.length > 0 ? (
          activities.map((activity) => (
            <ActivityItem 
              key={activity.id}
              activity={activity}
              onClick={onActivityClick}
            />
          ))
        ) : (
          <div className={styles.emptyState}>
            No recent activities
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
