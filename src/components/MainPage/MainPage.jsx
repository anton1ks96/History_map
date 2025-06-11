import React, { useState, useEffect, useRef, useCallback } from 'react';
import './../../styles/index.scss';
import InfoButton from './InfoButton';
import InfoContentManager from '../InfoContent/InfoContentManager';
import ChapterActionButtons from './ChapterActionButtons';
import SettingsButton from './SettingsButton';
import VideoPlayer from './VideoPlayer';

const MainPage = () => {
  const [interfaceVisible, setInterfaceVisible] = useState(true);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [activeContentType, setActiveContentType] = useState(null);
  const videoPlayerRef = useRef(null);

  const toggleInterface = () => {
    setInterfaceVisible(!interfaceVisible);

    window.dispatchEvent(new CustomEvent('interface-toggle', {
      detail: { visible: !interfaceVisible }
    }));
  };

  const handleChapterActionClick = (type, chapterId) => {
    setActiveContentType(type);
  };

  const handleCloseContent = () => {
    setActiveContentType(null);
  };

  const handleChapterChange = (chapterId) => {
    setCurrentChapterId(chapterId);
    // Закрываем любой открытый контент при смене главы
    setActiveContentType(null);
  };

  const handleMainPageScroll = useCallback((e) => {
    e.preventDefault();

    if (videoPlayerRef.current && videoPlayerRef.current.handleScroll) {
      videoPlayerRef.current.handleScroll(e);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('wheel', handleMainPageScroll, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleMainPageScroll);
    };
  }, [handleMainPageScroll]);

  return (
    <div className="noise-background" style={{
      height: '100vh',
      width: '100%',
      padding: 'var(--container-padding)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div className="main-container" style={{
        width: 'calc(100% - 40px)',
        height: 'calc(100% - 40px)',
      }}>
        <div className="control-panel top-panel">
          <img
            src="/assets/branding/Logo.png"
            alt="Логотип"
            className="logo"
            style={{
              height: '40px',
              marginLeft: '60px'
            }}
          />

          <div className="top-panel-controls">
            <InfoButton
              currentChapterId={currentChapterId}
            />

            <div className="indicator-dot"></div>

            <button className="control-button hide-interface-button" onClick={toggleInterface}>
              <img src="/assets/ui/icons/HideInterface.svg" alt="Скрыть интерфейс" className="button-icon" />
              <span>Скрыть интерфейс</span>
            </button>
          </div>
        </div>

        <div className="content-area" style={{
          flex: 1,
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <VideoPlayer
            ref={videoPlayerRef}
            onChapterChange={handleChapterChange}
          />

          {currentChapterId && (
            <ChapterActionButtons
              chapterId={currentChapterId}
              onButtonClick={handleChapterActionClick}
            />
          )}

          {/* Перемещаем информационные вставки внутрь content-area */}
          {activeContentType && currentChapterId && (
            <InfoContentManager
              type={activeContentType}
              chapterId={currentChapterId}
              onClose={handleCloseContent}
            />
          )}
        </div>

        <div className="control-panel bottom-panel">
          <div></div>
          <div style={{ position: 'absolute', left: '50%', bottom: '5px', transform: 'translateX(-50%)' }}>
            <SettingsButton />
          </div>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
