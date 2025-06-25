import React, { useRef, useEffect, useState } from 'react';
import { getInfoContent, normalizeChapterId } from '../../data/infoContent/infoData';
import { motion, AnimatePresence } from 'framer-motion';

const InfoPopup = ({ chapterId, onClose }) => {
  const popupRef = useRef(null);
  const [infoData, setInfoData] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const numericId = normalizeChapterId(chapterId);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target) &&
          !e.target.closest('.chapter-action-button')) {
        setIsVisible(false);
        setTimeout(() => {
          onClose();
        }, 300);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    const data = getInfoContent(chapterId);
    setInfoData(data);
    setIsVisible(true);
  }, [chapterId, numericId]);

  const slideAnimation = {
    initial: {
      x: '100%',
      opacity: 0
    },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 30,
        stiffness: 250,
        mass: 0.9,
        restDelta: 0.001
      }
    },
    exit: {
      x: '100%',
      opacity: 0,
      transition: {
        type: "tween",
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const contentAnimation = {
    initial: { opacity: 0, x: 20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.1,
        duration: 0.3
      }
    }
  };

  const handleCloseButtonClick = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!infoData) {
    return (
      <motion.div
        ref={popupRef}
        className="info-content info-popup"
        variants={slideAnimation}
        initial="initial"
        animate={isVisible ? "animate" : "exit"}
        exit="exit"
      >
        <div className="info-header">
          <h2 className="info-title">Информация недоступна</h2>
          <button
            className="info-close-button"
            onClick={handleCloseButtonClick}
            aria-label="Закрыть"
          >
            <span>✕</span>
          </button>
        </div>
        <div className="info-content-wrapper">
          <div className="info-content-body">
            <p className="info-popup-paragraph">
              К сожалению, для главы {numericId} информация недоступна.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const renderContentItem = (item, index) => {
    switch (item.type) {
      case 'paragraph':
        return (
          <motion.p
            key={index}
            className="info-popup-paragraph"
            variants={contentAnimation}
          >
            {item.text}
          </motion.p>
        );
      case 'list':
        return (
          <motion.ul
            key={index}
            className="info-popup-list"
            variants={contentAnimation}
          >
            {item.items.map((listItem, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { delay: 0.1 + (i * 0.05) }
                }}
              >
                {listItem}
              </motion.li>
            ))}
          </motion.ul>
        );
      case 'image':
        return (
          <motion.div
            key={index}
            className="info-popup-image-container"
            variants={contentAnimation}
          >
            <img
              src={item.src}
              alt={item.alt || 'Информационное изображение'}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      ref={popupRef}
      className="info-content info-popup"
      variants={slideAnimation}
      initial="initial"
      animate={isVisible ? "animate" : "exit"}
      exit="exit"
    >
      <div className="info-header">
        <h2 className="info-title">{infoData.title}</h2>
        <button
          className="info-close-button"
          onClick={handleCloseButtonClick}
          aria-label="Закрыть"
        >
          <span>✕</span>
        </button>
      </div>

      <div className="info-content-wrapper">
        <div className="info-content-body">
          {Array.isArray(infoData.content) ? (
            infoData.content.map(renderContentItem)
          ) : (
            <p className="info-popup-paragraph">
              Контент не найден или формат данных некорректен.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default InfoPopup;
