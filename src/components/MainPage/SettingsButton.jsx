import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsButton = () => {
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

  return (
    <div
      className="settings-button-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={buttonRef}
        className={`control-button settings-button ${isHovered ? 'active' : ''}`}
        style={{
          width: 130,
          height: 30,
          borderRadius: 14,
          border: '1px solid #464646',
          background: '#313131',
          boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
          zIndex: isHovered ? 'var(--z-index-popup-active)' : 'var(--z-index-popup)',
        }}
      >
      <div className="button-content">
          <img
            src="/assets/ui/icons/settings.svg"
            alt="����астройки"
            className="button-icon"
          />
          <span>Настройки</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isHovered && (
          <motion.div
            ref={menuRef}
            className="settings-dropdown-menu"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 'var(--z-index-popup-active)'
            }}
          >
            <div className="dropdown-pointer"></div>

            <motion.div
              className="settings-menu-header"
              variants={itemVariants}
            >
              <h2>Настройки</h2>
            </motion.div>

            <motion.div
              className="settings-divider"
              variants={itemVariants}
            ></motion.div>

            <motion.div
              className="settings-menu-content"
              variants={contentVariants}
            >
              <motion.div variants={itemVariants} className="settings-item">
                <span>Громкость звука</span>
                <input type="range" min="0" max="100" defaultValue="80" />
              </motion.div>

              <motion.div variants={itemVariants} className="settings-item">
                <span>Качество видео</span>
                <select defaultValue="high">
                  <option value="low">Низкое</option>
                  <option value="medium">Среднее</option>
                  <option value="high">Высокое</option>
                </select>
              </motion.div>

              <motion.div variants={itemVariants} className="settings-item">
                <span>Субтитры</span>
                <label className="toggle">
                  <input type="checkbox" />
                  <span className="toggle-slider"></span>
                </label>
              </motion.div>

              <motion.div variants={itemVariants} className="settings-item">
                <span>Автовоспроизведение</span>
                <label className="toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsButton;
