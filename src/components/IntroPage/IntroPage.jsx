import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/theme';
import './../../styles/index.scss';
import WelcomeScreen from './WelcomeScreen';

const IntroPage = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate(ROUTES.MAIN);
  };

  return (
    <div className="noise-background" style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <WelcomeScreen />
    </div>
  );
};

export default IntroPage;




