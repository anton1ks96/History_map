import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/theme';
import './../../styles/index.scss';

const PlayButton = () => {
  const navigate = useNavigate();
  const [isClicked, setIsClicked] = useState(false);
  const [rippleEffects, setRippleEffects] = useState([]);
  const buttonRef = useRef(null);
  const rippleIdRef = useRef(0);

  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
  }, []);

  const handleClick = (e) => {
    if (isClicked) return;

    setIsClicked(true);

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - buttonRect.left;
    const y = e.clientY - buttonRect.top;

    const effectsCount = 5;
    for (let i = 0; i < effectsCount; i++) {
      const id = rippleIdRef.current++;

      setRippleEffects(prev => [
        ...prev,
        {
          id,
          x: x + (Math.random() * 40 - 20),
          y: y + (Math.random() * 40 - 20),
          size: 10 + Math.random() * 30,
          duration: 0.6 + Math.random() * 0.4,
          delay: i * 50
        }
      ]);
    }

    setTimeout(() => {
      navigate(ROUTES.MAIN);
    }, 1000);
  };

  const removeRippleEffect = (id) => {
    setRippleEffects(prev => prev.filter(effect => effect.id !== id));
  };

  return (
    <div
      className={`play-button-container ${isVisible ? 'play-button-visible' : ''} ${isClicked ? 'play-button-clicked' : ''}`}
      onClick={handleClick}
      ref={buttonRef}
    >
      <div className="play-button-circle">
        <div className="play-button-triangle" />

        {rippleEffects.map(effect => (
          <div
            key={effect.id}
            className="play-button-ripple"
            style={{
              left: `${effect.x}px`,
              top: `${effect.y}px`,
              width: `${effect.size}px`,
              height: `${effect.size}px`,
              animationDuration: `${effect.duration}s`,
              animationDelay: `${effect.delay}ms`
            }}
            onAnimationEnd={() => removeRippleEffect(effect.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default PlayButton;
