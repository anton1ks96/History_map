import React, { useState, useRef } from 'react';
import './../../styles/index.scss';

const ClickModeButton = () => {
  const [clickEffects, setClickEffects] = useState([]);
  const [rippleEffect, setRippleEffect] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef(null);
  const contentRef = useRef(null);
  const effectIdRef = useRef(0);
  const mousePositionRef = useRef({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mousePositionRef.current = { x, y };

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 3;
    const rotateX = ((centerY - y) / centerY) * 3;

    if (contentRef.current) {
      contentRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (contentRef.current) {
      contentRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    }
  };

  const handleClick = (e) => {
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - buttonRect.left;
    const y = e.clientY - buttonRect.top;

    setRippleEffect({
      scale: 0,
      opacity: 0.15
    });

    const animateMainRipple = () => {
      let scale = 0;
      let opacity = 0.15;
      const interval = setInterval(() => {
        scale += 0.03;
        opacity -= 0.001;

        setRippleEffect(prev => ({
          ...prev,
          scale,
          opacity
        }));

        if (scale >= 1) {
          clearInterval(interval);
          setTimeout(() => {
            setRippleEffect(null);
          }, 100);
        }
      }, 16);
    };

    animateMainRipple();

    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const id = ++effectIdRef.current;
        const offsetX = x + (Math.random() * 20 - 10);
        const offsetY = y + (Math.random() * 20 - 10);

        setClickEffects(prev => [
          ...prev,
          {
            id,
            x: offsetX,
            y: offsetY,
            scale: 0,
            opacity: 0.5 + (Math.random() * 0.2 - 0.1),
            animationSpeed: 0.5 + (Math.random() * 0.2)
          }
        ]);

        setTimeout(() => {
          setClickEffects(prev => prev.filter(effect => effect.id !== id));
        }, 800);
      }, i * 60);
    }

    if (contentRef.current) {
      const shakeSequence = [
        { x: -2, y: -1, time: 50 },
        { x: 1.5, y: 2, time: 50 },
        { x: -1, y: 0.5, time: 50 },
        { x: 0.5, y: -0.5, time: 50 },
        { x: 0, y: 0, time: 50 }
      ];

      let delay = 0;
      shakeSequence.forEach(shake => {
        setTimeout(() => {
          if (contentRef.current) {
            contentRef.current.style.transform = `perspective(1000px) translate(${shake.x}px, ${shake.y}px)`;
          }
        }, delay);
        delay += shake.time;
      });
    }

    if (buttonRef.current) {
      buttonRef.current.style.boxShadow = '0 0 15px var(--color-accent)';
      buttonRef.current.style.borderColor = 'var(--color-accent)';

      const pulseAnimation = [
        { value: 0.7, time: 100 },
        { value: 0.5, time: 100 },
        { value: 0.3, time: 100 },
        { value: 0.15, time: 100 },
        { value: 0, time: 100 }
      ];

      let pulseDelay = 0;
      pulseAnimation.forEach(pulse => {
        setTimeout(() => {
          if (buttonRef.current) {
            buttonRef.current.style.boxShadow = `0 0 15px rgba(135, 17, 11, ${pulse.value})`;
          }
        }, pulseDelay);
        pulseDelay += pulse.time;
      });

      setTimeout(() => {
        if (buttonRef.current) {
          buttonRef.current.style.boxShadow = '';
          buttonRef.current.style.borderColor = '';
        }
      }, 500);
    }
  };

  return (
    <div
      className="mode-button click-mode-button"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={buttonRef}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {rippleEffect && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: Math.max(buttonRef.current?.offsetWidth || 300, buttonRef.current?.offsetHeight || 150) * 2,
            height: Math.max(buttonRef.current?.offsetWidth || 300, buttonRef.current?.offsetHeight || 150) * 2,
            borderRadius: '50%',
            border: `3px solid var(--color-accent)`,
            opacity: rippleEffect.opacity,
            transform: `translate(-50%, -50%) scale(${rippleEffect.scale})`,
            pointerEvents: 'none',
            zIndex: 0,
            transition: 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)'
          }}
        />
      )}

      {clickEffects.map(effect => (
        <div
          key={effect.id}
          style={{
            position: 'absolute',
            top: effect.y,
            left: effect.x,
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-accent)',
            transform: `translate(-50%, -50%) scale(${effect.scale})`,
            pointerEvents: 'none',
            zIndex: 0,
            animation: `clickRipple ${effect.animationSpeed}s cubic-bezier(0.25, 0.8, 0.25, 1) forwards`
          }}
        />
      ))}

      <div className="mode-content" ref={contentRef} style={{ transition: 'transform 0.15s ease' }}>
        <img
          src="/assets/ui/click-btn.png"
          alt="Режим изучения"
          className="mode-image"
          style={{
            transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
          }}
        />
        <div className="mode-text">Изучить</div>
      </div>
    </div>
  );
};

export default ClickModeButton;

