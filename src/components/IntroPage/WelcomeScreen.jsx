import React from 'react';
import ClickModeButton from './ClickModeButton';
import ScrollModeButton from './ScrollModeButton';
import Preloader from './Preloader';
import './../../styles/index.scss';

const WelcomeScreen = () => {
  return (
    <div className="welcome-screen">
      <div className="welcome-container">
        <div className="mode-selection">
          <div className="mode-option">
            <ClickModeButton />
          </div>

          <div className="mode-divider"></div>

          <div className="mode-option">
            <ScrollModeButton />
          </div>
        </div>
      </div>

      <div className="preloader-container">
        <Preloader />
      </div>
    </div>
  );
};

export default WelcomeScreen;

