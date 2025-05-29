import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/theme';
import './../../styles/index.scss';

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
      <div className="main-container" style={{
        padding: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: '300px',
        minHeight: '200px'
      }}>
        <button
          className="button"
          onClick={handleStart}
        >
          начать
        </button>
      </div>
    </div>
  );
};

export default IntroPage;

