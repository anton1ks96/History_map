import React, { useState, useEffect, useRef } from 'react';
import videosData from '/public/videos.json';

export default function VideoScroller() {
    const sortedVideos = videosData.sort((a, b) => a.priority - b.priority);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [remainingTime, setRemainingTime] = useState(sortedVideos[0].time);
    const videoRef = useRef(null);
    const lastScrollY = useRef(window.scrollY);

    useEffect(() => {
        const timer = setInterval(() => {
            setRemainingTime(prev => {
                if (prev <= 0.1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 0.1;
            });
        }, 100);

        return () => clearInterval(timer);
    }, [currentIndex]);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const deltaScroll = Math.abs(currentScrollY - lastScrollY.current);
            lastScrollY.current = currentScrollY;

            const accelerationFactor = 0.05;
            setRemainingTime(prev => Math.max(prev - deltaScroll * accelerationFactor, 0));
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (remainingTime <= 0 && currentIndex < sortedVideos.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setRemainingTime(sortedVideos[currentIndex + 1].time);
        }
    }, [remainingTime]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.play();
        }
    }, [currentIndex]);

    return (
        <div>
            <video ref={videoRef} muted autoPlay>
                <source src={sortedVideos[currentIndex].video_path} type="video/mp4" />
            </video>
            <div>
                Осталось времени: {Math.max(remainingTime.toFixed(1), 0)} сек.
            </div>
        </div>
    );
}