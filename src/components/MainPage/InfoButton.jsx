import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StudentCard from './StudentCard';

const students = [
  {
    avatar: '/assets/images/ilya-contact.jpg',
    name: 'Илья Некрасов',
    role: 'Разработка дизайна',
    socialLink: 'https://t.me/NKSV_ILYA'
  },
  {
    avatar: '/assets/images/ivan-contact.jpg',
    name: 'Иван Коломацкий',
    role: 'Разработка бизнес-логики',
    socialLink: 'https://t.me/IKolomatskii'
  },
  {
    avatar: '/assets/images/artem-contact.jpg',
    name: 'Артём Джапаридзе',
    role: 'Профессиональный монтаж',
    socialLink: 'https://t.me/airsss993'
  }
];

const InfoButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const timeoutRef = useRef(null);

  // Обработчики для наведения мыши с задержкой закрытия
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    // Задержка закрытия меню, чтобы пользователь успел переместить курсор на меню
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 300);
  };

  // Глобальный обработчик наведения на интерактивные элементы
  useEffect(() => {
    const handleGlobalMouseOver = (e) => {
      // Проверяем, что элемент, на который навели, не входит в наш компонент
      if (
        isHovered &&
        buttonRef.current &&
        menuRef.current &&
        !buttonRef.current.contains(e.target) &&
        !menuRef.current.contains(e.target) &&
        isInteractiveElement(e.target)
      ) {
        // Если навели на другой интерактивный элемент - закрываем меню
        setIsHovered(false);
      }
    };

    // Функция для определения интерактивных элементов
    const isInteractiveElement = (element) => {
      const interactiveTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
      const interactiveClasses = ['control-button', 'interactive', 'clickable'];

      // Проверяем по тегу или по классу
      return (
        interactiveTags.includes(element.tagName) ||
        interactiveClasses.some(className =>
          element.classList && element.classList.contains(className)
        ) ||
        element.onclick ||
        window.getComputedStyle(element).cursor === 'pointer'
      );
    };

    // Добавляем обработчик
    document.addEventListener('mouseover', handleGlobalMouseOver);

    // Удаляем обработчик при размонтировании
    return () => {
      document.removeEventListener('mouseover', handleGlobalMouseOver);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isHovered]);

  // Очистка таймера при размонтировании компонента
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Варианты анимации для меню
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

  // Анимация для контейнера карточек
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

  // Анимация для отдельных элементов
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
      >
        <div className="button-content">
          <img
            src="/assets/vectors/Info.svg"
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
