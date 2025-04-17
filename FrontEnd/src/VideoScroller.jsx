import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
} from 'react';
import videosData from '/public/videos.json';

const FAST_RATE = 4;
const RAMP_MS = 300;
const END_SLOW_WINDOW = 2;
const WHEEL_COOLDOWN = 200;
const REWIND_INTERVAL_MS = 40;
const REWIND_STEP_SEC = 0.25;

export default function VideoScroller() {
    const sortedVideos = useMemo(
        () => videosData.sort((a, b) => a.priority - b.priority),
        []
    );
    const [currentIndex, setCurrentIndex] = useState(0);

    const videoRef = useRef(null);
    const [remainingTime, setRemainingTime] = useState(
        sortedVideos[0]?.time ?? 0
    );

    const modeRef = useRef('idle');
    const nearEndCheckRef = useRef(null);
    const rewindTimerRef = useRef(null);
    const lastWheelTs = useRef(0);
    const rAF = useRef(null);

    const animateRate = useCallback((from, to, duration, onDone) => {
        if (!videoRef.current) return;
        const t0 = performance.now();
        const easeInOut = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

        const step = (now) => {
            const p = Math.min(1, (now - t0) / duration);
            const rate = from + (to - from) * easeInOut(p);
            videoRef.current.playbackRate = rate;
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
        if (!videoRef.current) return;
        clearAllTimers();
        modeRef.current = 'fastForward';

        const from = videoRef.current.playbackRate;
        animateRate(from, FAST_RATE, RAMP_MS);

        nearEndCheckRef.current = setInterval(() => {
            const vid = videoRef.current;
            if (!vid) return;
            const remaining = vid.duration - vid.currentTime;
            if (remaining <= END_SLOW_WINDOW) {
                clearInterval(nearEndCheckRef.current);
                nearEndCheckRef.current = null;
                animateRate(FAST_RATE, 1, RAMP_MS, () => {
                    modeRef.current = 'idle';
                });
            }
        }, 200);
    }, [animateRate, clearAllTimers]);

    const startRewind = useCallback(() => {
        if (!videoRef.current) return;
        clearAllTimers();
        modeRef.current = 'rewind';

        const vid = videoRef.current;
        vid.pause();

        let ticks = 0;
        rewindTimerRef.current = setInterval(() => {
            const dynamicStep =
                ticks < 15 ? (REWIND_STEP_SEC * (ticks / 15)) : REWIND_STEP_SEC;
            const step = dynamicStep * (FAST_RATE / 2);
            vid.currentTime = Math.max(vid.currentTime - step, 0);
            setRemainingTime(vid.duration - vid.currentTime);
            ticks += 1;

            if (vid.currentTime <= 0.05) {
                clearInterval(rewindTimerRef.current);
                rewindTimerRef.current = null;
                if (currentIndex > 0) {
                    const prev = currentIndex - 1;
                    setCurrentIndex(prev);
                    setRemainingTime(sortedVideos[prev].time);
                } else {
                    vid.currentTime = 0;
                    vid.playbackRate = 1;
                    vid.play().catch(() => {});
                }
                modeRef.current = 'idle';
            }
        }, REWIND_INTERVAL_MS);
    }, [clearAllTimers, currentIndex, sortedVideos]);

    useEffect(() => {
        const onWheel = (e) => {
            e.preventDefault();
            const now = performance.now();
            if (now - lastWheelTs.current < WHEEL_COOLDOWN) return;
            if (modeRef.current !== 'idle') return;
            lastWheelTs.current = now;

            if (e.deltaY < 0) {
                startRewind();
            } else if (e.deltaY > 0) {
                startFastForward();
            }
        };
        window.addEventListener('wheel', onWheel, { passive: false });
        return () => window.removeEventListener('wheel', onWheel);
    }, [startFastForward, startRewind]);

    useEffect(() => {
        const id = setInterval(() => {
            if (!videoRef.current) return;
            setRemainingTime(
                Math.max(videoRef.current.duration - videoRef.current.currentTime, 0)
            );
        }, 100);
        return () => clearInterval(id);
    }, []);

    const handleEnded = useCallback(() => {
        if (currentIndex < sortedVideos.length - 1) {
            const next = currentIndex + 1;
            setCurrentIndex(next);
            setRemainingTime(sortedVideos[next].time);
        }
    }, [currentIndex, sortedVideos]);

    useEffect(() => {
        const vid = videoRef.current;
        if (!vid) return;
        clearAllTimers();
        modeRef.current = 'idle';
        vid.playbackRate = 1;
        vid.load();
        vid.play().catch(() => {});
    }, [currentIndex, clearAllTimers]);

    return (
        <div className="flex flex-col items-center gap-4">
            <video
                ref={videoRef}
                muted
                autoPlay
                onEnded={handleEnded}
                className="max-w-full h-auto rounded-2xl shadow"
            >
                <source
                    src={sortedVideos[currentIndex].video_path}
                    type="video/mp4"
                />
            </video>
            <div className="text-sm text-gray-700">
                Осталось времени: {remainingTime.toFixed(1)} сек.
            </div>
        </div>
    );
}
