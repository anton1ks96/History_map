import React, { useState, useEffect, useRef } from 'react';
import { getMapContent, normalizeChapterId } from '../../data/infoContent/infoData';
import { motion, AnimatePresence } from 'framer-motion';

const InteractiveMap = ({ chapterId, onClose }) => {
  const mapRef = useRef(null);
  const [mapData, setMapData] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isVisible, setIsVisible] = useState(true);
  const numericId = normalizeChapterId(chapterId);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mapRef.current && !mapRef.current.contains(e.target) &&
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
    setSelectedPoint(null);
    setZoomLevel(1);
    setIsVisible(true);

    const data = getMapContent(chapterId);
    if (data) {
      setMapData(data);
    } else {
      setMapData(null);
    }
  }, [chapterId, numericId]);

  const handlePointClick = (point) => {
    setSelectedPoint(prev => prev?.id === point.id ? null : point);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleCloseButtonClick = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const slideAnimation = {
    initial: {
      x: '-100%',
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
      x: '-100%',
      opacity: 0,
      transition: {
        type: "tween",
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const contentAnimation = {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.1,
        duration: 0.3
      }
    }
  };

  const pointAnimation = {
    initial: { opacity: 0, scale: 0 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: 0.2
      }
    }
  };

  if (!mapData) {
    return (
      <motion.div
        ref={mapRef}
        className="info-content interactive-map"
        variants={slideAnimation}
        initial="initial"
        animate={isVisible ? "animate" : "exit"}
        exit="exit"
      >
        <div className="info-header">
          <h2 className="info-title">Карта недоступна</h2>
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
              К сожалению, для главы {numericId} карта недоступна.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={mapRef}
      className="info-content interactive-map"
      variants={slideAnimation}
      initial="initial"
      animate={isVisible ? "animate" : "exit"}
      exit="exit"
    >
      <div className="info-header">
        <h2 className="info-title">{mapData.title || `Карта главы ${numericId}`}</h2>
        <button
          className="info-close-button"
          onClick={handleCloseButtonClick}
          aria-label="Закрыть"
        >
          <span>✕</span>
        </button>
      </div>

      <div className="map-content-wrapper">
        <motion.p
          className="map-description"
          variants={contentAnimation}
        >
          {mapData.description || 'Интерактивная карта для данной главы'}
        </motion.p>

        <motion.div
          className="map-container"
          variants={contentAnimation}
        >
          <div className="map-image-wrapper">
            <img
              src={mapData.mapImage}
              alt={mapData.title || `Карта главы ${numericId}`}
              className="map-image"
              onError={(e) => {
                e.target.src = "/assets/media/map_ch3.jpg";
              }}
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center',
                transition: 'transform 0.3s ease'
              }}
            />

            <div className="map-points">
              <AnimatePresence>
                {mapData.points && mapData.points.map((point, index) => (
                  <motion.div
                    key={point.id}
                    className={`map-point ${selectedPoint?.id === point.id ? 'active' : ''}`}
                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePointClick(point);
                    }}
                    variants={pointAnimation}
                    initial="initial"
                    animate="animate"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {selectedPoint?.id === point.id && (
                      <motion.div
                        className="point-tooltip"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          transition: {
                            duration: 0.2
                          }
                        }}
                        exit={{ opacity: 0, y: 5 }}
                      >
                        <h4>{point.title}</h4>
                        <p>{point.description}</p>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <motion.div
            className="map-controls"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { delay: 0.3 }
            }}
          >
            <motion.button
              onClick={handleZoomIn}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              +
            </motion.button>
            <motion.button
              onClick={handleZoomOut}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              -
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default InteractiveMap;
