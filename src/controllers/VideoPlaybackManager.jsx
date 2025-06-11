import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
} from 'react';
import videosData from '/public/videos.json';

const FAST_RATE = 4;            // максимальная скорость ускорения
const NORMAL_RATE = 1;          // нормальная скорость воспроизведения
const RAMP_MS = 300;            // время плавного разгона/торможения
const END_SLOW_WINDOW = 1.5;    // до скольки секунд до конца начинаем замедлять
const START_SLOW_WINDOW = 1.5;  // до скольки секунд от начала начинаем ускорять
const WHEEL_COOLDOWN = 200;     // группировка событий wheel в «щёлк»
const TRANSITION_TIME = 1500;   // максимальное время перехода между главами
const BACKWARD_RATE = -4;       // скорость при обратном воспроизведении

export default function VideoScroller() {
    const sortedVideos = useMemo(
        () => videosData.sort((a, b) => a.priority - b.priority),
        []
    );
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentIndexRef = useRef(0);
    const [remainingTime, setRemainingTime] = useState(sortedVideos[0]?.time ?? 0);
    const [direction, setDirection] = useState('forward'); // 'forward' или 'backward'

    const videoRef = useRef(null);
    const modeRef = useRef('idle'); // 'idle', 'fastForward', 'rewind'
    const transitionTimerRef = useRef(null);
    const lastWheelTs = useRef(0);
    const rAF = useRef(null);
    const isTransitioningRef = useRef(false);

    const animateRate = useCallback((from, to, duration, onDone) => {
        if (!videoRef.current) return;
        const t0 = performance.now();

        const ease = t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

        const step = now => {
            const p = Math.min(1, (now - t0) / duration);
            videoRef.current.playbackRate = from + (to - from) * ease(p);

            if (p < 1) {
                rAF.current = requestAnimationFrame(step);
            } else {
                videoRef.current.playbackRate = to; // Убедимся, что конечная скорость точная
                if (onDone) {
                    onDone();
                }
            }
        };

        rAF.current = requestAnimationFrame(step);
    }, []);

    const clearAllTimers = useCallback(() => {
        if (transitionTimerRef.current) {
            clearTimeout(transitionTimerRef.current);
            transitionTimerRef.current = null;
        }
        if (rAF.current) {
            cancelAnimationFrame(rAF.current);
            rAF.current = null;
        }
    }, []);

    const goToNextChapter = useCallback(() => {
        const vid = videoRef.current;
        if (!vid || isTransitioningRef.current) return;
        if (currentIndexRef.current >= sortedVideos.length - 1) return;

        isTransitioningRef.current = true;
        setDirection('forward');
        modeRef.current = 'fastForward';
        clearAllTimers();

        animateRate(NORMAL_RATE, FAST_RATE, RAMP_MS, () => {
            const timeLeft = vid.duration - vid.currentTime;

            if (timeLeft < END_SLOW_WINDOW) {
                animateRate(FAST_RATE, NORMAL_RATE, RAMP_MS, () => {
                    modeRef.current = 'idle';
                });
            } else {
                const transitionTime = Math.min(timeLeft * 1000 / FAST_RATE, TRANSITION_TIME);

                const timeBeforeSlow = transitionTime - RAMP_MS;

                if (timeBeforeSlow > 0) {
                    transitionTimerRef.current = setTimeout(() => {
                        animateRate(FAST_RATE, NORMAL_RATE, RAMP_MS, () => {
                            setCurrentIndex(prev => prev + 1);
                            isTransitioningRef.current = false;
                            modeRef.current = 'idle';
                        });
                    }, timeBeforeSlow);
                } else {
                    // Если времени мало, сразу начинаем замедление
                    animateRate(FAST_RATE, NORMAL_RATE, RAMP_MS, () => {
                        setCurrentIndex(prev => prev + 1);
                        isTransitioningRef.current = false;
                        modeRef.current = 'idle';
                    });
                }
            }
        });
    }, [animateRate, clearAllTimers, sortedVideos.length]);

    const goToPrevChapter = useCallback(() => {
        const vid = videoRef.current;
        if (!vid || isTransitioningRef.current) return;
        if (currentIndexRef.current <= 0) return;

        isTransitioningRef.current = true;
        setDirection('backward');
        modeRef.current = 'rewind';
        clearAllTimers();

        if (vid.currentTime < START_SLOW_WINDOW) {
            setCurrentIndex(prev => prev - 1);
            isTransitioningRef.current = false;
            return;
        }

        vid.pause();

        const playBackward = () => {
            animateRate(0, BACKWARD_RATE, RAMP_MS, () => {
                const backwardInterval = setInterval(() => {
                    if (!videoRef.current) {
                        clearInterval(backwardInterval);
                        return;
                    }

                    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime + BACKWARD_RATE / 20);
                    setRemainingTime(videoRef.current.duration - videoRef.current.currentTime);

                    if (videoRef.current.currentTime <= 0.05) {
                        clearInterval(backwardInterval);
                        setCurrentIndex(prev => prev - 1);
                        isTransitioningRef.current = false;
                        modeRef.current = 'idle';
                    }
                    else if (videoRef.current.currentTime <= START_SLOW_WINDOW) {
                        clearInterval(backwardInterval);

                        // Плавное замедление при приближении к началу
                        animateRate(BACKWARD_RATE, 0, RAMP_MS, () => {
                            setCurrentIndex(prev => prev - 1);
                            isTransitioningRef.current = false;
                            modeRef.current = 'idle';
                        });
                    }
                }, 50);
            });
        };

        playBackward();
    }, [animateRate, clearAllTimers]);

    useEffect(() => {
        const onWheel = e => {
            e.preventDefault();
            const now = performance.now();

            if (now - lastWheelTs.current < WHEEL_COOLDOWN) return;
            if (modeRef.current !== 'idle' || isTransitioningRef.current) return;

            lastWheelTs.current = now;

            if (e.deltaY > 0) {
                goToNextChapter();
            } else if (e.deltaY < 0) {
                goToPrevChapter();
            }
        };

        window.addEventListener('wheel', onWheel, { passive: false });
        return () => window.removeEventListener('wheel', onWheel);
    }, [goToNextChapter, goToPrevChapter]);

    useEffect(() => {
        const id = setInterval(() => {
            const vid = videoRef.current;
            if (!vid) return;
            setRemainingTime(Math.max(vid.duration - vid.currentTime, 0));
        }, 100);
        return () => clearInterval(id);
    }, []);

    const handleEnded = useCallback(() => {
        if (currentIndexRef.current < sortedVideos.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    }, [sortedVideos.length]);

    useEffect(() => {
        currentIndexRef.current = currentIndex;

        const vid = videoRef.current;
        if (!vid) return;

        clearAllTimers();
        modeRef.current = 'idle';
        isTransitioningRef.current = false;

        vid.playbackRate = NORMAL_RATE;
        vid.load();

        const metaReady = () => {
            if (direction === 'backward' && !isTransitioningRef.current) {
                vid.currentTime = Math.max(vid.duration - 0.1, 0);
            } else {
                vid.currentTime = 0;
            }

            setRemainingTime(vid.duration - vid.currentTime);
            vid.play().catch(() => {});
        };

        vid.addEventListener('loadedmetadata', metaReady, { once: true });

        return () => {
            vid.removeEventListener('loadedmetadata', metaReady);
        };
    }, [currentIndex, clearAllTimers, direction]);

    return (
        <div className="flex flex-col items-center gap-4 select-none">
            <video
                ref={videoRef}
                muted
                autoPlay
                onEnded={handleEnded}
                className="max-w-full h-auto rounded-2xl shadow"
            >
                <source src={sortedVideos[currentIndex].video_path} type="video/mp4" />
            </video>

            <div className="text-sm text-gray-700">
                Осталось времени: {remainingTime.toFixed(1)}&nbsp;сек.
            </div>
        </div>
    );
}
