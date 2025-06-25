import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InfoPopup from './InfoPopup';
import InteractiveMap from './InteractiveMap';
import '../../styles/info-content.scss';

const InfoContentManager = ({ type, chapterId, onClose }) => {
  if (!chapterId) return null;

  const contentKey = `${type}-${chapterId}`;

  return (
    <div className="info-content-container">
      <AnimatePresence mode="wait">
        {type === 'map' && (
          <InteractiveMap
            key={contentKey}
            chapterId={chapterId}
            onClose={onClose}
          />
        )}
        {type === 'info' && (
          <InfoPopup
            key={contentKey}
            chapterId={chapterId}
            onClose={onClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default InfoContentManager;
