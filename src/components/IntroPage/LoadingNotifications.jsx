import React, { useState, useEffect } from 'react';
import './../../styles/index.scss';

const LoadingNotifications = ({ loadingProgress }) => {
  const [activeNotifications, setActiveNotifications] = useState([]);

  const loadingMessages = [
    "Проверка доступных документов...",
    "Загрузка медиа-файлов...",
    "Подготовка интерфейса...",
    "Завершение подготовки..."
  ];

  useEffect(() => {
    const updateNotifications = () => {
      let newNotifications = [];

      if (loadingProgress >= 15) {
        newNotifications.push(loadingMessages[0]);
      }

      if (loadingProgress >= 35) {
        newNotifications.push(loadingMessages[1]);
      }

      if (loadingProgress >= 65) {
        newNotifications.push(loadingMessages[2]);
      }

      if (loadingProgress >= 85) {
        newNotifications.push(loadingMessages[3]);
      }

      if (JSON.stringify(newNotifications) !== JSON.stringify(activeNotifications)) {
        setActiveNotifications(newNotifications);
      }
    };

    updateNotifications();
  }, [loadingProgress]);

  return (
    <div className="loading-notifications-container">
      {activeNotifications.map((message, index) => (
        <div
          key={index}
          className={`loading-notification notification-${index}`}
          style={{ animationDelay: `${index * 0.2}s` }}
        >
          {message}
        </div>
      ))}
    </div>
  );
};

export default LoadingNotifications;












