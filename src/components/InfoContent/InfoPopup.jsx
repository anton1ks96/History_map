import React from 'react';
import { getInfoContent } from '../../data/infoContent/infoData';
import { motion } from 'framer-motion';

const InfoPopup = ({ chapterId, onClose }) => {
  const infoData = getInfoContent(chapterId);

  if (!infoData) return null;

  const renderContentItem = (item, index) => {
    switch (item.type) {
      case 'paragraph':
        return (
          <motion.p
            key={index}
            className="info-popup-paragraph"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            {item.text}
          </motion.p>
        );
      case 'list':
        return (
          <motion.ul
            key={index}
            className="info-popup-list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            {item.items.map((listItem, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (index * 0.1) + (i * 0.05), duration: 0.2 }}
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <img src={item.src} alt={item.alt || 'Информационное изображение'} />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      className="info-content info-popup"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 20 }}
    >
      <div className="info-content-wrapper">
        <div className="info-header">
          <h2 className="info-title">{infoData.title}</h2>
          <button className="info-close-button" onClick={onClose}>✕</button>
        </div>
        <div className="info-content-body">
          {infoData.content.map(renderContentItem)}
        </div>
      </div>
    </motion.div>
  );
};

export default InfoPopup;
