import React from 'react';
import { AnimatePresence } from 'framer-motion';
import InfoPopup from './InfoPopup';
import InteractiveMap from './InteractiveMap';

const InfoContentManager = ({ type, chapterId, onClose }) => {
  if (!type || !chapterId) return null;

  return (
    <AnimatePresence mode="wait">
      {type === 'map' && (
        <InteractiveMap
          key="map"
          chapterId={chapterId}
          onClose={onClose}
        />
      )}
      {type === 'info' && (
        <InfoPopup
          key="info"
          chapterId={chapterId}
          onClose={onClose}
        />
      )}
    </AnimatePresence>
  );
};

export default InfoContentManager;
