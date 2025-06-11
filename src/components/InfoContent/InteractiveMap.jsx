import React, { useState, useEffect } from 'react';
import { getMapContent } from '../../data/infoContent/infoData';
import { motion } from 'framer-motion';

const InteractiveMap = ({ chapterId, onClose }) => {
  const [mapData, setMapData] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    const data = getMapContent(chapterId);
    if (data) {
      setMapData(data);
    }
  }, [chapterId]);

  const handlePointClick = (point) => {
    setSelectedPoint(prev => prev?.id === point.id ? null : point);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  if (!mapData) return null;

  return (
    <motion.div
      className="info-content interactive-map"
      initial={{ opacity: 0, x: -300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -300 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30
      }}
    >
      <div className="service-popup-header">
        <h2>{mapData.title}</h2>
      </div>
      <div className="service-popup-divider"></div>

      <div className="service-popup-content">
        <p className="map-description">{mapData.description}</p>

        <div className="map-container" style={{ transform: `scale(${zoomLevel})` }}>
          <img src={mapData.image} alt="Интерактивная карта" className="map-image" />

          {mapData.points.map(point => (
            <div
              key={point.id}
              className={`map-point ${selectedPoint?.id === point.id ? 'active' : ''}`}
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`
              }}
              onClick={() => handlePointClick(point)}
            />
          ))}
        </div>

        {selectedPoint && (
          <div className="point-details">
            <h3>{selectedPoint.title}</h3>
            <p>{selectedPoint.description}</p>
          </div>
        )}

        <div className="map-controls">
          <button onClick={handleZoomIn} className="zoom-button">+</button>
          <button onClick={handleZoomOut} className="zoom-button">-</button>
          <button onClick={onClose} className="close-button">Закрыть</button>
        </div>
      </div>
    </motion.div>
  );
};

export default InteractiveMap;




