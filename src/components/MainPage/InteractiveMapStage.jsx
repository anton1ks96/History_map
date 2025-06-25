import React, { useState, useEffect, useRef } from 'react';
import '../../styles/interactiveMapStage.scss';
import { getNextStep, getPrevStep } from '../../data/steps.jsx';

const InteractiveMapStage = ({ onNext, onPrev }) => {
  const [popupInfo, setPopupInfo] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  const exitTimeout = useRef(null);
  const popupRef = useRef(null);

  const points = [
    {
      id: 'p1',
      x: '65%',
      y: '45%',
      title: '8-я армия: Луцк → Ковель',
      description: 'Правый фланг Юго-Западного фронта. 4–7 июня 1916 г. генерал А.А. Каледин прорвал позиции 4-й австро-венгерской армии, штурмом взял Луцк (≈45 000 пленных, 66 орудий) и вышел к ж/д-узлу Ковель, задав темп всей операции.'
    },
    {
      id: 'p2',
      x: '55%',
      y: '64%',
      title: '11-я армия: Дубно → Броды',
      description: 'Центральный сектор. Части генерала В.В. Сахарова 28 июля вошли в Броды, за 12 дней захватив 40 000 пленных и 49 орудий; удар отвлёк резервы противника от Ковеля и приблизил русские к Львову. '
    },
    {
      id: 'p3',
      x: '59%',
      y: '79%',
      title: '7-я армия: Тернополь → Карпаты',
      description: 'Генерал Д.Г. Щербачёв форсировал реку Стрыпа, отбросив австро-венгров к предгорьям Карпат; умеренное продвижение закрепило левый фланг и прикрыло коммуникации 11-й армии.'
    },
    {
      id: 'p4',
      x: '60%',
      y: '28%',
      title: '3-я армия: Маневичи → Ковель',
      description: 'Переброшенная с Западного фронта 3-я армия ген. Л. В. Леша 5–7 июля 1916 г. прорвала оборону у Маневичей, форсировала Стоход и подошла к Ковелю, сковав германские резервы.'
    }
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        initiateExit('next');
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        initiateExit('prev');
      } else if (e.code === 'Escape' && popupInfo) {
        setPopupInfo(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (exitTimeout.current) clearTimeout(exitTimeout.current);
    };
  }, [popupInfo]);

  const initiateExit = (direction) => {
    if (isExiting) return;

    setIsExiting(true);

    exitTimeout.current = setTimeout(() => {
      if (direction === 'next') {
        onNext();
      } else {
        onPrev();
      }
    }, 300);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (isExiting) return;

    if (e.deltaY > 0) {
      initiateExit('next');
    } else if (e.deltaY < 0) {
      initiateExit('prev');
    }
  };

  const handlePointClick = (point, e) => {
    e.stopPropagation();
    setPopupInfo(point);
  };

  const handleClosePopup = (e) => {
    e.stopPropagation();
    setPopupInfo(null);
  };

  const handleOverlayClick = () => {
    if (popupInfo) {
      setPopupInfo(null);
    }
  };

  return (
    <div
      className={`interactive-map-overlay ${isExiting ? 'exit' : ''}`}
      onWheel={handleWheel}
      onClick={handleOverlayClick}
    >
      <div className="map-title">Карта армий Юго-Западного фронта</div>
      <div className="map-subtitle">
        Кликните красные маркеры, чтобы открыть сводку каждой армии
      </div>

      <div className="instruction-badge">
        <span className="pulse-icon"></span>
        <span>Интерактивная карта</span>
      </div>

      <div
        className="map-container"
        style={{ backgroundImage: 'url(/assets/media/map_ch3.jpg)' }}
      >
        {points.map((point) => (
          <div
            key={point.id}
            className="map-point"
            style={{
              left: point.x,
              top: point.y
            }}
            title={point.title}
            onClick={(e) => handlePointClick(point, e)}
          />
        ))}

        {popupInfo && (
          <div
            className="map-popup"
            style={{
              left: popupInfo.x,
              top: popupInfo.y
            }}
            ref={popupRef}
          >
            <h4>{popupInfo.title}</h4>
            <p>{popupInfo.description}</p>
            <button onClick={handleClosePopup}>Закрыть</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveMapStage;
