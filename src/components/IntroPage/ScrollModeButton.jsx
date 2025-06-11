import React, { useState, useRef, useEffect } from 'react';
import './../../styles/index.scss';

const ScrollModeButton = () => {
  const [scrollEffects, setScrollEffects] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [buttonShift, setButtonShift] = useState({ y: 0, rotation: 0 });
  const buttonRef = useRef(null);
  const contentRef = useRef(null);
  const effectIdRef = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const scrollTimerRef = useRef(null);
  const isButtonHoveredRef = useRef(false);
  const elasticAnimationRef = useRef(null);
  const internalScrollRef = useRef(0);

  useEffect(() => {
    isButtonHoveredRef.current = isHovered;
  }, [isHovered]);

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 1.5;
    const rotateX = ((centerY - y) / centerY) * 1.5;

    if (contentRef.current) {
      contentRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);

    if (contentRef.current) {
      contentRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    }

    if (buttonShift.y !== 0 || buttonShift.rotation !== 0) {
      startElasticReturn();
    }
  };

  const startElasticReturn = () => {
    if (elasticAnimationRef.current) {
      cancelAnimationFrame(elasticAnimationRef.current);
    }

    const startY = buttonShift.y;
    const startRotation = buttonShift.rotation;
    const startTime = Date.now();
    const duration = 1600;

    const springFunction = (t) => {
      const amplitude = 0.8;
      const frequency = 4.5;
      const decay = 4;

      return Math.sin(frequency * t * Math.PI) * amplitude * Math.exp(-decay * t);
    };

    const animateReturn = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (progress < 1) {
        const dampingFactor = 1 - progress;
        const springFactor = springFunction(progress);

        const newY = startY * dampingFactor * (1 + springFactor);
        const newRotation = startRotation * dampingFactor * (1 + springFactor * 1.2);

        setButtonShift({ y: newY, rotation: newRotation });
        elasticAnimationRef.current = requestAnimationFrame(animateReturn);
      } else {
        setButtonShift({ y: 0, rotation: 0 });
        elasticAnimationRef.current = null;
      }
    };

    elasticAnimationRef.current = requestAnimationFrame(animateReturn);
  };

  const createScrollEffect = (startY, direction, intensity = 1) => {
    internalScrollRef.current += direction * 35;

    if (contentRef.current) {
      const scrollPos = internalScrollRef.current;
      const imageElement = contentRef.current.querySelector('.mode-image');
      const textElement = contentRef.current.querySelector('.mode-text');

      if (imageElement && textElement) {
        const imageAngle = Math.sin(scrollPos * 0.02) * 1.5;
        const imageScale = 1 + Math.abs(Math.sin(scrollPos * 0.01)) * 0.03;
        const imageOffsetY = Math.sin(scrollPos * 0.015) * 4;

        imageElement.style.transform = `
          translateY(${imageOffsetY}px)
          rotate(${imageAngle}deg)
          scale(${imageScale})
        `;

        const textOffsetY = -Math.sin(scrollPos * 0.015) * 3;
        const textScale = 1 - Math.abs(Math.sin(scrollPos * 0.01)) * 0.01;

        textElement.style.transform = `
          translateY(${textOffsetY}px)
          scale(${textScale})
        `;
      }
    }

    setTimeout(() => {
      const id = ++effectIdRef.current;
      const effectVariants = ['wave', 'pulse', 'lines'];
      const effectType = effectVariants[Math.floor(Math.random() * effectVariants.length)];

      if (effectType === 'wave') {
        const amplitude = (1.2 + Math.random() * 1.5) * intensity;
        setScrollEffects(prev => [
          ...prev,
          { id, startY, type: 'wave', amplitude, direction, opacity: 0.3 + Math.random() * 0.2 }
        ]);
      } else if (effectType === 'pulse') {
        const pulseY = startY + (Math.random() * 30 - 15);
        setScrollEffects(prev => [
          ...prev,
          { id, startY: pulseY, type: 'pulse', direction, intensity }
        ]);
      } else {
        const linesCount = 1 + Math.floor(Math.random() * 3);

        for (let i = 0; i < linesCount; i++) {
          const yOffset = startY + (Math.random() * 30 - 15);
          const speed = (0.7 + Math.random() * 0.3) * intensity;

          setScrollEffects(prev => [
            ...prev,
            {
              id: id + (i / 10),
              startY: yOffset,
              type: 'line',
              opacity: 0.2 + Math.random() * 0.2 * intensity,
              speed,
              direction
            }
          ]);
        }
      }

      setTimeout(() => {
        setScrollEffects(prev => prev.filter(effect =>
          Math.floor(effect.id) !== id
        ));
      }, 1200);
    }, Math.random() * 100);
  };

  const handleWheel = (e) => {
    if (!isButtonHoveredRef.current) return;

    e.preventDefault();
    const now = Date.now();

    if (now - lastScrollTime.current < 70) return;
    lastScrollTime.current = now;

    const direction = e.deltaY > 0 ? 1 : -1;
    const intensity = Math.min(2.0, Math.abs(e.deltaY) / 100);

    const rect = buttonRef.current.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    const relativeY = (mouseY / rect.height) * 100;

    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = null;
    }

    if (elasticAnimationRef.current) {
      cancelAnimationFrame(elasticAnimationRef.current);
      elasticAnimationRef.current = null;
    }

    setButtonShift(prev => {
      const resistanceFactor = 1 + Math.pow(Math.abs(prev.y) / 20, 1.3);

      const baseShift = 7 * intensity;
      const newY = prev.y + direction * (baseShift / resistanceFactor);

      const limitedY = Math.max(-30, Math.min(30, newY));

      const newRotation = limitedY * 0.12;

      return { y: limitedY, rotation: newRotation };
    });

    scrollTimerRef.current = setTimeout(() => {
      startElasticReturn();
      scrollTimerRef.current = null;
    }, 220);

    createScrollEffect(relativeY, direction, intensity);
  };

  useEffect(() => {
    if (isHovered && buttonRef.current) {
      buttonRef.current.addEventListener('wheel', handleWheel, { passive: false });

      return () => {
        if (buttonRef.current) {
          buttonRef.current.removeEventListener('wheel', handleWheel);
        }
      };
    }
  }, [isHovered]);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
      if (elasticAnimationRef.current) {
        cancelAnimationFrame(elasticAnimationRef.current);
      }
    };
  }, []);

  return (
    <div
      className="mode-button scroll-mode-button"
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={buttonRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        transform: `translateY(${buttonShift.y}px) rotate(${buttonShift.rotation}deg)`,
        transition: buttonShift.y === 0 ? 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)' : 'none'
      }}
    >
      {scrollEffects.map(effect => {
        if (effect.type === 'line') {
          return (
            <div
              key={effect.id}
              style={{
                position: 'absolute',
                top: `${effect.startY}%`,
                left: effect.direction > 0 ? '-10%' : '110%',
                width: '120%',
                height: '2px',
                background: `linear-gradient(${effect.direction > 0 ? '90deg' : '270deg'},
                  rgba(135, 17, 11, 0) 0%,
                  rgba(135, 17, 11, ${effect.opacity}) 50%,
                  rgba(135, 17, 11, 0) 100%
                )`,
                pointerEvents: 'none',
                zIndex: 0,
                animation: `scrollWave ${effect.speed}s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`,
                animationDirection: effect.direction > 0 ? 'normal' : 'reverse'
              }}
            />
          );
        } else if (effect.type === 'wave') {
          return (
            <div
              key={effect.id}
              style={{
                position: 'absolute',
                top: `${effect.startY}%`,
                left: '0',
                width: '100%',
                height: '2px',
                backgroundColor: 'var(--color-accent)',
                opacity: effect.opacity || 0.3,
                pointerEvents: 'none',
                zIndex: 0,
                animation: `waveMove 1.2s cubic-bezier(0.25, 0.8, 0.25, 1) forwards`,
                animationDirection: effect.direction > 0 ? 'normal' : 'reverse',
                clipPath: `polygon(
                  0% 0%, 100% 0%, 100% 100%, 0% 100%,
                  0% 0%, 5% ${50 - effect.amplitude * 60}%, 10% 50%, 15% ${50 + effect.amplitude * 60}%,
                  20% 50%, 25% ${50 - effect.amplitude * 50}%, 30% 50%, 35% ${50 + effect.amplitude * 50}%,
                  40% 50%, 45% ${50 - effect.amplitude * 40}%, 50% 50%, 55% ${50 + effect.amplitude * 40}%,
                  60% 50%, 65% ${50 - effect.amplitude * 30}%, 70% 50%, 75% ${50 + effect.amplitude * 30}%,
                  80% 50%, 85% ${50 - effect.amplitude * 20}%, 90% 50%, 95% ${50 + effect.amplitude * 20}%,
                  100% 50%
                )`
              }}
            />
          );
        } else if (effect.type === 'pulse') {
          return (
            <div
              key={effect.id}
              style={{
                position: 'absolute',
                top: `${effect.startY}%`,
                left: '0',
                width: '100%',
                height: '3px',
                backgroundColor: 'var(--color-accent)',
                opacity: 0,
                pointerEvents: 'none',
                zIndex: 0,
                animation: `pulseLine 1s cubic-bezier(0.25, 0.8, 0.25, 1) forwards`,
                animationDirection: effect.direction > 0 ? 'normal' : 'reverse'
              }}
            />
          );
        }
        return null;
      })}

      <style>
        {`
          @keyframes scrollWave {
            0% { transform: translateX(0); opacity: 0.7; }
            100% { transform: translateX(${scrollEffects[0]?.direction > 0 ? '120%' : '-120%'}); opacity: 0; }
          }

          @keyframes waveMove {
            0% { transform: translateX(${scrollEffects[0]?.direction > 0 ? '-100%' : '100%'}); opacity: 0.4; }
            50% { opacity: 0.6; }
            100% { transform: translateX(${scrollEffects[0]?.direction > 0 ? '100%' : '-100%'}); opacity: 0; }
          }

          @keyframes pulseLine {
            0% { opacity: 0; height: 2px; }
            20% { opacity: 0.7; height: 3px; }
            60% { opacity: 0.5; height: 3px; }
            100% { opacity: 0; height: 2px; }
          }
        `}
      </style>

      <div className="mode-content" ref={contentRef} style={{
        transition: 'transform 0.15s ease',
        opacity: isHovered ? 1 : 0.95
      }}>
        <img
          src="/assets/ui/scroll-btn.png"
          alt="Режим перемотки"
          className="mode-image"
          style={{
            transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
          }}
        />
        <div
          className="mode-text"
          style={{
            transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
          }}
        >
          Перемотка
        </div>
      </div>
    </div>
  );
};

export default ScrollModeButton;

