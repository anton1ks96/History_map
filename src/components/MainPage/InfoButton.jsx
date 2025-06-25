import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StudentCard from './StudentCard';
import { hasAdditionalContent } from '../../data/steps.jsx';
import '../../styles/components.scss';
import '../../styles/info-button.scss';

const students = [
  {
    avatar: '/assets/media/ilya-contact.jpg',
    name: 'Илья Некрасов',
    role: 'Разработка дизайна',
    socialLink: 'https://t.me/NKSV_ILYA'
  },
  {
    avatar: '/assets/media/ivan-contact.jpg',
    name: 'Иван Коломацкий',
    role: 'Разработка бизнес-логики',
    socialLink: 'https://t.me/IKolomatskii'
  },
  {
    avatar: '/assets/media/artem-contact.jpg',
    name: 'Артём Джапаридзе',
    role: 'Профессиональный монтаж',
    socialLink: 'https://t.me/airsss993'
  }
];

const InfoButton = ({ currentChapterId, onInfoButtonClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 300);
  };

  useEffect(() => {
    const handleGlobalMouseOver = (e) => {
      if (
        isHovered &&
        buttonRef.current &&
        menuRef.current &&
        !buttonRef.current.contains(e.target) &&
        !menuRef.current.contains(e.target) &&
        isInteractiveElement(e.target)
      ) {
        setIsHovered(false);
      }
    };

    const isInteractiveElement = (element) => {
      const interactiveTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
      const interactiveClasses = ['control-button', 'interactive', 'clickable'];

      return (
        interactiveTags.includes(element.tagName) ||
        interactiveClasses.some(className =>
          element.classList && element.classList.contains(className)
        ) ||
        element.onclick ||
        window.getComputedStyle(element).cursor === 'pointer'
      );
    };

    document.addEventListener('mouseover', handleGlobalMouseOver);

    return () => {
      document.removeEventListener('mouseover', handleGlobalMouseOver);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isHovered]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const menuVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      scaleY: 0.95,
      transformOrigin: "top center"
    },
    visible: {
      opacity: 1,
      height: "auto",
      scaleY: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut",
        when: "beforeChildren",
        delayChildren: 0.05
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      scaleY: 0.95,
      transition: {
        duration: 0.15,
        ease: "easeIn",
        when: "afterChildren"
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.15,
        when: "beforeChildren",
        staggerChildren: 0.03
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.1,
        when: "afterChildren",
        staggerChildren: 0.02,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 8
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.15,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: 4,
      transition: {
        duration: 0.1,
        ease: "easeIn"
      }
    }
  };

  // Показать кнопку открытия информационного контента, если есть дополнительная информация
  const hasAdditional = currentChapterId && hasAdditionalContent(currentChapterId);

  return (
    <div
      className="info-button-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={buttonRef}
        className={`control-button info-button ${isHovered ? 'active' : ''}`}
        style={{
          width: 220,
          marginRight: 'var(--spacing-medium)',
          zIndex: isHovered ? 'var(--z-index-popup-active)' : 'var(--z-index-popup)',
        }}
        onClick={() => {
          if (hasAdditional && onInfoButtonClick) {
            onInfoButtonClick(currentChapterId);
          }
        }}
        aria-label="Информация"
      >
        <div className="button-content">
          <img
            src="/assets/ui/icons/Info.svg"
            alt="Информация"
            className="button-icon"
          />
          <span>Информация</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isHovered && (
          <motion.div
            ref={menuRef}
            className="info-dropdown-menu"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="dropdown-pointer"></div>

            <motion.div
              className="info-menu-header"
              variants={itemVariants}
            >
              <h2>Брусиловский прорыв</h2>
              <p>Проект представляет собой интерактивный сайт-сюжет, посвящённый одной из ключевых операций Первой мировой войны, которая завершилась успешно – Брусиловскому прорыву.</p>
            </motion.div>

            <motion.div
              className="info-divider"
              variants={itemVariants}
            ></motion.div>

            <motion.div
              className="info-menu-content"
              variants={contentVariants}
            >
              <motion.h3 variants={itemVariants}>Команда разработчиков</motion.h3>
              <motion.div
                className="student-cards"
                variants={contentVariants}
              >
                {students.map((student, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    layout
                  >
                    <StudentCard
                      avatar={student.avatar}
                      name={student.name}
                      role={student.role}
                      socialLink={student.socialLink}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InfoButton;





