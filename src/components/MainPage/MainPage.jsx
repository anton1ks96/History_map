import React, { useState, useEffect, useRef, useCallback } from 'react';
import './../../styles/index.scss';
import InfoButton from './InfoButton';
import InfoContentManager from '../InfoContent/InfoContentManager';
import ChapterActionButtons from './ChapterActionButtons';
import SettingsButton from './SettingsButton';
import VideoPlayer from './VideoPlayer';
import Timeline from './Timeline';
import { normalizeChapterId } from '../../data/infoContent/infoData';

const MainPage = () => {
  const [interfaceVisible, setInterfaceVisible] = useState(true);
  const [currentChapterId, setCurrentChapterId] = useState("chapter1"); // Установим по умолчанию главу 1
  const [activeContentType, setActiveContentType] = useState(null);
  const [activeContentChapterId, setActiveContentChapterId] = useState(null);
  const videoPlayerRef = useRef(null);

  const toggleInterface = () => {
    setInterfaceVisible(!interfaceVisible);

    window.dispatchEvent(new CustomEvent('interface-toggle', {
      detail: { visible: !interfaceVisible }
    }));
  };

  const handleChapterActionClick = (type, chapterId) => {
    console.log('Нажата кнопка:', type, 'для главы:', chapterId);

    const numericId = normalizeChapterId(chapterId);
    console.log('Числовой ID главы:', numericId);

    if (type === activeContentType && chapterId === activeContentChapterId) {
      setActiveContentType(null);
      setActiveContentChapterId(null);
    } else {
      setActiveContentType(type);
      setActiveContentChapterId(chapterId);
    }
  };

  const handleCloseContent = () => {
    console.log('Закрытие контента');
    setActiveContentType(null);
    setActiveContentChapterId(null);
  };

  const handleChapterChange = (chapterId) => {
    console.log('Смена главы на:', chapterId);

    setCurrentChapterId(chapterId);

    if (activeContentType) {
      setActiveContentChapterId(chapterId);
    }
  };

  useEffect(() => {
    if (!currentChapterId) {
      setCurrentChapterId("chapter1");
    }
  }, []);

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

  const isPointActive = (chapterId) => {
    return currentChapterId === chapterId;
  };

  const handleTimelinePointClick = (chapterId) => {
    console.log('Переход к главе через таймлайн:', chapterId);

    if (videoPlayerRef.current && videoPlayerRef.current.changeChapter) {
      videoPlayerRef.current.changeChapter(chapterId);
    } else {
      // Запасной вариант, если нет прямого метода в VideoPlayer
      handleChapterChange(chapterId);
    }
  };

  const getTimelineProgressWidth = (chapterId) => {
    const chaptersOrder = [
      "chapter1",
      "chapter2",
      "interactiveMap",
      "chapter4",
      "chapter5_1",
      "chapter5_2",
      "chapter6",
      "chapter7",
      "heavyArtillery",
      "artilleryCounter",
      "infantry"
    ];

    const currentIndex = chaptersOrder.indexOf(chapterId);

    if (currentIndex === -1) return 0;

    const progressPercent = (currentIndex / (chaptersOrder.length - 1)) * 100;

    return progressPercent;
  };

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

          {activeContentType && (
            <InfoContentManager
              key={`${activeContentChapterId}-${activeContentType}`}
              type={activeContentType}
              chapterId={activeContentChapterId || currentChapterId}
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

          {/* Полоса, выступающая из нижней панели */}
          <Timeline
            currentChapterId={currentChapterId}
            onPointClick={handleTimelinePointClick}
          />
        </div>
      </div>
    </div>
  );
};

export default MainPage;
