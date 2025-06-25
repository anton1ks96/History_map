import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { hasMapContent, hasInfoContent } from '../../data/infoContent/infoData';

const ActionButton = ({ type, position, delay, onClick }) => {
  const buttonRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isClicked, setIsClicked] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.8 };
  const followX = useSpring(0, springConfig);
  const followY = useSpring(0, springConfig);

  const rotateX = useTransform(followY, [-20, 20], [10, -10]);
  const rotateY = useTransform(followX, [-20, 20], [-10, 10]);
  const glowX = useTransform(followX, [-20, 20], [-30, 30]);
  const glowY = useTransform(followY, [-20, 20], [-30, 30]);

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const offsetX = ((e.clientX - centerX) / (rect.width / 2)) * 20;
    const offsetY = ((e.clientY - centerY) / (rect.height / 2)) * 20;

    mouseX.set(offsetX);
    mouseY.set(offsetY);

    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    });
  };

  useEffect(() => {
    const unsubscribeX = mouseX.onChange(latest => followX.set(latest));
    const unsubscribeY = mouseY.onChange(latest => followY.set(latest));

    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [mouseX, mouseY, followX, followY]);

  const buttonVariants = {
    initial: {
      x: position === 'left' ? -100 : 100,
      opacity: 0,
      scale: 0.6,
      width: '60px',
      filter: 'brightness(0.8)'
    },
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      width: '60px',
      filter: 'brightness(1)',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 20,
        mass: 1,
        delay: delay || 0
      }
    },
    hover: {
      width: position === 'left' ? '150px' : '170px',
      scale: 1.05,
      filter: 'brightness(1.2)',
      transition: {
        width: {
          type: 'spring',
          stiffness: 500,
          damping: 25,
          duration: 0.3
        },
        scale: {
          type: 'spring',
          stiffness: 400,
          damping: 10
        }
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1,
        ease: 'easeInOut'
      }
    },
    exit: {
      x: position === 'left' ? -100 : 100,
      opacity: 0,
      scale: 0.6,
      filter: 'brightness(0.8)',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 20,
        duration: 0.3
      }
    }
  };

  const bgVariants = {
    initial: {
      opacity: 0.9,
      background: type === 'map'
        ? 'radial-gradient(circle at 50% 50%, rgba(65, 105, 225, 0.3) 0%, rgba(20, 20, 22, 0.85) 70%)'
        : 'radial-gradient(circle at 50% 50%, rgba(135, 17, 11, 0.3) 0%, rgba(20, 20, 22, 0.85) 70%)'
    },
    hover: {
      opacity: 1,
      background: type === 'map'
        ? 'radial-gradient(circle at var(--x) var(--y), rgba(65, 105, 225, 0.7) 0%, rgba(20, 20, 22, 0.8) 70%)'
        : 'radial-gradient(circle at var(--x) var(--y), rgba(135, 17, 11, 0.7) 0%, rgba(20, 20, 22, 0.8) 70%)',
      transition: {
        opacity: { duration: 0.2 }
      }
    },
    tap: {
      background: type === 'map'
        ? 'radial-gradient(circle at var(--x) var(--y), rgba(65, 105, 225, 0.8) 0%, rgba(20, 20, 22, 0.8) 60%)'
        : 'radial-gradient(circle at var(--x) var(--y), rgba(135, 17, 11, 0.8) 0%, rgba(20, 20, 22, 0.8) 60%)',
      transition: { duration: 0.1 }
    }
  };

  const gradientStyle = {
    '--x': `${mousePosition.x * 100}%`,
    '--y': `${mousePosition.y * 100}%`
  };

  const borderVariants = {
    initial: {
      opacity: 0.7,
      filter: 'blur(0px)'
    },
    hover: {
      opacity: 1,
      filter: 'blur(0.5px)',
      transition: { duration: 0.2 }
    }
  };

  const glowVariants = {
    initial: {
      opacity: 0,
      scale: 0.9
    },
    hover: {
      opacity: 0.6,
      scale: 1.1,
      filter: 'blur(8px)',
      transition: {
        opacity: { duration: 0.3 },
        scale: {
          type: 'spring',
          stiffness: 400,
          damping: 20
        }
      }
    }
  };

  const iconVariants = {
    initial: {
      scale: 1,
      y: 0,
      rotate: 0,
      filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))'
    },
    hover: {
      scale: 1.2,
      y: [0, -4, 0],
      rotate: type === 'map' ? [0, -5, 0, 5, 0] : [0, 5, 0, -5, 0],
      filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.4))',
      transition: {
        scale: { duration: 0.2 },
        y: {
          repeat: Infinity,
          repeatType: "mirror",
          duration: 2.5,
          ease: "easeInOut"
        },
        rotate: {
          repeat: Infinity,
          repeatType: "mirror",
          duration: 5,
          ease: "easeInOut"
        },
        filter: { duration: 0.2 }
      }
    },
    tap: {
      scale: 0.9,
      rotate: 0,
      filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))',
      transition: { duration: 0.1 }
    }
  };

  const labelVariants = {
    initial: {
      opacity: 0,
      x: position === 'left' ? 10 : -10,
      filter: 'blur(2px)'
    },
    hover: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: {
        opacity: { duration: 0.2 },
        x: {
          type: 'spring',
          stiffness: 500,
          damping: 25,
          duration: 0.3
        },
        filter: { duration: 0.2 }
      }
    }
  };

  const createParticles = () => {
    if (!buttonRef.current) return;

    setIsClicked(true);

    setTimeout(() => {
      setIsClicked(false);
    }, 700);
  };

  const clickGlowVariants = {
    initial: {
      scale: 0,
      opacity: 0
    },
    tap: {
      scale: [0, 1.5],
      opacity: [0.7, 0],
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const particleVariants = {
    initial: {
      scale: 0,
      opacity: 0
    },
    active: {
      scale: [0, 1.2],
      opacity: [1, 0],
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };

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

  const renderParticles = () => {
    if (!isClicked) return null;

    const particleCount = 12;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * 360;
      const distance = 40 + Math.random() * 40;
      const delay = Math.random() * 0.2;
      const size = 5 + Math.random() * 8;
      const duration = 0.5 + Math.random() * 0.7;

      const x = Math.cos(angle * (Math.PI / 180)) * distance;
      const y = Math.sin(angle * (Math.PI / 180)) * distance;

      particles.push(
        <motion.div
          key={i}
          className="button-particle"
          initial={{ x: 0, y: 0, scale: 0, opacity: 0.8 }}
          animate={{
            x: x,
            y: y,
            scale: size / 10,
            opacity: 0
          }}
          transition={{
            duration: duration,
            ease: "easeOut",
            delay: delay
          }}
          style={{
            backgroundColor: type === 'map' ? '#4169e1' : '#871711',
            boxShadow: type === 'map'
              ? '0 0 10px 2px rgba(65, 105, 225, 0.7)'
              : '0 0 10px 2px rgba(135, 17, 11, 0.7)'
          }}
        />
      );
    }

    return particles;
  };

  return (
    <motion.div
      ref={buttonRef}
      className="chapter-action-button"
      data-position={position}
      data-type={type}
       style={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        transformStyle: "preserve-3d",
        perspective: 1000
      }}
      variants={buttonVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      whileTap="tap"
      onMouseMove={handleMouseMove}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => {
        setIsHovered(false);
        mouseX.set(0);
        mouseY.set(0);
      }}
      onClick={(e) => {
        createParticles();
        onClick();
      }}
    >
      {/* Фон кнопки с эффектом движения градиента */}
      <motion.div
        className="button-background"
        variants={bgVariants}
        style={gradientStyle}
      />

      {/* 3D бордер */}
      <motion.div
        className="button-border"
        variants={borderVariants}
      />

      {/* Свечение вокруг кнопки с эффектом движения */}
      <motion.div
        className="button-glow"
        variants={glowVariants}
        style={{
          x: isHovered ? glowX : 0,
          y: isHovered ? glowY : 0
        }}
      />

      {/* Свечение при клике */}
      <motion.div
        className="button-click-glow"
        variants={clickGlowVariants}
      />

      {/* Иконка с плавающей анимацией */}
      <motion.div
        className="button-icon"
        variants={iconVariants}
        style={{
          z: 20,
          textShadow: isHovered
            ? '0 0 8px rgba(255,255,255,0.5)'
            : '0 0 0px rgba(255,255,255,0)'
        }}
      >
        {getIcon()}
      </motion.div>

      {/* Текстовая метка с эффектом появления */}
      <motion.div
        className="button-label"
        variants={labelVariants}
        style={{
          z: 20
        }}
      >
        {getLabel()}
      </motion.div>

      {/* Контейнер для частиц */}
      <div className="button-particles-container">
        {renderParticles()}
      </div>
    </motion.div>
  );
};

const ChapterActionButtons = ({ chapterId, onButtonClick }) => {
  const [visibleButtons, setVisibleButtons] = useState([]);

  useEffect(() => {
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

      if (onButtonClick) {
        onButtonClick('info', chapterId);
      }
    }

    setVisibleButtons([]);

    const timer = setTimeout(() => {
      setVisibleButtons(buttons);
    }, 300);

    return () => clearTimeout(timer);
  }, [chapterId]);

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

