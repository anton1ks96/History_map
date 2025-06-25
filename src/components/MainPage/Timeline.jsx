import React, { useState, useEffect, useRef, useCallback } from 'react';

const chapterTooltipData = {
  "chapter1": { title: "Вступление и контекст", subtitle: "(Лето 1916 г.)" },
  "chapter2": { title: "Причины и предпосылки", subtitle: "(Декабрь 1915г.)" },
  "interactiveMap": { title: "Карта боевых действий", subtitle: "(Лето 1916 г.)" },
  "chapter3": { title: "Планирование операции", subtitle: "(Весна 1916 г.)" },
  "chapter4": { title: "Техника прорыва", subtitle: "(Весна 1916 г.)" },
  "chapter5_1": { title: "От прорыва к тупику", subtitle: "(июнь – июль 1916 г.)" },
  "chapter5_2": { title: "Контрудары и «ковельская дыра»", subtitle: "(июнь? 1916 г.)" },
  "chapter6": { title: "Остановка фронта и бл-то", subtitle: "(июль 1916 г.)" },
  "chapter7": { title: "Фронт застыл", subtitle: "(авг – сентябрь 1916 г.)" },
  "heavyArtillery": { title: "Тяжёлая артиллерия", subtitle: "(оружие прорыва)" },
  "artilleryCounter": { title: "Контрбатарейная борьба", subtitle: "(тактика огня)" },
  "infantry": { title: "Пехотные соединения", subtitle: "(ударные части)" }
};

const Timeline = ({ currentChapterId, onPointClick }) => {
  const [progressWidth, setProgressWidth] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ left: 0, visible: false });
  const [isMoving, setIsMoving] = useState(false);
  const [prevChapterId, setPrevChapterId] = useState(null);
  const timelineRef = useRef(null);
  const pointsRef = useRef([]);
  const tooltipRef = useRef(null);

  const chaptersOrder = [
    "chapter1",
    "chapter2",
    "interactiveMap",
    "chapter3",
    "chapter4",
    "chapter5_1",
    "chapter5_2",
    "chapter6",
    "chapter7",
    "heavyArtillery",
    "artilleryCounter",
    "infantry"
  ];

  const isPointActive = (chapterId) => {
    return currentChapterId === chapterId;
  };

  const positionTooltipAtPoint = useCallback((index) => {
    if (!timelineRef.current || !pointsRef.current || pointsRef.current.length === 0) return;

    if (index < 0 || index >= pointsRef.current.length) return;

    const activePoint = pointsRef.current[index];
    if (!activePoint) return;

    const timelineRect = timelineRef.current.getBoundingClientRect();

    const pointRect = activePoint.getBoundingClientRect();

    const pointPosition = pointRect.left - timelineRect.left + (pointRect.width / 2);

    setProgressWidth(`${pointPosition}px`);

    if (tooltipRef.current) {
      const tooltipWidth = tooltipRef.current.offsetWidth;
      const tooltipLeft = pointPosition - (tooltipWidth / 2);

      const timelineWidth = timelineRect.width;
      const finalLeft = Math.max(0, Math.min(timelineWidth - tooltipWidth, tooltipLeft));

      setTooltipPosition({
        left: finalLeft,
        visible: true
      });

      setIsMoving(true);

      setTimeout(() => {
        setIsMoving(false);
      }, 600);
    }
  }, []);

  useEffect(() => {
    if (!timelineRef.current) return;

    if (prevChapterId !== currentChapterId) {
      setPrevChapterId(currentChapterId);

      const currentIndex = chaptersOrder.indexOf(currentChapterId);
      if (currentIndex !== -1) {
        positionTooltipAtPoint(currentIndex);
      }
    }

    const handleResize = () => {
      const currentIndex = chaptersOrder.indexOf(currentChapterId);
      if (currentIndex !== -1) {
        positionTooltipAtPoint(currentIndex);
      }
    };

    window.addEventListener('resize', handleResize);

    const observer = new MutationObserver(() => {
      const currentIndex = chaptersOrder.indexOf(currentChapterId);
      if (currentIndex !== -1) {
        positionTooltipAtPoint(currentIndex);
      }
    });

    if (timelineRef.current) {
      observer.observe(timelineRef.current, {
        childList: true,
        subtree: true,
        attributes: true
      });
    }

    setTimeout(() => {
      const currentIndex = chaptersOrder.indexOf(currentChapterId);
      if (currentIndex !== -1) {
        positionTooltipAtPoint(currentIndex);
      }
    }, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [currentChapterId, prevChapterId, chaptersOrder, positionTooltipAtPoint]);

  const tooltipData = chapterTooltipData[currentChapterId] || { title: "Глава", subtitle: "(без описания)" };

  return (
    <div className="bottom-panel-bar">
      <div
        className="timeline-line"
        ref={timelineRef}
      >
        <div
          className="timeline-progress"
          style={{ width: progressWidth }}
        ></div>

        <div
          className={`chapter-tooltip ${tooltipPosition.visible ? 'visible' : ''} ${isMoving ? 'moving' : ''}`}
          style={{ left: tooltipPosition.left }}
          ref={tooltipRef}
        >
          <div className="tooltip-content">
            <div className="tooltip-title">{tooltipData.title}</div>
            <div className="tooltip-subtitle">{tooltipData.subtitle}</div>
          </div>
        </div>

        <div className="timeline-points">
          {chaptersOrder.map((chapterId, index) => (
            <div
              key={chapterId}
              className={`timeline-point ${isPointActive(chapterId) ? 'active' : ''}`}
              onClick={() => onPointClick(chapterId)}
              ref={el => pointsRef.current[index] = el}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
