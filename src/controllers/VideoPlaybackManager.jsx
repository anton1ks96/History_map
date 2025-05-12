import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
} from 'react';
import videosData from '/public/videos.json';

const FAST_RATE = 4;            // максимальная скорость ускорения
const RAMP_MS = 300;            // время плавного разгона/торможения
const END_SLOW_WINDOW = 2;      // до скольки секунд до конца начинаем замедлять
const WHEEL_COOLDOWN = 200;     // группировка событий wheel в «щёлк»
const REWIND_INTERVAL_MS = 40;  // тик «ручного» перематывания назад
const REWIND_STEP_SEC = 0.25;   // «базовый» шаг перемотки назад

export default function VideoScroller() {
    const sortedVideos = useMemo(
        () => videosData.sort((a, b) => a.priority - b.priority),
        []
    );
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentIndexRef = useRef(0);
    const [remainingTime, setRemainingTime] = useState(sortedVideos[0]?.time ?? 0);

    const videoRef           = useRef(null);
    const modeRef            = useRef('idle');
    const nearEndCheckRef    = useRef(null);
    const rewindTimerRef     = useRef(null);
    const lastWheelTs        = useRef(0);
    const rAF                = useRef(null);

    const animateRate = useCallback((from, to, duration, onDone) => {
        if (!videoRef.current) return;
        const t0 = performance.now();
        const ease = t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

        const step = now => {
            const p = Math.min(1, (now - t0) / duration);
            videoRef.current.playbackRate = from + (to - from) * ease(p);
            if (p < 1) {
                rAF.current = requestAnimationFrame(step);
            } else if (onDone) {
                onDone();
            }
        };
        rAF.current = requestAnimationFrame(step);
    }, []);

    const clearAllTimers = useCallback(() => {
        if (nearEndCheckRef.current) {
            clearInterval(nearEndCheckRef.current);
            nearEndCheckRef.current = null;
        }
        if (rewindTimerRef.current) {
            clearInterval(rewindTimerRef.current);
            rewindTimerRef.current = null;
        }
        if (rAF.current) {
            cancelAnimationFrame(rAF.current);
            rAF.current = null;
        }
    }, []);

    const startFastForward = useCallback(() => {
        const vid = videoRef.current;
        if (!vid) return;

        clearAllTimers();
        modeRef.current = 'fastForward';

        animateRate(vid.playbackRate, FAST_RATE, RAMP_MS);

        nearEndCheckRef.current = setInterval(() => {
            if (!videoRef.current) return;
            const remaining = vid.duration - vid.currentTime;
            if (remaining <= END_SLOW_WINDOW) {
                clearInterval(nearEndCheckRef.current);
                nearEndCheckRef.current = null;
                animateRate(FAST_RATE, 1, RAMP_MS, () => (modeRef.current = 'idle'));
            }
        }, 200);
    }, [animateRate, clearAllTimers]);

    const startRewind = useCallback(() => {
        const vid = videoRef.current;
        if (!vid) return;

        clearAllTimers();
        modeRef.current = 'rewind';
        vid.pause();

        let ticks = 0;
        rewindTimerRef.current = setInterval(() => {
            const dynamicStep = ticks < 15 ? (REWIND_STEP_SEC * (ticks / 15)) : REWIND_STEP_SEC;
            const step = dynamicStep * (FAST_RATE / 2);
            vid.currentTime = Math.max(vid.currentTime - step, 0);

            setRemainingTime(vid.duration - vid.currentTime);
            ticks += 1;

            if (vid.currentTime <= 0.05) {
                clearInterval(rewindTimerRef.current);
                rewindTimerRef.current = null;

                if (currentIndexRef.current > 0) {
                    setCurrentIndex(prev => prev - 1);
                } else {
                    vid.currentTime = 0;
                    vid.playbackRate = 1;
                    vid.play().catch(() => {});
                    modeRef.current = 'idle';
                }
            }
        }, REWIND_INTERVAL_MS);
    }, [clearAllTimers]);

    useEffect(() => {
        const onWheel = e => {
            e.preventDefault();
            const now = performance.now();
            if (now - lastWheelTs.current < WHEEL_COOLDOWN) return;
            if (modeRef.current !== 'idle') return;

            lastWheelTs.current = now;
            if (e.deltaY > 0) {
                startFastForward();
            } else if (e.deltaY < 0) {
                startRewind();
            }
        };

        window.addEventListener('wheel', onWheel, { passive: false });
        return () => window.removeEventListener('wheel', onWheel);
    }, [startFastForward, startRewind]);

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

        vid.playbackRate = 1;
        vid.load();
        vid.play().catch(() => {});

        const metaReady = () => setRemainingTime(vid.duration);
        vid.addEventListener('loadedmetadata', metaReady, { once: true });
    }, [currentIndex, clearAllTimers]);

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
