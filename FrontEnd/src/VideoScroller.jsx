import React, {useState, useEffect, useRef, useCallback, } from 'react';
import videosData from '/public/videos.json';

const minRate = 0.25;
const maxRate = 3;
const rateStep = 0.03;
const rateSmooth = 0.05;
const idleTimeout = 5000;
const wheelThreshold = 40;
const wheelCooldown = 200;

export default function VideoScroller() {
    const sortedVideos = videosData.sort((a, b) => a.priority - b.priority);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [realRemaining, setRealRemaining] = useState(sortedVideos[0].time);
    const videoRef = useRef(null);
    const targetRate = useRef(1);
    const idleTimer = useRef(null);
    const lastWheelAt = useRef(0);

    const onWheel = useCallback((e) => {
        const now = Date.now();
        if (now - lastWheelAt.current < wheelCooldown) return;

        if (Math.abs(e.deltaY) < wheelThreshold) return;

        lastWheelAt.current = now;

        if (idleTimer.current) clearTimeout(idleTimer.current);

        if (e.deltaY < 0) {
            targetRate.current = Math.min(maxRate, targetRate.current + rateStep);
        } else {
            targetRate.current = Math.max(minRate, targetRate.current - rateStep);
        }

        idleTimer.current = setTimeout(() => {
            targetRate.current = 1;
        }, idleTimeout);
    }, []);

    useEffect(() => {
        let raf;
        const smoothStep = () => {
            const v = videoRef.current;
            if (v) {
                const diff = targetRate.current - v.playbackRate;
                if (Math.abs(diff) > 0.01) {
                    v.playbackRate += diff * rateSmooth;
                }
            }
            raf = requestAnimationFrame(smoothStep);
        };
        raf = requestAnimationFrame(smoothStep);
        return () => cancelAnimationFrame(raf);
    }, []);

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;

        const calcRemaining = () => {
            const remainingVideoSeconds = Math.max(v.duration - v.currentTime, 0);
            const real = remainingVideoSeconds / v.playbackRate;
            setRealRemaining(real);
        };

        calcRemaining();
        v.addEventListener('timeupdate', calcRemaining);
        v.addEventListener('ratechange', calcRemaining);
        return () => {
            v.removeEventListener('timeupdate', calcRemaining);
            v.removeEventListener('ratechange', calcRemaining);
        };
    }, [currentIndex]);

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        const next = () => {
            if (currentIndex < sortedVideos.length - 1) {
                setCurrentIndex((i) => i + 1);
            }
        };
        v.addEventListener('ended', next);
        return () => v.removeEventListener('ended', next);
    }, [currentIndex, sortedVideos.length]);

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        v.load();
        v.play();
        v.playbackRate = 1;
        targetRate.current = 1;
    }, [currentIndex]);

    useEffect(() => {
        window.addEventListener('wheel', onWheel, { passive: true });
        return () => window.removeEventListener('wheel', onWheel);
    }, [onWheel]);

    return (
        <div className="videos">
            <video
                ref={videoRef}
                muted
                autoPlay
                playsInline
                className="video"
            >
                <source
                    src={sortedVideos[currentIndex].video_path}
                    type="video/mp4"
                />
            </video>

            <div className="text-timer">
                Осталось: {realRemaining.toFixed(1)} &nbsp;·&nbsp; скорость ×{
                videoRef.current?.playbackRate.toFixed(2) ?? '1.00'
            }
            </div>
        </div>
    );
}
