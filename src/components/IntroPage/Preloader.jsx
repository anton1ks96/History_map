import React, { useEffect, useState } from 'react';
import PlayButton from './PlayButton';
import LoadingNotifications from './LoadingNotifications';
import './../../styles/index.scss';

const Preloader = () => {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [extraDelayComplete, setExtraDelayComplete] = useState(false); // Состояние для дополнительной задержки

  const criticalResources = [
    '/assets/branding/logo-square.png',
    '/assets/branding/Logo.png',
    '/assets/ui/icons/HideInterface.svg',
    '/assets/ui/icons/Info.svg',
  ];

  const nonCriticalResources = [
    '/assets/ui/background-noise.png',
    '/assets/media/artem-contact.jpg',
    '/assets/media/ilya-contact.jpg',
    '/assets/media/ivan-contact.jpg',
    '/assets/ui/click-btn.png',
    '/assets/ui/scroll-btn.png',
  ];

  useEffect(() => {
    // Загрузка ресурсов
    const loadResources = async () => {
      try {
        const criticalImagePromises = criticalResources.map(src => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ src, status: 'loaded' });
            img.onerror = () => reject({ src, status: 'error' });
            img.fetchPriority = 'high';
            img.src = src;
          });
        });

        const cacheResources = (resources) => {
          resources.forEach(src => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
              try {
                localStorage.setItem(`resource_${src}`, Date.now().toString());
              } catch (e) {
                console.warn('LocalStorage недоступен:', e);
              }
            };
          });
        };

        let loadedCriticalResources = 0;
        const totalCriticalResources = criticalImagePromises.length;

        for (const promise of criticalImagePromises) {
          try {
            await promise;
            loadedCriticalResources++;
            const criticalProgress = Math.round((loadedCriticalResources / totalCriticalResources) * 30);
            setProgress(criticalProgress);
          } catch (error) {
            console.error('Ошибка при загрузке критического ресурса:', error);
          }
        }

        fetch('/videos.json').catch(error => console.error('Не удалось загрузить videos.json:', error));

        const nonCriticalImagePromises = nonCriticalResources.map(src => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ src, status: 'loaded' });
            img.onerror = () => resolve({ src, status: 'error' });
            img.fetchPriority = 'low';
            img.src = src;
          });
        });

        Promise.allSettled(nonCriticalImagePromises).then(results => {
          setProgress(70);

          const simulateRemainingProgress = () => {
            const startProgress = 70;
            const endProgress = 100;
            const duration = 4000;
            const startTime = Date.now();

            const animateProgress = () => {
              const elapsedTime = Date.now() - startTime;
              const progress = Math.min(
                startProgress + ((endProgress - startProgress) * elapsedTime) / duration,
                endProgress
              );

              setProgress(Math.floor(progress));

              if (progress < endProgress) {
                requestAnimationFrame(animateProgress);
              } else {
                finishLoading();
              }
            };

            requestAnimationFrame(animateProgress);
          };

          simulateRemainingProgress();

          cacheResources(nonCriticalResources);
        });

      } catch (error) {
        console.error('Ошибка при загрузке ресурсов:', error);
        setTimeout(() => {
          setProgress(100);
          finishLoading();
        }, 1000);
      }
    };

    const finishLoading = () => {
      setTimeout(() => {
        setIsAnimatingOut(true);
        setTimeout(() => {
          setIsLoaded(true);
          setExtraDelayComplete(true);
        }, 600);
      }, 1500);
    };

    loadResources();
  }, []);

  const accessoryCircleSize = 340;
  const accessoryBorderWidth = 20;
  const strokeWidth = 50;

  const center = accessoryCircleSize / 2;
  const radius = center - accessoryBorderWidth - (strokeWidth / 2);
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="preloader-wrapper">
      {!isLoaded || !extraDelayComplete ? (
        <div className={`preloader-accessory-circle ${isAnimatingOut ? 'preloader-fade-out' : ''}`}>
          <svg className="preloader-svg" viewBox={`0 0 ${accessoryCircleSize} ${accessoryCircleSize}`}>
            {/* Круг прогресса */}
            <circle
              className="preloader-progress"
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#262626"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress / 100)}
              strokeLinecap="butt"
              transform={`rotate(-90 ${center} ${center})`}
            />
          </svg>

          {/* Логотип в центре */}
          <div className="preloader-inner-circle">
            <img
              src="/assets/branding/logo-square.png"
              alt="Logo"
              className="preloader-logo"
            />
          </div>
        </div>
      ) : (
        <PlayButton />
      )}

      <div className="preloader-content">
        <h1 className="preloader-title">БРУСИЛОВСКИЙ ПРОРЫВ</h1>

        {/* НОФИКЕЙШН */}
        <div className="notifications-wrapper">
          <LoadingNotifications loadingProgress={progress} />
        </div>
      </div>
    </div>
  );
};

export default Preloader;
