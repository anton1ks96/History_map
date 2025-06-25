import React, { useState, useEffect, useRef, useCallback } from 'react';

const videosJsonUrl = '/videos.json';

const PLAYER_STATES = {
  LOADING: 'loading',
  PLAYING: 'playing',
  PAUSED: 'paused',
  FAST_FORWARD: 'fastForward',
  REWIND: 'rewind',
  TRANSITIONING: 'transitioning'
};

const StageManager = ({ onStateChange, onVideoChange }) => {
  const [currentState, setCurrentState] = useState(PLAYER_STATES.LOADING);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [nextVideoIndex, setNextVideoIndex] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutRef = useRef(null);
  const [sortedVideos, setSortedVideos] = useState([]);

  useEffect(() => {
    fetch(videosJsonUrl)
      .then(response => response.json())
      .then(data => {
        const processedData = data.map(video => ({
          ...video,
          video_path: video.video_path.startsWith('/') ? video.video_path : `/${video.video_path}`
        }));
        setSortedVideos(processedData.sort((a, b) => a.priority - b.priority));
      })
      .catch(error => {
        console.error('Error loading videos data:', error);
      });
  }, []);

  useEffect(() => {
    if (onStateChange) {
      onStateChange(currentState);
    }
  }, [currentState, onStateChange]);

  useEffect(() => {
    if (onVideoChange && sortedVideos.length > 0) {
      onVideoChange(sortedVideos[currentVideoIndex]);
    }
  }, [currentVideoIndex, onVideoChange, sortedVideos]);

  // Функция для подготовки следующего видео
  const prepareNextVideo = useCallback((nextIndex) => {
    setNextVideoIndex(nextIndex);
    setIsTransitioning(true);
    setCurrentState(PLAYER_STATES.TRANSITIONING);

    timeoutRef.current = setTimeout(() => {
      setCurrentVideoIndex(nextIndex);
      setNextVideoIndex(null);
      setIsTransitioning(false);
      setCurrentState(PLAYER_STATES.PLAYING);
    }, 300);
  }, []);

  const goToNextVideo = useCallback(() => {
    if (currentVideoIndex < sortedVideos.length - 1) {
      prepareNextVideo(currentVideoIndex + 1);
    }
  }, [currentVideoIndex, prepareNextVideo, sortedVideos.length]);

  const goToPreviousVideo = useCallback(() => {
    if (currentVideoIndex > 0) {
      prepareNextVideo(currentVideoIndex - 1);
    }
  }, [currentVideoIndex, prepareNextVideo]);

  const goToVideo = useCallback((index) => {
    if (index >= 0 && index < sortedVideos.length && index !== currentVideoIndex) {
      prepareNextVideo(index);
    }
  }, [currentVideoIndex, prepareNextVideo, sortedVideos.length]);

  const setPlayerState = useCallback((newState) => {
    setCurrentState(newState);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    currentState,
    currentVideoIndex,
    currentVideo: sortedVideos[currentVideoIndex],
    nextVideoIndex,
    nextVideo: nextVideoIndex !== null ? sortedVideos[nextVideoIndex] : null,
    isTransitioning,
    setPlayerState,
    goToNextVideo,
    goToPreviousVideo,
    goToVideo,
    allVideos: sortedVideos
  };
};

export default StageManager;
