import React, { Component } from 'react';
import { getStepById, getNextStep, getPrevStep, getStepByIndex } from '../../data/steps.jsx';
import '../../styles/videoPlayer.scss';

const FAST_RATE = 3;
const NORMAL_RATE = 1;
const RAMP_MS = 300;
const SCROLL_COOLDOWN = 1000;
const TRANSITION_DURATION = 1500;
const SKIP_TO_END_THRESHOLD = 2;

class VideoPlayer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentChapter: getStepByIndex(0),
      chapterIndex: 0,
      isScrollLocked: false,
      transitionState: 'idle',
      remainingTime: 0
    };

    this.videoRef = React.createRef();
    this.containerRef = React.createRef();

    this.rateAnimationId = null;
    this.scrollLockTimerId = null;
    this.transitionTimerId = null;
    this.lastScrollTime = 0;

    this.handleScroll = this.handleScroll.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.goToNextChapter = this.goToNextChapter.bind(this);
    this.goToPrevChapter = this.goToPrevChapter.bind(this);
    this.animatePlaybackRate = this.animatePlaybackRate.bind(this);
    this.clearTimers = this.clearTimers.bind(this);
  }

  componentDidMount() {
    document.body.style.overflow = 'hidden';

    window.addEventListener('wheel', this.handleScroll, { passive: false });
    window.addEventListener('keydown', this.handleKeyDown);

    const video = this.videoRef.current;
    if (video) {
      video.src = `/assets/videos/${this.state.currentChapter.videoId}.mp4`;
      video.addEventListener('loadedmetadata', this.handleVideoLoaded);
      video.addEventListener('ended', this.handleVideoEnded);
      video.addEventListener('timeupdate', this.handleTimeUpdate);
    }

    // Уведомляем родительский компонент о текущей главе
    if (this.props.onChapterChange) {
      this.props.onChapterChange(this.state.currentChapter.id);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.currentChapter !== this.state.currentChapter) {
      const video = this.videoRef.current;
      if (!video) return;

      console.log(`Загрузка видео: ${this.state.currentChapter.videoId}.mp4`);

      this.setState({ transitionState: 'loading' });

      video.src = `/assets/videos/${this.state.currentChapter.videoId}.mp4`;

      const handleLoaded = () => {
        console.log("Видео загружено");

        video.playbackRate = NORMAL_RATE;
        video.currentTime = 0;

        this.setState({ remainingTime: video.duration - video.currentTime });

        setTimeout(() => {
          video.play()
            .then(() => console.log("Воспроизведение успешно запущено"))
            .catch(err => console.error('Ошибка воспроизведения:', err));
        }, 50);

        this.setState({ transitionState: 'idle' });
        video.removeEventListener('loadedmetadata', handleLoaded);
      };

      video.addEventListener('loadedmetadata', handleLoaded);
    }
  }

  componentWillUnmount() {
    document.body.style.overflow = '';

    window.removeEventListener('wheel', this.handleScroll);
    window.removeEventListener('keydown', this.handleKeyDown);

    this.clearTimers();

    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }

    const video = this.videoRef.current;
    if (video) {
      video.removeEventListener('loadedmetadata', this.handleVideoLoaded);
      video.removeEventListener('ended', this.handleVideoEnded);
    }
  }

  handleVideoLoaded = () => {
    const video = this.videoRef.current;
    if (video) {
      this.setState({ remainingTime: video.duration });
      video.play().catch(err => console.error('Ошибка воспроизведения:', err));
    }
  };

  handleVideoEnded = () => {
    const nextChapter = getNextStep(this.state.currentChapter.id);
    if (nextChapter) {
      console.log(`Видео завершилось, переход к следующей главе: ${nextChapter.id}`);
      this.setState({
        currentChapter: nextChapter,
        chapterIndex: this.state.chapterIndex + 1
      });
    }
  };

  handleKeyDown(e) {
    if ((e.code === 'ArrowDown' || e.code === 'KeyS') && this.state.transitionState === 'idle') {
      this.goToNextChapter();
    } else if ((e.code === 'ArrowUp' || e.code === 'KeyW') && this.state.transitionState === 'idle') {
      this.goToPrevChapter();
    }
  }

  handleScroll(e) {
    e.preventDefault();
    e.stopPropagation();

    if (this.state.transitionState !== 'idle' || this.state.isScrollLocked) {
      return;
    }

    const now = Date.now();
    if (now - this.lastScrollTime < 150) return;
    this.lastScrollTime = now;

    console.log(`Скролл: ${e.deltaY}`);

    if (e.deltaY > 0) {
      this.goToNextChapter();
    } else if (e.deltaY < 0) {
      this.goToPrevChapter();
    }
  }

  animatePlaybackRate(from, to, duration, onComplete) {
    const video = this.videoRef.current;
    if (!video) return;

    if (this.rateAnimationId) {
      cancelAnimationFrame(this.rateAnimationId);
    }

    const startTime = performance.now();

    const easeInOut = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const animate = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      video.playbackRate = from + (to - from) * easeInOut(progress);

      if (progress < 1) {
        this.rateAnimationId = requestAnimationFrame(animate);
      } else {
        video.playbackRate = to;
        if (onComplete) onComplete();
      }
    };

    this.rateAnimationId = requestAnimationFrame(animate);
  }

  clearTimers() {
    if (this.rateAnimationId) {
      cancelAnimationFrame(this.rateAnimationId);
      this.rateAnimationId = null;
    }

    if (this.scrollLockTimerId) {
      clearTimeout(this.scrollLockTimerId);
      this.scrollLockTimerId = null;
    }

    if (this.transitionTimerId) {
      clearTimeout(this.transitionTimerId);
      this.transitionTimerId = null;
    }
  }

  goToNextChapter() {
    const video = this.videoRef.current;
    if (!video) return;

    const nextChapter = getNextStep(this.state.currentChapter.id);
    if (!nextChapter) return;

    console.log(`Переход к следующей главе: ${nextChapter.id}`);

    this.setState({
      isScrollLocked: true,
      transitionState: 'forward'
    });

    this.clearTimers();

    this.animatePlaybackRate(NORMAL_RATE, FAST_RATE, RAMP_MS, () => {
      const timeLeft = video.duration - video.currentTime;
      console.log(`Оставшееся время: ${timeLeft} сек`);

      if (timeLeft < SKIP_TO_END_THRESHOLD) {
        this.animatePlaybackRate(FAST_RATE, NORMAL_RATE, RAMP_MS, () => {
          this.setState({ transitionState: 'idle' });
        });
      } else {
        const transitionTime = Math.min(timeLeft * 1000 / FAST_RATE, TRANSITION_DURATION);
        const timeBeforeSlow = transitionTime - RAMP_MS;

        if (timeBeforeSlow > 0) {
          this.transitionTimerId = setTimeout(() => {
            this.animatePlaybackRate(FAST_RATE, NORMAL_RATE, RAMP_MS, () => {
              this.setState({
                currentChapter: nextChapter,
                chapterIndex: this.state.chapterIndex + 1,
                transitionState: 'loading'
              });
            });
          }, timeBeforeSlow);
        } else {
          this.animatePlaybackRate(FAST_RATE, NORMAL_RATE, RAMP_MS, () => {
            this.setState({
              currentChapter: nextChapter,
              chapterIndex: this.state.chapterIndex + 1,
              transitionState: 'loading'
            });
          });
        }
      }
    });

    this.scrollLockTimerId = setTimeout(() => {
      this.setState({ isScrollLocked: false });
    }, SCROLL_COOLDOWN);
  }

  goToPrevChapter() {
    const video = this.videoRef.current;
    if (!video) return;

    const prevChapter = getPrevStep(this.state.currentChapter.id);
    if (!prevChapter) return;

    console.log(`Переход к предыдущей главе: ${prevChapter.id}`);

    this.setState({
      isScrollLocked: true,
      transitionState: 'backward'
    });

    this.clearTimers();

    const currentTime = video.currentTime;

    if (currentTime < 2) {
      this.setState({
        currentChapter: prevChapter,
        chapterIndex: this.state.chapterIndex - 1
      });
    } else {
      video.pause();

      const stepsToBeginning = Math.min(20, Math.floor(currentTime * 10));
      const stepTime = currentTime / stepsToBeginning;
      let step = 0;

      const rewindInterval = setInterval(() => {
        if (step >= stepsToBeginning) {
          clearInterval(rewindInterval);
          this.setState({
            currentChapter: prevChapter,
            chapterIndex: this.state.chapterIndex - 1
          });
          return;
        }

        step++;
        video.currentTime = Math.max(0, currentTime - step * stepTime);
      }, 50);
    }

    this.scrollLockTimerId = setTimeout(() => {
      this.setState({ isScrollLocked: false });
    }, SCROLL_COOLDOWN);
  }

  updateCurrentChapter(chapter) {
    this.setState({ currentChapter: chapter }, () => {
      // Уведомляем родительский компонент о смене главы
      if (this.props.onChapterChange) {
        this.props.onChapterChange(chapter.id);
      }
    });
  }

  render() {
    return (
      <div className="video-player-container" ref={this.containerRef}>
        <video
          ref={this.videoRef}
          className="main-video"
          playsInline
          muted
        />

        <div className="test-controls" style={{
          position: 'absolute',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
          zIndex: 10
        }}>
          <button
            onClick={this.goToPrevChapter}
            style={{
              padding: '8px 15px',
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Назад
          </button>
          <button
            onClick={this.goToNextChapter}
            style={{
              padding: '8px 15px',
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Вперёд
          </button>
        </div>

        <div className="chapter-indicator">
          {Array(6).fill(0).map((_, index) => (
            <div
              key={index}
              className={`chapter-dot ${index === this.state.chapterIndex ? 'active' : ''}`}
              title={`Глава ${index + 1}`}
            />
          ))}
        </div>

        <div className="chapter-title">
          {this.state.currentChapter?.title}
        </div>

        <div className="remaining-time" style={{ display: 'none' }}>
          {this.state.remainingTime.toFixed(1)} сек.
        </div>
      </div>
    );
  }
}

export default VideoPlayer;
