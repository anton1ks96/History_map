import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.scss';
import AppRoutes from './routes/routes';

// Глобальный обработчик для воспроизведения клика
const clickSound = new Audio('/assets/audio/ui-click.mp3');
clickSound.volume = 0.5; // Можно настроить громкость

document.addEventListener('pointerdown', () => {
  // Для одновременных кликов создаём новый объект
  const sound = clickSound.cloneNode();
  sound.play();
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </React.StrictMode>
);
