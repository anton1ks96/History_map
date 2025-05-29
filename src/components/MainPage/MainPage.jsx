import React, { useState } from 'react';
import './../../styles/index.scss';
import InfoButton from './InfoButton';

const MainPage = () => {
  const [interfaceVisible, setInterfaceVisible] = useState(true);

  const toggleInterface = () => {
    setInterfaceVisible(!interfaceVisible);
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
            src="/assets/images/Logo.png"
            alt="Логотип"
            className="logo"
            style={{
              height: '40px',
              marginLeft: '60px'
            }}
          />

          <div className="top-panel-controls">
            <InfoButton />

            <div className="indicator-dot"></div>

            <button className="control-button hide-interface-button" onClick={toggleInterface}>
              <img src="/assets/vectors/HideInterface.svg" alt="Скрыть интерфейс" className="button-icon" />
              <span>Скрыть интерфейс</span>
            </button>
          </div>
        </div>

        <div className="content-area">
          {/* Здесь будет основной контент */}
        </div>

        <div className="control-panel bottom-panel">
          <div style={{ color: 'var(--color-text-primary)', opacity: 0.7 }}>Нижняя панель управления</div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;

