import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hasMapContent, hasInfoContent } from '../../data/infoContent/infoData';

// Анимированный компонент кнопки с эффектом вылета
const ActionButton = ({ type, position, delay, onClick }) => {
  const buttonVariants = {
    initial: {
      x: position === 'left' ? -150 : 150,
      opacity: 0,
      scale: 0.6
    },
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
        delay: delay || 0
      }
    },
    exit: {
      x: position === 'left' ? -150 : 150,
      opacity: 0,
      scale: 0.6,
      transition: {
        duration: 0.2,
        ease: 'easeInOut'
      }
    },
    hover: {
      scale: 1.1,
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.95
    }
  };

  // Определяем иконку в зависимости от типа
  const getIcon = () => {
    switch (type) {
      case 'map':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
          </svg>
        );
      case 'info':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  // Возвращаем стилизованную текстовую метку
  const getLabel = () => {
    switch (type) {
      case 'map':
        return 'Карта';
      case 'info':
        return 'Документы';
      default:
        return '';
    }
  };

  return (
    <motion.button
      className="chapter-action-button"
      data-position={position}
      data-type={type}
      variants={buttonVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
    >
      <div className="button-icon">{getIcon()}</div>
      <div className="button-label">{getLabel()}</div>
    </motion.button>
  );
};

const ChapterActionButtons = ({ chapterId, onButtonClick }) => {
  const [visibleButtons, setVisibleButtons] = useState([]);

  useEffect(() => {
    // Проверяем, какие типы контента доступны для этой главы
    const buttons = [];

    if (hasMapContent(chapterId)) {
      buttons.push({
        type: 'map',
        position: 'left',
        delay: 0.1
      });
    }

    if (hasInfoContent(chapterId)) {
      buttons.push({
        type: 'info',
        position: 'right',
        delay: 0.2
      });
    }

    // Сбрасываем и устанавливаем кнопки с небольшой задержкой для эффекта вылета
    setVisibleButtons([]);

    const timer = setTimeout(() => {
      setVisibleButtons(buttons);
    }, 300);

    return () => clearTimeout(timer);
  }, [chapterId]);

  // Обработчик клика по кнопке
  const handleButtonClick = (type) => {
    if (onButtonClick) {
      onButtonClick(type, chapterId);
    }
  };

  return (
    <div className="chapter-action-buttons-container">
      <AnimatePresence>
        {visibleButtons.map((button) => (
          <ActionButton
            key={`${button.type}-${button.position}`}
            type={button.type}
            position={button.position}
            delay={button.delay}
            onClick={() => handleButtonClick(button.type)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ChapterActionButtons;
