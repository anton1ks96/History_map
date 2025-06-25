import React, { Component } from 'react';
import { getNextStep, getPrevStep, getStepByIndex, getStepById, getAllSteps } from '../../data/steps.jsx';
import '../../styles/videoPlayer.scss';
import InteractiveMapStage from './InteractiveMapStage';
import ArticleStage from './ArticleStage';

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
      remainingTime: 0,
      activeVideo: 'main',
    };

    this.videoRef = React.createRef();
    this.reversedVideoRef = React.createRef();
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
    this.loadReversedVideo = this.loadReversedVideo.bind(this);
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

      const tempVideo = document.createElement('video');
      tempVideo.src = `/assets/videos/${this.state.currentChapter.videoId}.mp4`;
      tempVideo.muted = true;
      tempVideo.preload = 'auto';
      tempVideo.style.display = 'none';
      document.body.appendChild(tempVideo);

      tempVideo.addEventListener('canplaythrough', () => {
        console.log("Видео предзагружено, устанавливаем источник основного видео");

        const originalOpacity = video.style.opacity || 1;

        video.style.opacity = 0;
        video.src = `/assets/videos/${this.state.currentChapter.videoId}.mp4`;

        video.addEventListener('loadeddata', () => {
          console.log("Видео загружено и готово к воспроизведению");

          video.playbackRate = NORMAL_RATE;
          video.currentTime = 0;

          video.play()
            .then(() => {
              console.log("Воспроизведение запущено, выполняем плавный переход");
              video.style.transition = `opacity 500ms`;
              video.style.opacity = originalOpacity;

              this.setState({
                transitionState: 'idle',
                remainingTime: video.duration - video.currentTime
              });

              this.loadReversedVideo();
            })
            .catch(err => console.error('Ошибка воспроизведения:', err));

          document.body.removeChild(tempVideo);
        }, { once: true });
      }, { once: true });

      tempVideo.load();
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

      this.loadReversedVideo();
    }
  };

  handleVideoEnded = () => {
    const nextChapter = getNextStep(this.state.currentChapter.id);
    if (nextChapter) {
      console.log(`Видео завершилось, переход к следующей главе: ${nextChapter.id}`);
      this.setState({
        currentChapter: nextChapter,
        chapterIndex: this.state.chapterIndex + 1
      }, () => {
        if (this.props.onChapterChange) {
          this.props.onChapterChange(nextChapter.id);
        }
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

  animatePlaybackRate(from, to, duration, onComplete, targetVideo = 'current') {
    let video;
    if (targetVideo === 'main') {
      video = this.videoRef.current;
    } else if (targetVideo === 'reversed') {
      video = this.reversedVideoRef.current;
    } else {
      video = this.state.activeVideo === 'main' ?
        this.videoRef.current : this.reversedVideoRef.current;
    }

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

  loadReversedVideo() {
    const mainVideo = this.videoRef.current;
    const reversedVideo = this.reversedVideoRef.current;

    if (!mainVideo || !reversedVideo) return;

    const reversedSrc = `/assets/videos_reversed/${this.state.currentChapter.videoId}.mp4`;
    console.log(`Предзагрузка реверсивного видео: ${reversedSrc}`);

    reversedVideo.src = reversedSrc;
    reversedVideo.load();
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
              }, () => {
                if (this.props.onChapterChange) {
                  this.props.onChapterChange(nextChapter.id);
                }
              });
            });
          }, timeBeforeSlow);
        } else {
          this.animatePlaybackRate(FAST_RATE, NORMAL_RATE, RAMP_MS, () => {
            this.setState({
              currentChapter: nextChapter,
              chapterIndex: this.state.chapterIndex + 1,
              transitionState: 'loading'
            }, () => {
              if (this.props.onChapterChange) {
                this.props.onChapterChange(nextChapter.id);
              }
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
    const mainVideo = this.videoRef.current;
    const reversedVideo = this.reversedVideoRef.current;

    if (!mainVideo || !reversedVideo) return;

    const prevChapter = getPrevStep(this.state.currentChapter.id);
    const isFirstChapter = !prevChapter;

    console.log(`Переход назад ${isFirstChapter ? "(первая глава - возврат к началу)" : "к предыдущей главе"}`);

    this.setState({
      isScrollLocked: true,
      transitionState: 'backward'
    });

    this.clearTimers();

    const currentTime = mainVideo.currentTime;

    if (currentTime < 2 && !isFirstChapter) {
      this.setState({
        currentChapter: prevChapter,
        chapterIndex: this.state.chapterIndex - 1
      }, () => {
        if (this.props.onChapterChange) {
          this.props.onChapterChange(prevChapter.id);
        }
      });

      this.scrollLockTimerId = setTimeout(() => {
        this.setState({ isScrollLocked: false });
      }, SCROLL_COOLDOWN);

      return;
    }

    const timeFromEnd = mainVideo.duration - currentTime;

    console.log(`Текущее время: ${currentTime}, время от конца: ${timeFromEnd}`);

    reversedVideo.currentTime = timeFromEnd;
    reversedVideo.playbackRate = NORMAL_RATE;

    mainVideo.pause();

    this.setState({ activeVideo: 'reversed' }, () => {
      this.animatePlaybackRate(NORMAL_RATE, FAST_RATE, RAMP_MS, () => {
        reversedVideo.play()
          .then(() => {
            console.log("Воспроизведение реверсивного видео запущено");

            const timeToEnd = reversedVideo.duration - timeFromEnd;
            console.log(`Время до конца реверсивного видео: ${timeToEnd} сек`);

            if (isFirstChapter) {
              const transitionTime = Math.min(timeToEnd * 1000 / FAST_RATE, TRANSITION_DURATION);
              const timeBeforeSlow = transitionTime - RAMP_MS;

              if (timeBeforeSlow > 0) {
                this.transitionTimerId = setTimeout(() => {
                  this.animatePlaybackRate(FAST_RATE, NORMAL_RATE, RAMP_MS, () => {
                    this.setState({
                      activeVideo: 'main',
                      transitionState: 'loading'
                    }, () => {
                      mainVideo.currentTime = 0;
                      mainVideo.play()
                        .then(() => {
                          console.log("Возврат к началу текущей главы");
                          this.setState({ transitionState: 'idle' });
                        })
                        .catch(err => console.error('Ошибка воспроизведения:', err));
                    });
                  }, 'reversed');
                }, timeBeforeSlow);
              } else {
                this.animatePlaybackRate(FAST_RATE, NORMAL_RATE, RAMP_MS, () => {
                  this.setState({
                    activeVideo: 'main',
                    transitionState: 'loading'
                  }, () => {
                    mainVideo.currentTime = 0;
                    mainVideo.play()
                      .then(() => {
                        console.log("Возврат к началу текущей главы");
                        this.setState({ transitionState: 'idle' });
                      })
                      .catch(err => console.error('Ошибка воспроизведения:', err));
                  });
                }, 'reversed');
              }
            } else if (timeToEnd < SKIP_TO_END_THRESHOLD) {
              this.animatePlaybackRate(FAST_RATE, NORMAL_RATE, RAMP_MS, () => {
                this.setState({
                  currentChapter: prevChapter,
                  chapterIndex: this.state.chapterIndex - 1,
                  activeVideo: 'main',
                  transitionState: 'idle'
                }, () => {
                  if (this.props.onChapterChange) {
                    this.props.onChapterChange(prevChapter.id);
                  }
                });
              }, 'reversed');
            } else {
              const transitionTime = Math.min(timeToEnd * 1000 / FAST_RATE, TRANSITION_DURATION);
              const timeBeforeSlow = transitionTime - RAMP_MS;

              if (timeBeforeSlow > 0) {
                this.transitionTimerId = setTimeout(() => {
                  this.animatePlaybackRate(FAST_RATE, NORMAL_RATE, RAMP_MS, () => {
                    this.setState({
                      currentChapter: prevChapter,
                      chapterIndex: this.state.chapterIndex - 1,
                      activeVideo: 'main',
                      transitionState: 'loading'
                    }, () => {
                      if (this.props.onChapterChange) {
                        this.props.onChapterChange(prevChapter.id);
                      }
                    });
                  }, 'reversed');
                }, timeBeforeSlow);
              } else {
                this.animatePlaybackRate(FAST_RATE, NORMAL_RATE, RAMP_MS, () => {
                  this.setState({
                    currentChapter: prevChapter,
                    chapterIndex: this.state.chapterIndex - 1,
                    activeVideo: 'main',
                    transitionState: 'loading'
                  }, () => {
                    if (this.props.onChapterChange) {
                      this.props.onChapterChange(prevChapter.id);
                    }
                  });
                }, 'reversed');
              }
            }
          })
          .catch(err => console.error('Ошибка воспроизведения реверсивного видео:', err));
      }, 'reversed');
    });

    this.scrollLockTimerId = setTimeout(() => {
      this.setState({ isScrollLocked: false });
    }, SCROLL_COOLDOWN);
  }

  updateCurrentChapter(chapter) {
    this.setState({ currentChapter: chapter }, () => {
      if (this.props.onChapterChange) {
        this.props.onChapterChange(chapter.id);
      }
    });
  }

  fadeInVideo(videoElement, duration) {
    videoElement.style.transition = `opacity ${duration}ms`;
    videoElement.style.opacity = 1;
  }

  crossFadeVideos(fromVideo, toVideo, duration = 500) {
    if (!fromVideo || !toVideo) return;

    fromVideo.style.transition = `opacity ${duration}ms`;
    toVideo.style.transition = `opacity ${duration}ms`;

    const playPromise = toVideo.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          fromVideo.style.opacity = 0;
          toVideo.style.opacity = 1;

          setTimeout(() => {
            fromVideo.pause();
          }, duration);
        })
        .catch(err => console.error('Ошибка воспроизведения при crossfade:', err));
    }
  }

  // Метод для внешнего переключения глав
  changeChapter = (chapterId) => {
    console.log(`Переключение на главу ${chapterId} по клику на таймлайне`);

    // Ищем главу по ID напрямую через getStepById
    const nextStep = getStepById(chapterId);

    if (nextStep) {
      // Находим индекс шага в массиве steps
      const steps = getAllSteps();
      const stepIndex = steps.findIndex(step => step.id === chapterId);

      console.log(`Найдена глава: ${nextStep.title}, индекс: ${stepIndex}`);

      this.setState({
        currentChapter: nextStep,
        chapterIndex: stepIndex >= 0 ? stepIndex : this.state.chapterIndex,
        transitionState: 'loading'
      });

      // Вызываем коллбэк для обновления ID главы в родительском компоненте
      if (this.props.onChapterChange) {
        this.props.onChapterChange(nextStep.id);
      }

      return true;
    }

    console.warn(`Глава с ID ${chapterId} не найдена`);
    return false;
  }

  render() {
    if (this.state.currentChapter.transitionType === 'map') {
      const { currentChapter, chapterIndex } = this.state;
      return (
        <InteractiveMapStage
          onNext={() => {
            const next = getNextStep(currentChapter.id);
            if (next) {
              console.log(`Переход к следующей главе после карты: ${next.id}`);
              this.setState({
                currentChapter: next,
                chapterIndex: chapterIndex + 1,
                transitionState: 'loading'
              }, () => {
                if (this.props.onChapterChange) {
                  this.props.onChapterChange(next.id);
                }
              });
            }
          }}
          onPrev={() => {
            const prev = getPrevStep(currentChapter.id);
            if (prev) {
              console.log(`Переход к предыдущей главе: ${prev.id}`);
              this.setState({
                currentChapter: prev,
                chapterIndex: chapterIndex - 1,
                transitionState: 'loading'
              }, () => {
                if (this.props.onChapterChange) {
                  this.props.onChapterChange(prev.id);
                }
              });
            }
          }}
        />
      );
    }

    if (this.state.currentChapter.transitionType === 'article') {
      const { currentChapter, chapterIndex } = this.state;
      return (
        <ArticleStage
          chapterId={currentChapter.id}
          onNext={() => {
            const next = getNextStep(currentChapter.id);
            if (next) {
              console.log(`Переход к следующей главе после статьи: ${next.id}`);
              this.setState({
                currentChapter: next,
                chapterIndex: chapterIndex + 1,
                transitionState: 'loading'
              }, () => {
                if (this.props.onChapterChange) {
                  this.props.onChapterChange(next.id);
                }
              });
            }
          }}
          onPrev={() => {
            const prev = getPrevStep(currentChapter.id);
            if (prev) {
              console.log(`Переход к предыдущей главе: ${prev.id}`);
              this.setState({
                currentChapter: prev,
                chapterIndex: chapterIndex - 1,
                transitionState: 'loading'
              }, () => {
                if (this.props.onChapterChange) {
                  this.props.onChapterChange(prev.id);
                }
              });
            }
          }}
        />
      );
    }

    const mainVideoStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      zIndex: this.state.activeVideo === 'main' ? 2 : 1,
      opacity: this.state.activeVideo === 'main' ? 1 : 0,
      transition: 'opacity 500ms ease'
    };

    const reversedVideoStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      zIndex: this.state.activeVideo === 'reversed' ? 2 : 1,
      opacity: this.state.activeVideo === 'reversed' ? 1 : 0,
      transition: 'opacity 500ms ease'
    };

    return (
      <div className="video-player-container" ref={this.containerRef}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'black',
          zIndex: 0
        }} />

        <video
          ref={this.videoRef}
          className="main-video"
          playsInline
          muted
          style={mainVideoStyle}
        />

        <video
          ref={this.reversedVideoRef}
          className="reversed-video"
          playsInline
          muted
          style={reversedVideoStyle}
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

        <div className="remaining-time" style={{ display: 'none' }}>
          {this.state.remainingTime.toFixed(1)} сек.
        </div>
      </div>
    );
  }
}

export default VideoPlayer;

