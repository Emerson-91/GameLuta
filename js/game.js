// Main Game Engine & State Controller for Super Fighters

class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvasWidth = 960;
    this.canvasHeight = 540;

    // Game Mode: 'solo', 'pvp', 'cpu', 'training'
    this.mode = 'solo';
    this.state = 'TITLE'; // TITLE, SELECT, LADDER, FIGHT, ROUND_OVER, MATCH_OVER, VICTORY_ENDING, CONTINUE
    this.selectedDifficulty = 'medium'; // 'easy', 'medium', 'hard', 'nightmare'
    this.isMobile = this.checkIsMobile();
    this.mobileControlsVisible = true; // Always available on mobile / touch by default!
    if (this.isMobile) {
      document.body.classList.add('is-mobile-device');
    }

    // Fighters & AI
    this.p1 = null;
    this.p2 = null;
    this.ai = null;
    this.selectedP1Char = 'dog';
    this.selectedP2Char = 'emerson';
    this.selectedStage = 'street';
    this.activePicker = 'p1';
    this.isVersusSelect = false;

    // Arcade Progression Ladder
    this.arcadeLadder = ['alligator', 'capybara', 'owl', 'wolf', 'gorilla', 'tiger', 'bear', 'cat', 'dragon'];
    this.arcadeIndex = 0;

    // Secret Boss Unlock State (typing 'boss' unlocks Vulcanus)
    this.bossUnlocked = false;
    this.secretCodeBuffer = '';

    // Camera & Viewport
    this.cameraX = 0;
    this.targetCameraX = 0;

    // Match Rules
    this.roundTime = 99;
    this.currentRound = 1;
    this.roundState = 'INTRO'; // INTRO, ACTIVE, SLOW_MO, OUTRO
    this.roundStateTimer = 0;
    this.isPaused = false;

    // Continue Screen Timer
    this.continueTimer = 10;
    this.continueInterval = null;

    // Controls Modal opened from Pause tracker
    this.openedControlsFromPause = false;

    // Menu Navigation State (WASD & Arrows)
    this.titleMenuIndex = 0;
    this.selectFocusArea = 'grid'; // 'grid', 'stage', 'confirm', 'back'

    // Input Tracking
    this.keys = {};

    // Fixed Timestep Accumulator for 60Hz Physics (Ensures normal speed on 144Hz, 240Hz, etc.)
    this.accumulatedTime = 0;
    this.targetFps = 60;
    this.fixedStep = 1000 / this.targetFps; // 16.6667ms per tick

    this.isPreloaded = false;
    this.initEventListeners();
    this.setupMobileGamepad();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.resizeCanvas(), 100);
    });

    // Start Client-Side Preloader & Intro Video
    this.initPreloader();

    // Start Game Loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  checkIsMobile() {
    const ua = navigator.userAgent || '';
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
    const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isLandscapeMobile = (window.innerHeight < 600 && window.innerWidth < 1200);
    const isNarrow = window.innerWidth <= 1024 || window.innerHeight <= 650;
    return mobileRegex.test(ua) || hasTouch || isLandscapeMobile || isNarrow;
  }

  toggleFullscreen() {
    const doc = window.document;
    const docEl = document.getElementById('game-wrapper') || doc.documentElement;

    const isFullscreen = doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;

    if (!isFullscreen) {
      const req = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
      if (req) {
        req.call(docEl).then(() => {
          this.tryLockLandscape();
        }).catch(() => {
          this.tryLockLandscape();
        });
      } else {
        this.tryLockLandscape();
      }
    } else {
      const exit = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
      if (exit) {
        exit.call(doc);
      }
    }
    setTimeout(() => this.resizeCanvas(), 250);
  }

  tryLockLandscape() {
    try {
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      }
    } catch (_) {}
  }

  dismissRotateWarning() {
    document.body.classList.add('rotate-dismissed');
    this.resizeCanvas();
  }

  resizeCanvas() {
    const container = document.getElementById('game-container');
    if (!container) return;
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const isMobile = this.isMobile || this.checkIsMobile();

    // Keep strict 16:9 ratio fitted to viewport
    let targetW = winW;
    let targetH = (targetW * 9) / 16;

    if (targetH > winH) {
      targetH = winH;
      targetW = (targetH * 16) / 9;
    }

    // On desktop, limit maximum bounds for classic arcade cabinet look
    if (!isMobile && targetW > 1100) {
      targetW = 1100;
      targetH = (targetW * 9) / 16;
    }

    container.style.width = `${Math.floor(targetW)}px`;
    container.style.height = `${Math.floor(targetH)}px`;
  }

  initEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // Unmute audio context on first user gesture
      if (window.soundEngine && !window.soundEngine.ctx) {
        window.soundEngine.init();
      }

      // Secret Cheat Code detection (typing "boss" unlocks Vulcanus)
      if (e.key && e.key.length === 1) {
        this.secretCodeBuffer = (this.secretCodeBuffer || '') + e.key.toLowerCase();
        if (this.secretCodeBuffer.length > 20) {
          this.secretCodeBuffer = this.secretCodeBuffer.slice(-20);
        }
        if (this.secretCodeBuffer.endsWith('boss')) {
          this.unlockBoss();
          return;
        }
      }

      // Restart current match shortcut (KeyR) during fight, pause, or match over
      if (e.code === 'KeyR' && (this.state === 'FIGHT' || this.isPaused || this.state === 'MATCH_OVER')) {
        e.preventDefault();
        this.restartCurrentMatch();
        return;
      }

      // In FIGHT state and not paused:
      if (this.state === 'FIGHT' && !this.isPaused) {
        // Pause toggle
        if (e.code === 'KeyP' || e.code === 'Escape') {
          e.preventDefault();
          this.togglePause();
          return;
        }
      } else {
        // Universal Menu Navigation with WASD and Arrow Keys across ALL menus!
        const navKeys = [
          'KeyW', 'KeyA', 'KeyS', 'KeyD',
          'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
          'Enter', 'Space', 'KeyF', 'KeyJ', 'Numpad1',
          'Escape', 'KeyP'
        ];
        if (navKeys.includes(e.code)) {
          this.handleMenuNavigation(e);
          return;
        }
      }

      // Prevent page scrolling on fighting keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (['KeyA', 'KeyD', 'KeyS'].includes(e.code) && this.p1) {
        if (!this.keys['KeyA'] && !this.keys['KeyD'] && !this.keys['KeyS']) {
          this.p1.standUp();
        }
      }
      if (['ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(e.code)) {
        if (this.p2 && !this.p2.isCpu) {
          if (!this.keys['ArrowLeft'] && !this.keys['ArrowRight'] && !this.keys['ArrowDown']) {
            this.p2.standUp();
          }
        } else if (this.p1 && this.p2 && this.p2.isCpu) {
          if (!this.keys['KeyA'] && !this.keys['KeyD'] && !this.keys['KeyS'] &&
              !this.keys['ArrowLeft'] && !this.keys['ArrowRight'] && !this.keys['ArrowDown']) {
            this.p1.standUp();
          }
        }
      }
    });

    // Clear stuck keys when window loses focus
    window.addEventListener('blur', () => this.resetKeys());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.resetKeys();
    });
  }

  resetKeys() {
    this.keys = {};
    if (this.p1 && this.p1.isGrounded && this.p1.state === 'WALK') {
      this.p1.vx = 0;
      this.p1.state = 'IDLE';
    }
    if (this.p2 && this.p2.isGrounded && this.p2.state === 'WALK') {
      this.p2.vx = 0;
      this.p2.state = 'IDLE';
    }
  }

  togglePause() {
    if (this.state !== 'FIGHT') return;

    const controlsModal = document.getElementById('screen-controls');
    const pauseMenu = document.getElementById('pause-modal');

    // If controls modal was open and user toggles pause, close controls and restore pause safely!
    if (controlsModal && !controlsModal.classList.contains('hidden')) {
      controlsModal.classList.add('hidden');
      this.openedControlsFromPause = false;
      this.isPaused = true;
      if (pauseMenu) {
        pauseMenu.classList.remove('hidden');
        this.updateModalFocus(pauseMenu, 0);
      }
      return;
    }

    this.isPaused = !this.isPaused;
    if (pauseMenu) {
      pauseMenu.classList.toggle('hidden', !this.isPaused);
      if (this.isPaused) {
        this.updateModalFocus(pauseMenu, 0);
      }
    }
    if (this.isPaused) {
      this.resetKeys();
    }
  }

  cycleDifficulty(btn) {
    const difficulties = ['easy', 'medium', 'hard', 'nightmare'];
    const labels = {
      easy: 'DIFICULDADE: FÁCIL',
      medium: 'DIFICULDADE: MÉDIO',
      hard: 'DIFICULDADE: DIFÍCIL',
      nightmare: 'DIFICULDADE: PESADELO'
    };
    const nextIdx = (difficulties.indexOf(this.selectedDifficulty) + 1) % difficulties.length;
    this.selectedDifficulty = difficulties[nextIdx];
    if (btn) btn.innerText = labels[this.selectedDifficulty];
    if (window.soundEngine) window.soundEngine.playSelect();
  }

  setupMobileGamepad() {
    const vpad = document.getElementById('mobile-gamepad');
    if (!vpad) return;

    if (this.isMobile || this.mobileControlsVisible) {
      this.mobileControlsVisible = true;
      vpad.classList.remove('hidden');
    }

    // ==========================================
    // 1. TOUCH ANALOG JOYSTICK (Virtual Thumbstick)
    // ==========================================
    const zone = document.getElementById('vpad-analog-zone');
    const base = document.getElementById('vpad-analog-base');
    const stick = document.getElementById('vpad-analog-stick');

    if (base && stick) {
      let touchId = null;
      let isDragging = false;
      let baseRect = null;
      let centerX = 0;
      let centerY = 0;
      let maxRadius = 45;
      let lastMenuNav = 0;

      const updateCenter = () => {
        baseRect = base.getBoundingClientRect();
        centerX = baseRect.left + baseRect.width / 2;
        centerY = baseRect.top + baseRect.height / 2;
        maxRadius = baseRect.width * 0.38;
      };

      const handleMove = (clientX, clientY) => {
        if (!centerX || !centerY) updateCenter();
        const dx = clientX - centerX;
        const dy = clientY - centerY;
        const dist = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);

        const clampedDist = Math.min(dist, maxRadius);
        const clampX = Math.cos(angle) * clampedDist;
        const clampY = Math.sin(angle) * clampedDist;

        stick.style.transform = `translate3d(${clampX}px, ${clampY}px, 0)`;
        base.classList.add('stick-active');

        // Directional Thresholds
        const deadzone = maxRadius * 0.22;
        if (dist > deadzone) {
          const hThreshold = maxRadius * 0.28;
          const vThreshold = maxRadius * 0.32;

          // If in FIGHT state, update fighter inputs:
          if (this.state === 'FIGHT') {
            // Horizontal Direction
            if (dx < -hThreshold) {
              this.keys['KeyA'] = true;
              this.keys['KeyD'] = false;
            } else if (dx > hThreshold) {
              this.keys['KeyD'] = true;
              this.keys['KeyA'] = false;
            } else {
              this.keys['KeyA'] = false;
              this.keys['KeyD'] = false;
            }

            // Vertical Direction
            if (dy < -vThreshold) {
              this.keys['KeyW'] = true;
              this.keys['KeyS'] = false;
            } else if (dy > vThreshold) {
              this.keys['KeyS'] = true;
              this.keys['KeyW'] = false;
            } else {
              this.keys['KeyW'] = false;
              this.keys['KeyS'] = false;
            }
          } else {
            // In Menus / Selection: navigate with joystick!
            const now = performance.now();
            if (now - lastMenuNav > 200) {
              if (dy < -vThreshold) {
                this.handleMenuNavigation({ code: 'KeyW', preventDefault: () => {} });
                lastMenuNav = now;
              } else if (dy > vThreshold) {
                this.handleMenuNavigation({ code: 'KeyS', preventDefault: () => {} });
                lastMenuNav = now;
              } else if (dx < -hThreshold) {
                this.handleMenuNavigation({ code: 'KeyA', preventDefault: () => {} });
                lastMenuNav = now;
              } else if (dx > hThreshold) {
                this.handleMenuNavigation({ code: 'KeyD', preventDefault: () => {} });
                lastMenuNav = now;
              }
            }
          }
        } else {
          this.keys['KeyA'] = false;
          this.keys['KeyD'] = false;
          this.keys['KeyW'] = false;
          this.keys['KeyS'] = false;
          if (this.p1 && this.p1.state === 'CROUCH') {
            this.p1.standUp();
          }
        }
      };

      const handleRelease = () => {
        touchId = null;
        isDragging = false;
        stick.style.transform = 'translate3d(0, 0, 0)';
        base.classList.remove('stick-active');
        this.keys['KeyA'] = false;
        this.keys['KeyD'] = false;
        this.keys['KeyW'] = false;
        this.keys['KeyS'] = false;
        if (this.p1) {
          this.p1.standUp();
        }
      };

      // Touch Events for Analog Stick
      const onTouchStart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateCenter();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          touchId = t.identifier;
          isDragging = true;
          handleMove(t.clientX, t.clientY);
          break;
        }
      };

      const onTouchMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        e.stopPropagation();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === touchId) {
            handleMove(t.clientX, t.clientY);
            break;
          }
        }
      };

      const onTouchEnd = (e) => {
        if (!isDragging) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === touchId) {
            e.preventDefault();
            e.stopPropagation();
            handleRelease();
            break;
          }
        }
      };

      const touchTarget = zone || base;
      touchTarget.addEventListener('touchstart', onTouchStart, { passive: false });
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd, { passive: false });
      window.addEventListener('touchcancel', onTouchEnd, { passive: false });

      // Mouse Events for desktop emulation / testing
      touchTarget.addEventListener('mousedown', (e) => {
        isDragging = true;
        updateCenter();
        handleMove(e.clientX, e.clientY);
      });
      window.addEventListener('mousemove', (e) => {
        if (isDragging && touchId === null) {
          handleMove(e.clientX, e.clientY);
        }
      });
      window.addEventListener('mouseup', () => {
        if (isDragging && touchId === null) {
          handleRelease();
        }
      });
    }

    // ==========================================
    // 2. ARCADE ACTION BUTTONS (Multi-touch)
    // ==========================================
    const buttons = vpad.querySelectorAll('.vpad-btn');
    buttons.forEach((btn) => {
      const code = btn.dataset.key;
      if (!code) return;

      const handlePress = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.keys[code] = true;
        btn.classList.add('active');

        // Tactile vibration feedback on mobile
        if (navigator.vibrate) {
          try { navigator.vibrate(12); } catch (_) {}
        }

        // Secret easter egg for mobile only: tap ESPECIAL button 5 times to unlock Vulcanus!
        if (this.isMobile && code === 'KeyH') {
          this.registerMobileSpecialTap();
        }

        // Immediate trigger for action keys
        if (this.state === 'FIGHT') {
          if (['KeyF', 'KeyG', 'KeyH', 'Space'].includes(code)) {
            this.handleInputs();
          }
        } else {
          // In Menus: SOCO/SUPER confirms, CHUTE goes back
          if (code === 'KeyF' || code === 'Space') {
            this.handleMenuNavigation({ code: 'Enter', preventDefault: () => {} });
          } else if (code === 'KeyG') {
            this.handleMenuNavigation({ code: 'Escape', preventDefault: () => {} });
          }
        }
      };

      const handleRelease = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.keys[code] = false;
        btn.classList.remove('active');
        if (['KeyA', 'KeyD', 'KeyS'].includes(code) && this.p1) {
          if (!this.keys['KeyA'] && !this.keys['KeyD'] && !this.keys['KeyS']) {
            this.p1.standUp();
          }
        }
      };

      btn.addEventListener('touchstart', handlePress, { passive: false });
      btn.addEventListener('touchend', handleRelease, { passive: false });
      btn.addEventListener('touchcancel', handleRelease, { passive: false });
      btn.addEventListener('mousedown', handlePress);
      btn.addEventListener('mouseup', handleRelease);
      btn.addEventListener('mouseleave', handleRelease);
    });
  }

  toggleMobileControls() {
    const vpad = document.getElementById('mobile-gamepad');
    const toggleBtn = document.getElementById('btn-touch-toggle');
    if (!vpad) return;
    this.mobileControlsVisible = !this.mobileControlsVisible;
    vpad.classList.toggle('hidden', !this.mobileControlsVisible);
    if (toggleBtn) {
      toggleBtn.innerText = this.mobileControlsVisible ? 'CONTROLES: ON' : 'CONTROLES: OFF';
    }
  }

  // --- Client-side Asset Preloading & Intro Video System ---

  getAssetPreloadList() {
    const list = [
      'assets/images/portrait_dog.jpg',
      'assets/images/portrait_emerson.jpg',
      'assets/images/portrait_nata.jpg',
      'assets/images/portrait_andrey.jpg',
      'assets/images/portrait_alligator.jpg',
      'assets/images/portrait_capybara.jpg',
      'assets/images/portrait_owl.jpg',
      'assets/images/portrait_tiger.jpg',
      'assets/images/portrait_bear.jpg',
      'assets/images/portrait_gorilla.jpg',
      'assets/images/portrait_wolf.jpg',
      'assets/images/portrait_cat.jpg',
      'assets/images/portrait_dragon.jpg',
      'assets/images/sprites/andrey_bot.png',
      'assets/images/sprites/meteor_1.png',
      'assets/images/sprites/meteor_2.png',
      'assets/images/sprites/meteor_3.png',
      'assets/images/sprites/meteor_4.png'
    ];

    if (window.SPRITE_META) {
      for (const charId in window.SPRITE_META) {
        for (const action in window.SPRITE_META[charId]) {
          list.push(`assets/images/sprites/${charId}_${action}.png`);
        }
      }
    }
    return Array.from(new Set(list));
  }

  initPreloader() {
    const preloader = document.getElementById('screen-preloader');
    if (!preloader) {
      this.isPreloaded = true;
      return;
    }

    const video = document.getElementById('preloader-video');
    if (video) {
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay fallback
        });
      }
      video.onended = () => {
        if (this.isPreloaded) {
          this.finishPreloading();
        }
      };
    }

    const list = this.getAssetPreloadList();
    const total = list.length;
    let loaded = 0;

    const fill = document.getElementById('preloader-progress-fill');
    const pctText = document.getElementById('preloader-percent-text');
    const statusText = document.getElementById('preloader-status-text');
    const resText = document.getElementById('preloader-res-name');
    const startBtn = document.getElementById('btn-start-game');
    const skipBtn = document.getElementById('btn-skip-video');

    const onAssetLoaded = (src) => {
      loaded++;
      const pct = Math.min(100, Math.floor((loaded / total) * 100));
      if (fill) fill.style.width = `${pct}%`;
      if (pctText) pctText.innerText = `${pct}%`;
      if (resText && src) {
        resText.innerText = `Carregando: ${src.split('/').pop()}`;
      }

      if (loaded >= total) {
        this.isPreloaded = true;
        if (statusText) statusText.innerText = 'TODOS OS RECURSOS PRONTOS';
        if (resText) resText.innerText = `${total} imagens e sprites carregados no cache`;
        if (fill) fill.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
        if (startBtn) startBtn.classList.remove('hidden');
        if (skipBtn) skipBtn.classList.remove('hidden');
      }
    };

    // Parallel load into browser image cache
    list.forEach(src => {
      const img = new Image();
      img.onload = () => onAssetLoaded(src);
      img.onerror = () => onAssetLoaded(src);
      img.src = src;
    });
  }

  finishPreloading() {
    if (!this.isPreloaded) return;
    const preloader = document.getElementById('screen-preloader');
    if (!preloader || preloader.classList.contains('preloader-hidden')) return;

    const video = document.getElementById('preloader-video');
    if (video) {
      video.pause();
    }

    if (window.soundEngine) {
      window.soundEngine.init();
      window.soundEngine.playConfirm();
    }

    preloader.classList.add('preloader-fade-out');
    setTimeout(() => {
      preloader.classList.add('preloader-hidden');
      this.state = 'TITLE';
      this.returnToTitle();
    }, 450);
  }

  playIntroVideo() {
    const preloader = document.getElementById('screen-preloader');
    const video = document.getElementById('preloader-video');
    const startBtn = document.getElementById('btn-start-game');
    const skipBtn = document.getElementById('btn-skip-video');
    if (preloader && video) {
      preloader.classList.remove('preloader-hidden', 'preloader-fade-out');
      if (startBtn && this.isPreloaded) startBtn.classList.remove('hidden');
      if (skipBtn && this.isPreloaded) skipBtn.classList.remove('hidden');
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  }

  // --- State Transitions ---

  startMode(mode) {
    this.mode = mode;
    window.soundEngine.playConfirm();
    window.soundEngine.startBgm();

    if (mode === 'solo') {
      this.arcadeIndex = 0;
      this.openCharSelect(false);
    } else if (mode === 'pvp') {
      this.openCharSelect(true);
    } else if (mode === 'cpu') {
      this.openCharSelect(true);
    } else if (mode === 'training') {
      this.openCharSelect(false);
    }
  }

  openCharSelect(isVersus = false) {
    this.resetKeys();
    this.state = 'SELECT';
    this.selectFocusArea = 'grid';
    this.clearSelectActionsFocus();
    this.isVersusSelect = isVersus;
    this.activePicker = 'p1';
    this.hideAllScreens();
    document.getElementById('screen-select').classList.remove('hidden');

    const p2Card = document.getElementById('select-p2-card');
    if (p2Card) {
      p2Card.style.display = isVersus ? 'flex' : 'none';
    }

    const turnIndicator = document.getElementById('select-turn-indicator');
    if (turnIndicator) {
      turnIndicator.style.display = isVersus ? 'flex' : 'none';
    }

    const stageDropdown = document.getElementById('stage-dropdown');
    if (stageDropdown) {
      stageDropdown.value = this.selectedStage;
    }

    this.setActivePicker('p1');
    this.selectFighter('p1', this.selectedP1Char, false);
    if (isVersus) {
      this.selectFighter('p2', this.selectedP2Char, false);
    }
    this.renderCharacterGrid();
  }

  setActivePicker(player) {
    this.activePicker = player;
    const tabP1 = document.getElementById('tab-pick-p1');
    const tabP2 = document.getElementById('tab-pick-p2');
    const cardP1 = document.getElementById('select-p1-card');
    const cardP2 = document.getElementById('select-p2-card');

    if (tabP1) tabP1.classList.toggle('active-p1', player === 'p1');
    if (tabP2) tabP2.classList.toggle('active-p2', player === 'p2');
    if (cardP1) cardP1.style.borderColor = player === 'p1' ? '#ef4444' : '#475569';
    if (cardP2) cardP2.style.borderColor = player === 'p2' ? '#3b82f6' : '#475569';
  }

  // Get currently active playable roster (Vulcanus only appears if unlocked)
  getRoster() {
    return PLAYABLE_ROSTER.filter(id => id !== 'dragon' || this.bossUnlocked);
  }

  // Secret boss unlock triggered by typing 'boss' (desktop) or tapping ESPECIAL 5x (mobile only)
  unlockBoss(fromMobile = false) {
    if (this.bossUnlocked) {
      if (this.state === 'SELECT') {
        this.selectFighter(this.activePicker || 'p1', 'dragon', true);
      }
      return;
    }
    this.bossUnlocked = true;

    if (window.soundEngine) {
      window.soundEngine.playSuper();
    }
    if (window.particleSystem) {
      window.particleSystem.shake(22);
    }
    if (navigator.vibrate) {
      try { navigator.vibrate([100, 60, 200, 60, 400]); } catch (_) {}
    }

    if (window.uiManager) {
      window.uiManager.showBanner('VULCANUS DESBLOQUEADO!', 'O CHEFÃO FINAL DRAGÃO ANCESTRAL CHEGOU!', 240, '#ef4444');
    }

    if (this.state === 'SELECT') {
      this.renderCharacterGrid();
      this.selectFighter(this.activePicker || 'p1', 'dragon', true);
    }
  }

  // Count 5 taps on ESPECIAL button on mobile to unlock Vulcanus
  registerMobileSpecialTap() {
    if (!this.isMobile) return;
    this.mobileSpecialTaps = (this.mobileSpecialTaps || 0) + 1;
    clearTimeout(this.mobileSpecialTapTimer);
    this.mobileSpecialTapTimer = setTimeout(() => {
      this.mobileSpecialTaps = 0;
    }, 4000);

    if (this.mobileSpecialTaps >= 5) {
      this.mobileSpecialTaps = 0;
      this.unlockBoss(true);
    }
  }

  renderCharacterGrid() {
    const grid = document.getElementById('char-grid');
    if (!grid) return;
    grid.innerHTML = '';

    this.getRoster().forEach(charId => {
      const char = CHARACTERS[charId];
      const isP1 = this.selectedP1Char === charId;
      const isP2 = this.isVersusSelect && this.selectedP2Char === charId;

      const card = document.createElement('div');
      card.className = `char-card ${charId === 'dragon' ? 'char-card-boss' : ''} ${isP1 ? 'active-p1' : ''} ${isP2 ? 'active-p2' : ''}`;
      card.title = `${char.name} - ${char.title}`;

      let badgesHtml = '';
      if (isP1) badgesHtml += `<div class="char-badge-p1">P1</div>`;
      if (isP2) badgesHtml += `<div class="char-badge-p2">P2</div>`;

      // Special tags
      if (charId === 'dragon') {
        badgesHtml += `<div class="char-tag-badge char-tag-boss">CHEFÃO</div>`;
      } else if (charId === 'emerson') {
        badgesHtml += `<div class="char-tag-badge char-tag-master">MESTRE</div>`;
      } else if (charId === 'dog') {
        badgesHtml += `<div class="char-tag-badge char-tag-titan">TITÃ</div>`;
      } else if (charId === 'andrey') {
        badgesHtml += `<div class="char-tag-badge char-tag-ai">IA EXPERT</div>`;
      }

      card.innerHTML = `
        ${badgesHtml}
        <img src="${char.portrait}" alt="${char.name}" class="char-thumb">
        <div class="char-label">${char.name}</div>
      `;

      // Left Click -> selects for current active picker
      card.addEventListener('click', () => {
        window.soundEngine.playSelect();
        this.selectFighter(this.activePicker, charId);
        // In versus mode, auto-advance to P2 if P1 was picked
        if (this.isVersusSelect && this.activePicker === 'p1') {
          this.setActivePicker('p2');
        }
      });

      // Right Click -> directly selects for P2 in versus mode
      card.addEventListener('contextmenu', (e) => {
        if (this.isVersusSelect) {
          e.preventDefault();
          window.soundEngine.playSelect();
          this.selectFighter('p2', charId);
          this.setActivePicker('p2');
        }
      });

      grid.appendChild(card);
    });
  }

  selectFighter(player, charId, shouldRerender = true) {
    const char = CHARACTERS[charId];
    if (!char) return;

    if (player === 'p1') {
      this.selectedP1Char = charId;
      const img = document.getElementById('p1-preview-img');
      if (img) img.src = char.portrait;
      const name = document.getElementById('p1-preview-name');
      if (name) name.innerText = char.name.toUpperCase();
      const title = document.getElementById('p1-preview-title');
      if (title) title.innerText = char.title;
      const bio = document.getElementById('p1-preview-bio');
      if (bio) bio.innerText = char.lore;

      const spec = document.getElementById('p1-move-spec');
      if (spec) spec.innerText = char.specialName;
      const sup = document.getElementById('p1-move-super');
      if (sup) sup.innerText = char.superName;

      const hpVal = document.getElementById('p1-stat-hp-val');
      if (hpVal) hpVal.innerText = char.baseHp;
      const atkVal = document.getElementById('p1-stat-atk-val');
      if (atkVal) atkVal.innerText = `${Math.round(char.power * 100)}%`;
      const spdVal = document.getElementById('p1-stat-spd-val');
      if (spdVal) spdVal.innerText = char.speed.toFixed(1);

      document.getElementById('p1-stat-hp').style.width = `${Math.min(100, (char.baseHp / 1800) * 100)}%`;
      document.getElementById('p1-stat-atk').style.width = `${Math.min(100, (char.power / 1.6) * 100)}%`;
      document.getElementById('p1-stat-spd').style.width = `${Math.min(100, (char.speed / 7) * 100)}%`;
    } else {
      this.selectedP2Char = charId;
      const img = document.getElementById('p2-preview-img');
      if (img) img.src = char.portrait;
      const name = document.getElementById('p2-preview-name');
      if (name) name.innerText = char.name.toUpperCase();
      const title = document.getElementById('p2-preview-title');
      if (title) title.innerText = char.title;
      const bio = document.getElementById('p2-preview-bio');
      if (bio) bio.innerText = char.lore;

      const spec = document.getElementById('p2-move-spec');
      if (spec) spec.innerText = char.specialName;
      const sup = document.getElementById('p2-move-super');
      if (sup) sup.innerText = char.superName;

      const hpVal = document.getElementById('p2-stat-hp-val');
      if (hpVal) hpVal.innerText = char.baseHp;
      const atkVal = document.getElementById('p2-stat-atk-val');
      if (atkVal) atkVal.innerText = `${Math.round(char.power * 100)}%`;
      const spdVal = document.getElementById('p2-stat-spd-val');
      if (spdVal) spdVal.innerText = char.speed.toFixed(1);

      document.getElementById('p2-stat-hp').style.width = `${Math.min(100, (char.baseHp / 1800) * 100)}%`;
      document.getElementById('p2-stat-atk').style.width = `${Math.min(100, (char.power / 1.6) * 100)}%`;
      document.getElementById('p2-stat-spd').style.width = `${Math.min(100, (char.speed / 7) * 100)}%`;
    }

    if (shouldRerender) {
      this.renderCharacterGrid();
    }
  }

  handleSelectNavigation(code) {
    if (this.state !== 'SELECT') return;

    // Movement keys
    const isW = code === 'KeyW' || code === 'ArrowUp';
    const isA = code === 'KeyA' || code === 'ArrowLeft';
    const isS = code === 'KeyS' || code === 'ArrowDown';
    const isD = code === 'KeyD' || code === 'ArrowRight';

    const isConfirm = code === 'Enter' || code === 'Space' || code === 'KeyF' || code === 'KeyJ' || code === 'Numpad1';
    const isBack = code === 'Escape';

    if (isBack) {
      if (window.soundEngine) window.soundEngine.playSelect();
      this.returnToTitle();
      return;
    }

    // In Versus mode, P1 uses WASD and P2 uses Arrow keys:
    if (this.isVersusSelect) {
      const isP1Nav = ['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(code);
      const isP2Nav = ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(code);

      if (isConfirm) {
        this.confirmFighterSelection();
        return;
      }

      if (isP1Nav) {
        let dx = 0, dy = 0;
        if (code === 'KeyW') dy = -1;
        else if (code === 'KeyS') dy = 1;
        else if (code === 'KeyA') dx = -1;
        else if (code === 'KeyD') dx = 1;
        this.navigateSelectGrid('p1', dx, dy);
        return;
      } else if (isP2Nav) {
        let dx = 0, dy = 0;
        if (code === 'ArrowUp') dy = -1;
        else if (code === 'ArrowDown') dy = 1;
        else if (code === 'ArrowLeft') dx = -1;
        else if (code === 'ArrowRight') dx = 1;
        this.navigateSelectGrid('p2', dx, dy);
        return;
      }
    }

    // Solo or single picker mode
    if (this.selectFocusArea === 'grid') {
      let dx = 0, dy = 0;
      if (isW) dy = -1;
      else if (isS) dy = 1;
      else if (isA) dx = -1;
      else if (isD) dx = 1;

      const roster = this.getRoster();
      const currentChar = this.selectedP1Char;
      const currentIndex = roster.indexOf(currentChar);
      const isBottomRow = (currentIndex >= 6 && currentIndex <= 11 && roster.length <= 12) || (currentIndex === 12);

      // Moving down from bottom row enters action buttons
      if (isS && isBottomRow) {
        this.selectFocusArea = 'confirm';
        this.updateSelectActionsFocus();
        if (window.soundEngine) window.soundEngine.playSelect();
        return;
      }

      if (isConfirm) {
        this.confirmFighterSelection();
        return;
      }

      this.navigateSelectGrid(this.activePicker || 'p1', dx, dy);
    } else {
      // Bottom actions focus: 'stage', 'confirm', 'back'
      if (isW) {
        this.selectFocusArea = 'grid';
        this.clearSelectActionsFocus();
        if (window.soundEngine) window.soundEngine.playSelect();
        return;
      }

      if (this.selectFocusArea === 'confirm') {
        if (isA) {
          this.selectFocusArea = 'stage';
          this.updateSelectActionsFocus();
        } else if (isD) {
          this.selectFocusArea = 'back';
          this.updateSelectActionsFocus();
        } else if (isConfirm) {
          this.confirmFighterSelection();
        }
      } else if (this.selectFocusArea === 'back') {
        if (isA) {
          this.selectFocusArea = 'confirm';
          this.updateSelectActionsFocus();
        } else if (isConfirm) {
          if (window.soundEngine) window.soundEngine.playSelect();
          this.returnToTitle();
        }
      } else if (this.selectFocusArea === 'stage') {
        if (isD) {
          this.selectFocusArea = 'confirm';
          this.updateSelectActionsFocus();
        } else if (isA || isConfirm || isS) {
          this.cycleStage(1);
        }
      }
    }
  }

  navigateSelectGrid(targetPlayer, dx, dy) {
    if (!targetPlayer || (dx === 0 && dy === 0)) return;

    const currentChar = targetPlayer === 'p1' ? this.selectedP1Char : this.selectedP2Char;
    const roster = this.getRoster();
    let currentIndex = roster.indexOf(currentChar);
    if (currentIndex === -1) currentIndex = 0;

    const COLS = 6;
    let newIndex = currentIndex;

    if (dx !== 0) {
      newIndex = (currentIndex + dx + roster.length) % roster.length;
    } else if (dy !== 0) {
      if (dy < 0) {
        if (currentIndex === 12) {
          newIndex = 8;
        } else if (currentIndex >= COLS) {
          newIndex = currentIndex - COLS;
        } else {
          newIndex = Math.min(currentIndex + COLS, roster.length - 1);
        }
      } else if (dy > 0) {
        if (currentIndex < COLS) {
          newIndex = Math.min(currentIndex + COLS, roster.length - 1);
        } else if (currentIndex < 12 && roster.length > 12) {
          newIndex = 12;
        } else {
          newIndex = currentIndex % COLS;
        }
      }
    }

    if (newIndex >= 0 && newIndex < roster.length && newIndex !== currentIndex) {
      const nextChar = roster[newIndex];
      if (window.soundEngine) window.soundEngine.playSelect();
      this.selectFighter(targetPlayer, nextChar, true);
    }
  }

  updateSelectActionsFocus() {
    const stageBox = document.querySelector('.stage-select-box');
    const btnConfirm = document.querySelector('.btn-confirm');
    const btnBack = document.querySelector('.btn-back');

    if (stageBox) stageBox.classList.toggle('arcade-menu-focus', this.selectFocusArea === 'stage');
    if (btnConfirm) btnConfirm.classList.toggle('arcade-menu-focus', this.selectFocusArea === 'confirm');
    if (btnBack) btnBack.classList.toggle('arcade-menu-focus', this.selectFocusArea === 'back');

    if (this.selectFocusArea === 'stage') {
      const stageDrop = document.getElementById('stage-dropdown');
      if (stageDrop) stageDrop.focus();
    } else if (this.selectFocusArea === 'confirm' && btnConfirm) {
      btnConfirm.focus();
    } else if (this.selectFocusArea === 'back' && btnBack) {
      btnBack.focus();
    }
  }

  clearSelectActionsFocus() {
    const stageBox = document.querySelector('.stage-select-box');
    const btnConfirm = document.querySelector('.btn-confirm');
    const btnBack = document.querySelector('.btn-back');
    if (stageBox) stageBox.classList.remove('arcade-menu-focus');
    if (btnConfirm) btnConfirm.classList.remove('arcade-menu-focus');
    if (btnBack) btnBack.classList.remove('arcade-menu-focus');
  }

  cycleStage(direction = 1) {
    const dropdown = document.getElementById('stage-dropdown');
    if (!dropdown) return;
    const count = dropdown.options.length;
    dropdown.selectedIndex = (dropdown.selectedIndex + direction + count) % count;
    this.selectedStage = dropdown.value;
    if (window.soundEngine) window.soundEngine.playSelect();
  }

  confirmFighterSelection() {
    window.soundEngine.playConfirm();
    this.resetKeys();

    if (this.mode === 'solo') {
      this.buildArcadeLadder(this.selectedP1Char);
      this.arcadeIndex = 0;
      this.openArcadePrologue(this.selectedP1Char);
    } else if (this.mode === 'training') {
      // Training Mode: P2 is a stationary training dummy with isCpu = true
      this.startFight(this.selectedP1Char, this.selectedP2Char || 'dog', this.selectedStage, true);
    } else {
      // PVP mode: 2 local human players (isCpu = false)
      this.startFight(this.selectedP1Char, this.selectedP2Char, this.selectedStage, false);
    }
  }

  openArcadePrologue(charId) {
    this.state = 'PROLOGUE';
    this.hideAllScreens();
    const screen = document.getElementById('screen-prologue');
    if (screen) {
      screen.classList.remove('hidden');
      this.updateModalFocus(screen, 0);
    }

    const hero = CHARACTERS[charId] || CHARACTERS['dog'];
    const img = document.getElementById('prologue-hero-img');
    if (img) img.src = hero.portrait;
    const name = document.getElementById('prologue-hero-name');
    if (name) name.innerText = hero.name.toUpperCase();
    const title = document.getElementById('prologue-hero-title');
    const storyData = window.GAME_STORIES && window.GAME_STORIES.prologues[charId];
    if (title) title.innerText = (storyData && storyData.title) ? storyData.title : hero.title;

    const storyElem = document.getElementById('prologue-story-text');
    if (storyElem) {
      if (storyData && storyData.text) {
        storyElem.innerHTML = storyData.text;
      } else {
        storyElem.innerText = hero.lore;
      }
    }
  }

  startLadderFromPrologue() {
    window.soundEngine.playConfirm();
    this.openArcadeLadder();
  }

  buildArcadeLadder(chosenPlayerChar) {
    const pool = ['alligator', 'capybara', 'owl', 'wolf', 'gorilla', 'tiger', 'bear', 'cat', 'nata', 'andrey'];
    let opponents = pool.filter(id => id !== chosenPlayerChar);
    if (chosenPlayerChar !== 'dog') {
      opponents.unshift('dog'); // If playing as Emerson or another animal, face Unicão!
    }
    // Emerson is the supreme boss before the dragon if not playing as Emerson!
    if (chosenPlayerChar !== 'emerson') {
      opponents.push('emerson');
    }
    // Final boss is always Vulcanus the Dragon (unless player is dragon)!
    if (chosenPlayerChar !== 'dragon') {
      opponents.push('dragon');
    } else {
      // If player chooses dragon, Emerson is the supreme final boss!
      if (!opponents.includes('emerson')) opponents.push('emerson');
    }
    this.arcadeLadder = opponents;
  }

  openArcadeLadder() {
    this.state = 'LADDER';
    this.hideAllScreens();
    const screen = document.getElementById('screen-ladder');
    if (screen) {
      screen.classList.remove('hidden');
      this.updateModalFocus(screen, 0);
    }

    const ladderCont = document.getElementById('ladder-stages');
    if (!ladderCont) return;
    ladderCont.innerHTML = '';

    const currentOpponent = this.arcadeLadder[this.arcadeIndex];

    this.arcadeLadder.forEach((charId, idx) => {
      const char = CHARACTERS[charId];
      const isBoss = charId === 'dragon' || charId === 'emerson';
      const isCurrent = idx === this.arcadeIndex;
      const isPassed = idx < this.arcadeIndex;

      const item = document.createElement('div');
      item.className = `ladder-item ${isBoss ? 'ladder-boss' : ''} ${isCurrent ? 'ladder-current' : ''} ${isPassed ? 'ladder-passed' : ''}`;
      item.innerHTML = `
        <div class="ladder-num">${charId === 'dragon' ? 'CHEFÃO' : charId === 'emerson' ? 'MESTRE' : `FASE ${idx + 1}`}</div>
        <img src="${char.portrait}" class="ladder-thumb">
        <div class="ladder-info">
          <div class="ladder-name">${char.name.toUpperCase()}</div>
          <div class="ladder-subtitle">${char.title}</div>
        </div>
        ${isCurrent ? '<span class="ladder-badge">BATALHA AGORA!</span>' : ''}
      `;
      ladderCont.appendChild(item);
    });

    // Populate Confrontation Dialogue
    const diagText = document.getElementById('ladder-dialogue-text');
    if (diagText && window.GAME_STORIES) {
      diagText.innerText = window.GAME_STORIES.getMatchDialogue(this.selectedP1Char, currentOpponent);
    }

    // Auto stage based on opponent
    let stageKey = 'street';
    if (currentOpponent === 'alligator') stageKey = 'swamp';
    else if (currentOpponent === 'capybara') stageKey = 'bamboo';
    else if (currentOpponent === 'owl') stageKey = 'temple';
    else if (currentOpponent === 'emerson') stageKey = 'servers';
    else if (currentOpponent === 'nata') stageKey = 'dev_room';
    else if (currentOpponent === 'andrey') stageKey = 'ai_lab';
    else if (currentOpponent === 'dragon') stageKey = 'volcano';
    else {
      stageKey = STAGE_KEYS[Math.floor(Math.random() * (STAGE_KEYS.length - 1))];
    }
    this.selectedStage = stageKey;

    document.getElementById('ladder-start-btn').onclick = () => {
      this.startFight(this.selectedP1Char, currentOpponent, this.selectedStage, true);
    };
  }

  restartCurrentMatch() {
    const cfg = this.currentMatchConfig || (this.p1 && this.p2 ? {
      p1Char: this.p1.charKey,
      p2Char: this.p2.charKey,
      stageKey: (window.stageManager && window.stageManager.currentStageKey) || this.selectedStage || 'dojo',
      isCpu: this.p2.isCpu
    } : null);

    if (!cfg) return;

    if (this.isPaused) {
      this.isPaused = false;
      const pauseMenu = document.getElementById('pause-modal');
      if (pauseMenu) pauseMenu.classList.add('hidden');
    }

    const controlsModal = document.getElementById('screen-controls');
    if (controlsModal) controlsModal.classList.add('hidden');
    this.openedControlsFromPause = false;

    const versusWinScreen = document.getElementById('screen-versus-win');
    if (versusWinScreen) versusWinScreen.classList.add('hidden');

    const gameoverScreen = document.getElementById('screen-gameover');
    if (gameoverScreen) gameoverScreen.classList.add('hidden');

    const continueScreen = document.getElementById('screen-continue');
    if (continueScreen) continueScreen.classList.add('hidden');

    if (this.continueInterval) {
      clearInterval(this.continueInterval);
      this.continueInterval = null;
    }

    if (this.roundStartTimeout) {
      clearTimeout(this.roundStartTimeout);
      this.roundStartTimeout = null;
    }

    if (window.soundEngine) {
      window.soundEngine.playConfirm();
    }

    this.startFight(cfg.p1Char, cfg.p2Char, cfg.stageKey, cfg.isCpu);
  }

  startFight(p1Char, p2Char, stageKey, isCpu = true) {
    this.currentMatchConfig = { p1Char, p2Char, stageKey, isCpu };
    this.state = 'FIGHT';
    this.isPaused = false;
    const pauseMenu = document.getElementById('pause-modal');
    if (pauseMenu) pauseMenu.classList.add('hidden');
    this.resetKeys();
    this.hideAllScreens();
    document.getElementById('hud').classList.remove('hidden');
    const fsGlobal = document.getElementById('btn-fullscreen-global');
    if (fsGlobal) fsGlobal.classList.add('hidden');

    if (this.roundStartTimeout) {
      clearTimeout(this.roundStartTimeout);
      this.roundStartTimeout = null;
    }

    // Show mobile virtual gamepad if enabled
    const vpad = document.getElementById('mobile-gamepad');
    if (vpad) {
      vpad.classList.toggle('hidden', !this.mobileControlsVisible);
    }

    // Create fighters
    this.p1 = new Fighter(p1Char, false, false);
    this.p2 = new Fighter(p2Char, true, isCpu);

    if (this.mode === 'training') {
      this.ai = new FightingAI(this.p2, 'dummy');
    } else if (isCpu) {
      let diff = this.selectedDifficulty || 'medium';
      if (this.mode === 'solo') {
        if (p2Char === 'dragon' || p2Char === 'emerson') {
          diff = diff === 'easy' ? 'hard' : diff === 'nightmare' ? 'nightmare' : 'boss';
        } else {
          if (diff === 'easy') {
            diff = this.arcadeIndex > 5 ? 'medium' : 'easy';
          } else if (diff === 'hard') {
            diff = this.arcadeIndex <= 3 ? 'medium' : 'hard';
          } else if (diff === 'nightmare') {
            diff = this.arcadeIndex > 4 ? 'nightmare' : 'hard';
          } else {
            // medium
            if (this.arcadeIndex <= 2) diff = 'easy';
            else if (this.arcadeIndex <= 6) diff = 'medium';
            else diff = 'hard';
          }
        }
      }
      this.ai = new FightingAI(this.p2, diff);
    } else {
      this.ai = null;
    }

    window.stageManager.setStage(stageKey);
    window.particleSystem.reset();
    window.uiManager.resetHUD(this.p1, this.p2);

    this.currentRound = 1;
    this.startRound();
  }

  startRound() {
    this.resetKeys();
    const stage = window.stageManager.getCurrentStage();
    this.p1.spawn(400, stage.groundY, 1);
    this.p2.spawn(900, stage.groundY, -1);

    // Garante vida 100% cheia e reseta barras de lag no HUD a cada round
    window.uiManager.resetHUD(this.p1, this.p2);
    window.uiManager.updateHUD(this.p1, this.p2, 99);

    this.roundTime = 99;
    this.roundState = 'INTRO';
    this.roundStateTimer = 110;

    const roundText = this.mode === 'training'
      ? 'MODO TREINO'
      : (this.currentRound === 3 ? 'ROUND FINAL' : `ROUND ${this.currentRound}`);
    const subText = this.mode === 'training' ? 'BONECO PASSIVO • PRATIQUE SEUS GOLPES' : '';
    window.soundEngine.playRoundStart();
    window.uiManager.showBanner(roundText, subText, 60, '#ef4444');

    if (this.roundStartTimeout) {
      clearTimeout(this.roundStartTimeout);
    }
    this.roundStartTimeout = setTimeout(() => {
      if (this.state === 'FIGHT') {
        window.soundEngine.playConfirm();
        window.uiManager.showBanner(this.mode === 'training' ? 'TREINAR!' : 'LUTEM!', '', 50, '#f59e0b');
        this.roundState = 'ACTIVE';
        this.resetKeys();
      }
    }, 1200);
  }

  handleInputs() {
    if (!this.p1 || !this.p2 || this.roundState !== 'ACTIVE') return;

    // In Solo and Training mode, P1 can use either WASD or Arrow Keys.
    // In PVP (2 Players), P1 uses WASD exclusively and P2 uses Arrow Keys exclusively.
    const isP1SoloOrTraining = this.p2.isCpu;

    const p1Left = this.keys['KeyA'] || (isP1SoloOrTraining && this.keys['ArrowLeft']);
    const p1Right = this.keys['KeyD'] || (isP1SoloOrTraining && this.keys['ArrowRight']);
    const p1Up = this.keys['KeyW'] || (isP1SoloOrTraining && this.keys['ArrowUp']);
    const p1Down = this.keys['KeyS'] || (isP1SoloOrTraining && this.keys['ArrowDown']);

    if (p1Left) {
      this.p1.moveLeft();
    } else if (p1Right) {
      this.p1.moveRight();
    } else if (this.p1.isGrounded && this.p1.state === 'WALK') {
      this.p1.vx = 0;
      this.p1.state = 'IDLE';
    }

    if (p1Up) {
      let jumpDir = 0;
      if (p1Right) jumpDir = 1;
      else if (p1Left) jumpDir = -1;
      this.p1.jump(jumpDir);
    } else if (p1Down) {
      this.p1.crouch();
    } else if (this.p1.state === 'CROUCH' && !this.p1.isCrouchAttacking) {
      this.p1.standUp();
    }

    if (this.keys['KeyF']) {
      this.p1.attackLight();
      this.keys['KeyF'] = false;
    }
    if (this.keys['KeyG']) {
      this.p1.attackHeavy();
      this.keys['KeyG'] = false;
    }
    if (this.keys['KeyH']) {
      this.p1.specialMove();
      this.keys['KeyH'] = false;
    }
    if (this.keys['KeyV'] || this.keys['Space']) {
      this.p1.superMove();
      this.keys['KeyV'] = false;
      this.keys['Space'] = false;
    }

    // --- Player 2 Inputs (ONLY in real 2-player PVP mode, NEVER in Solo or Training) ---
    if (!this.p2.isCpu) {
      const p2Left = this.keys['ArrowLeft'];
      const p2Right = this.keys['ArrowRight'];
      const p2Up = this.keys['ArrowUp'];
      const p2Down = this.keys['ArrowDown'];

      if (p2Left) {
        this.p2.moveLeft();
      } else if (p2Right) {
        this.p2.moveRight();
      } else if (this.p2.isGrounded && this.p2.state === 'WALK') {
        this.p2.vx = 0;
        this.p2.state = 'IDLE';
      }

      if (p2Up) {
        let jumpDir = 0;
        if (p2Right) jumpDir = 1;
        else if (p2Left) jumpDir = -1;
        this.p2.jump(jumpDir);
      } else if (p2Down) {
        this.p2.crouch();
      } else if (this.p2.state === 'CROUCH' && !this.p2.isCrouchAttacking) {
        this.p2.standUp();
      }

      if (this.keys['KeyJ'] || this.keys['Numpad1']) {
        this.p2.attackLight();
        this.keys['KeyJ'] = false;
        this.keys['Numpad1'] = false;
      }
      if (this.keys['KeyK'] || this.keys['Numpad2']) {
        this.p2.attackHeavy();
        this.keys['KeyK'] = false;
        this.keys['Numpad2'] = false;
      }
      if (this.keys['KeyL'] || this.keys['Numpad3']) {
        this.p2.specialMove();
        this.keys['KeyL'] = false;
        this.keys['Numpad3'] = false;
      }
      if (this.keys['KeyP'] || this.keys['Numpad0'] || this.keys['Enter']) {
        this.p2.superMove();
        this.keys['KeyP'] = false;
        this.keys['Numpad0'] = false;
        this.keys['Enter'] = false;
      }
    }
  }

  update(deltaTime) {
    if (this.isPaused || this.state !== 'FIGHT') return;

    const stage = window.stageManager.getCurrentStage();

    // Round Timer Countdown & Training Mode handling
    if (this.mode === 'training') {
      this.roundTime = 99;
      if (this.p2) {
        if (this.p2.isDead) {
          this.p2.isDead = false;
          this.p2.hp = this.p2.maxHp;
          this.p2.state = 'IDLE';
          this.p2.vx = 0;
        } else if (this.p2.hp < this.p2.maxHp && this.p1.comboResetTimer === 0 && this.p2.state === 'IDLE') {
          this.p2.hp = Math.min(this.p2.maxHp, this.p2.hp + 6);
        }
      }
    } else if (this.roundState === 'ACTIVE') {
      this.roundTime -= deltaTime;
      if (this.roundTime <= 0) {
        this.roundTime = 0;
        this.handleTimeOver();
      }
    }

    // Handle Player Controls
    this.handleInputs();

    // Handle CPU AI
    if (this.ai && this.roundState === 'ACTIVE') {
      this.ai.update(this.p1, stage);
    }

    // Update Fighters
    this.p1.update(stage, this.p2);
    this.p2.update(stage, this.p1);

    // Maximum horizontal spread between fighters (keeps both inside screen view)
    const maxSpread = this.canvasWidth - 140;
    const currentDist = Math.abs(this.p1.x - this.p2.x);
    if (currentDist > maxSpread) {
      const excess = (currentDist - maxSpread) * 0.5;
      if (this.p1.x < this.p2.x) {
        this.p1.x += excess;
        this.p2.x -= excess;
      } else {
        this.p1.x -= excess;
        this.p2.x += excess;
      }
    }

    // Update Particles and FX
    window.particleSystem.update([this.p1, this.p2]);
    window.stageManager.updateParticles();

    // Smooth Parallax Camera tracking midpoint of fighters
    const midX = (this.p1.x + this.p2.x) / 2;
    this.targetCameraX = midX - this.canvasWidth / 2;
    // Clamp camera within stage bounds
    const maxCam = stage.width - this.canvasWidth;
    this.targetCameraX = Math.max(0, Math.min(maxCam, this.targetCameraX));
    this.cameraX += (this.targetCameraX - this.cameraX) * 0.18;

    // Check Round KO conditions
    if (this.roundState === 'ACTIVE') {
      if (this.p1.isDead || this.p2.isDead) {
        this.roundState = 'SLOW_MO';
        this.roundStateTimer = 280; // +120 frames (+2.0 seconds at 60 FPS) to show victory animations

        let winnerText = '';
        if (this.p1.isDead && this.p2.isDead) {
          winnerText = 'EMPATE!';
          window.uiManager.showBanner('DOUBLE K.O.!', 'EMPATE BRUTAL', 220, '#ef4444');
        } else if (this.p2.isDead) {
          this.p1.roundsWon++;
          winnerText = `${this.p1.charData.name.toUpperCase()} VENCEU!`;
          const isPerfect = this.p1.hp === this.p1.maxHp;
          window.uiManager.showBanner('K.O.!', isPerfect ? 'VITÓRIA PERFEITA!' : winnerText, 220, '#f59e0b');
          this.p1.state = 'VICTORY';
          this.p1.stateTimer = 0;
        } else {
          this.p2.roundsWon++;
          winnerText = `${this.p2.charData.name.toUpperCase()} VENCEU!`;
          window.uiManager.showBanner('K.O.!', winnerText, 220, '#ef4444');
          this.p2.state = 'VICTORY';
          this.p2.stateTimer = 0;
        }
      }
    } else if (this.roundState === 'SLOW_MO') {
      this.roundStateTimer--;
      if (this.roundStateTimer <= 0) {
        this.checkMatchEnd();
      }
    }

    // Update HUD
    window.uiManager.updateHUD(this.p1, this.p2, this.roundTime);
  }

  handleTimeOver() {
    this.roundState = 'SLOW_MO';
    this.roundStateTimer = 270; // +120 frames (+2.0 seconds at 60 FPS) to show victory animations
    if (this.p1.hp > this.p2.hp) {
      this.p1.roundsWon++;
      window.uiManager.showBanner('TEMPO ESGOTADO!', `${this.p1.charData.name.toUpperCase()} VENCE POR VIDA!`, 220, '#f59e0b');
      this.p1.state = 'VICTORY';
      this.p1.stateTimer = 0;
      this.p2.state = 'DEFEAT';
    } else if (this.p2.hp > this.p1.hp) {
      this.p2.roundsWon++;
      window.uiManager.showBanner('TEMPO ESGOTADO!', `${this.p2.charData.name.toUpperCase()} VENCE POR VIDA!`, 220, '#ef4444');
      this.p2.state = 'VICTORY';
      this.p2.stateTimer = 0;
      this.p1.state = 'DEFEAT';
    } else {
      window.uiManager.showBanner('TEMPO ESGOTADO!', 'EMPATE!', 220, '#94a3b8');
    }
  }

  checkMatchEnd() {
    // Best 2 out of 3 rounds
    if (this.p1.roundsWon >= 2) {
      this.handleMatchVictory();
    } else if (this.p2.roundsWon >= 2) {
      this.handleMatchDefeat();
    } else {
      // Next Round
      this.currentRound++;
      this.startRound();
    }
  }

  handleMatchVictory() {
    if (this.mode === 'solo') {
      const currentOpponent = this.arcadeLadder[this.arcadeIndex];
      // Check if beat final boss (dragon or end of ladder)
      if (currentOpponent === 'dragon' || this.arcadeIndex >= this.arcadeLadder.length - 1) {
        this.openVictoryEnding();
      } else {
        // Show Victory confrontation story dialog before advancing
        this.openStageClearStory(this.p1.charData.id, currentOpponent);
      }
    } else {
      // Versus victory
      this.openVersusMatchOver(this.p1);
    }
  }

  openStageClearStory(winnerId, loserId) {
    this.state = 'STAGE_CLEAR';
    this.hideAllScreens();
    const screen = document.getElementById('screen-stage-clear');
    if (screen) {
      screen.classList.remove('hidden');
      this.updateModalFocus(screen, 0);
    }

    const winner = CHARACTERS[winnerId] || CHARACTERS['dog'];
    const loser = CHARACTERS[loserId] || CHARACTERS['alligator'];

    const heroImg = document.getElementById('clear-hero-img');
    if (heroImg) heroImg.src = winner.portrait;
    const oppImg = document.getElementById('clear-opp-img');
    if (oppImg) oppImg.src = loser.portrait;

    const speaker = document.getElementById('clear-hero-speaker');
    if (speaker) speaker.innerText = `${winner.name.toUpperCase()}:`;

    const quoteElem = document.getElementById('clear-quote-text');
    if (quoteElem && window.GAME_STORIES) {
      quoteElem.innerText = window.GAME_STORIES.getVictoryQuote(winnerId, loserId);
    }
  }

  nextLadderStage() {
    window.soundEngine.playConfirm();
    this.arcadeIndex++;
    this.openArcadeLadder();
  }

  handleMatchDefeat() {
    if (this.mode === 'solo') {
      this.openContinueScreen();
    } else {
      this.openVersusMatchOver(this.p2);
    }
  }

  openVictoryEnding() {
    this.state = 'VICTORY_ENDING';
    this.hideAllScreens();
    const screen = document.getElementById('screen-ending');
    if (screen) {
      screen.classList.remove('hidden');
      this.updateModalFocus(screen, 0);
    }

    const hero = this.p1.charData;
    const img = document.getElementById('ending-hero-img');
    if (img) img.src = hero.portrait;
    const endingData = window.GAME_STORIES && window.GAME_STORIES.championEndings[hero.id];
    const title = document.getElementById('ending-hero-title');
    if (title) {
      title.innerText = (endingData && endingData.title) ? endingData.title : `CAMPEÃO SUPREMO: ${hero.name.toUpperCase()}!`;
    }

    const storyElem = document.getElementById('ending-story-text');
    if (storyElem) {
      if (endingData && endingData.text) {
        storyElem.innerHTML = endingData.text;
      } else {
        storyElem.innerHTML = `
          Após uma batalha cataclísmica contra <strong>Vulcanus, o Dragão Ancestral</strong> nas profundezas do covil de magma, 
          <strong>${hero.name}</strong> ergueu-se supremo como o novo campeão absoluto da arena!<br><br>
          A paz e a honra foram restauradas e sua lenda ecoará pela eternidade nos anais do <strong>SUPER FIGHTERS COMBAT</strong>!
        `;
      }
    }
  }

  openContinueScreen() {
    this.state = 'CONTINUE';
    this.hideAllScreens();
    const screen = document.getElementById('screen-continue');
    if (screen) {
      screen.classList.remove('hidden');
      this.updateModalFocus(screen, 0);
    }

    const currentOpponent = this.arcadeLadder[this.arcadeIndex] || 'dragon';
    const opp = CHARACTERS[currentOpponent] || { name: 'Oponente' };

    const speaker = document.getElementById('continue-taunt-speaker');
    if (speaker) speaker.innerText = `${opp.name.toUpperCase()}:`;

    const tauntText = document.getElementById('continue-taunt-text');
    if (tauntText && window.GAME_STORIES) {
      tauntText.innerText = window.GAME_STORIES.getDefeatQuote(currentOpponent);
    }

    this.continueTimer = 10;
    const numElem = document.getElementById('continue-num');
    if (numElem) numElem.innerText = this.continueTimer;

    if (this.continueInterval) clearInterval(this.continueInterval);
    this.continueInterval = setInterval(() => {
      this.continueTimer--;
      if (numElem) numElem.innerText = this.continueTimer;
      window.soundEngine.playHitLight();
      if (this.continueTimer <= 0) {
        clearInterval(this.continueInterval);
        this.openGameOver();
      }
    }, 1000);
  }

  restartContinue() {
    if (this.continueInterval) clearInterval(this.continueInterval);
    window.soundEngine.playConfirm();
    this.openArcadeLadder();
  }

  openGameOver() {
    this.state = 'GAMEOVER';
    this.hideAllScreens();
    const screen = document.getElementById('screen-gameover');
    if (screen) {
      screen.classList.remove('hidden');
      this.updateModalFocus(screen, 0);
    }
  }

  openVersusMatchOver(winner) {
    this.state = 'MATCH_OVER';
    this.hideAllScreens();
    const screen = document.getElementById('screen-versus-win');
    if (screen) {
      screen.classList.remove('hidden');
      this.updateModalFocus(screen, 0);
    }
    document.getElementById('versus-win-img').src = winner.charData.portrait;
    document.getElementById('versus-win-text').innerText = `${winner.charData.name.toUpperCase()} É O VENCEDOR!`;
  }

  hideAllScreens() {
    const screens = [
      'screen-title', 'screen-select', 'screen-prologue', 'screen-ladder',
      'screen-stage-clear', 'screen-ending', 'screen-continue', 'screen-gameover',
      'screen-versus-win', 'hud', 'screen-controls'
    ];
    screens.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
    const vpad = document.getElementById('mobile-gamepad');
    if (vpad) {
      vpad.classList.toggle('hidden', !this.mobileControlsVisible);
    }
    const fsGlobal = document.getElementById('btn-fullscreen-global');
    if (fsGlobal) {
      fsGlobal.classList.remove('hidden');
    }
  }

  returnToTitle() {
    this.resetKeys();
    if (this.continueInterval) clearInterval(this.continueInterval);
    this.state = 'TITLE';
    this.hideAllScreens();
    const titleScreen = document.getElementById('screen-title');
    if (titleScreen) titleScreen.classList.remove('hidden');
    this.updateTitleFocus();
  }

  openControlsModal() {
    const controlsModal = document.getElementById('screen-controls');
    if (!controlsModal) return;

    if (this.state === 'FIGHT' || this.isPaused) {
      this.openedControlsFromPause = true;
      this.isPaused = true;
      const pauseModal = document.getElementById('pause-modal');
      if (pauseModal) pauseModal.classList.add('hidden');
    }

    controlsModal.classList.remove('hidden');
    this.updateModalFocus(controlsModal, 0);
  }

  closeControlsModal() {
    const controlsModal = document.getElementById('screen-controls');
    if (controlsModal) controlsModal.classList.add('hidden');

    // If opened from pause, safely return to pause modal without unpausing fight!
    if (this.openedControlsFromPause) {
      this.openedControlsFromPause = false;
      const pauseModal = document.getElementById('pause-modal');
      if (pauseModal && this.state === 'FIGHT') {
        pauseModal.classList.remove('hidden');
        this.isPaused = true;
        this.updateModalFocus(pauseModal, 0);
      }
    } else if (this.state === 'TITLE') {
      this.updateTitleFocus();
    }
  }

  // --- Universal Keyboard Menu Navigation (WASD & Arrows) ---

  handleMenuNavigation(e) {
    const code = e.code;
    const isW = code === 'KeyW' || code === 'ArrowUp';
    const isS = code === 'KeyS' || code === 'ArrowDown';
    const isA = code === 'KeyA' || code === 'ArrowLeft';
    const isD = code === 'KeyD' || code === 'ArrowRight';
    const isConfirm = ['Enter', 'Space', 'KeyF', 'KeyJ', 'Numpad1'].includes(code);
    const isBack = code === 'Escape';

    // 1. Controls Modal (if visible)
    const controlsModal = document.getElementById('screen-controls');
    if (controlsModal && !controlsModal.classList.contains('hidden')) {
      if (isConfirm || isBack || isW || isS) {
        e.preventDefault();
        this.closeControlsModal();
      }
      return;
    }

    // 2. Pause Menu (if game is paused during fight)
    const pauseMenu = document.getElementById('pause-modal');
    if (this.isPaused && pauseMenu && !pauseMenu.classList.contains('hidden')) {
      e.preventDefault();
      if (code === 'KeyP' || isBack) {
        this.togglePause();
        return;
      }
      this.navigateModalButtons(pauseMenu, isW, isS, isA, isD, isConfirm, isBack, () => this.togglePause());
      return;
    }

    // 3. Preloader / Character Intro Overlay (if visible)
    const preloader = document.getElementById('screen-preloader');
    if (preloader && !preloader.classList.contains('preloader-hidden')) {
      if (this.isPreloaded && (isConfirm || isBack || isW || isS || isA || isD)) {
        e.preventDefault();
        this.finishPreloading();
      }
      return;
    }

    // 4. Title Screen
    if (this.state === 'TITLE') {
      e.preventDefault();
      this.navigateTitleMenu(isW, isS, isA, isD, isConfirm);
      return;
    }

    // 5. Character Select Screen
    if (this.state === 'SELECT') {
      e.preventDefault();
      this.handleSelectNavigation(code);
      return;
    }

    // 6. Prologue Screen
    if (this.state === 'PROLOGUE') {
      e.preventDefault();
      if (isConfirm || isD || isS) {
        this.startLadderFromPrologue();
      } else if (isBack || isA) {
        this.openCharSelect(false);
      }
      return;
    }

    // 7. Ladder Screen
    if (this.state === 'LADDER') {
      e.preventDefault();
      if (isConfirm || isD || isS) {
        const currentOpponent = this.arcadeLadder[this.arcadeIndex];
        this.startFight(this.selectedP1Char, currentOpponent, this.selectedStage, true);
      } else if (isBack || isA) {
        this.openCharSelect(false);
      }
      return;
    }

    // 8. Stage Clear Screen
    const stageClearScreen = document.getElementById('screen-stage-clear');
    if (this.state === 'STAGE_CLEAR' || (stageClearScreen && !stageClearScreen.classList.contains('hidden'))) {
      e.preventDefault();
      if (isConfirm || isD || isS) {
        this.nextLadderStage();
      }
      return;
    }

    // 9. Continue Screen
    if (this.state === 'CONTINUE') {
      const continueScreen = document.getElementById('screen-continue');
      if (continueScreen && !continueScreen.classList.contains('hidden')) {
        e.preventDefault();
        this.navigateModalButtons(continueScreen, isW, isS, isA, isD, isConfirm, isBack, () => this.openGameOver());
        return;
      }
    }

    // 10. Game Over Screen
    const gameoverScreen = document.getElementById('screen-gameover');
    if (this.state === 'GAMEOVER' || (gameoverScreen && !gameoverScreen.classList.contains('hidden'))) {
      e.preventDefault();
      if (isConfirm || isBack || isW || isS) {
        this.returnToTitle();
      }
      return;
    }

    // 11. Versus Match Win Screen
    if (this.state === 'VERSUS_WIN' || this.state === 'MATCH_OVER') {
      const versusWinScreen = document.getElementById('screen-versus-win');
      if (versusWinScreen && !versusWinScreen.classList.contains('hidden')) {
        e.preventDefault();
        this.navigateModalButtons(versusWinScreen, isW, isS, isA, isD, isConfirm, isBack, () => this.returnToTitle());
        return;
      }
    }

    // 12. Ending Epilogue Screen
    if (this.state === 'VICTORY_ENDING' || this.state === 'ENDING') {
      const endingScreen = document.getElementById('screen-ending');
      if (endingScreen && !endingScreen.classList.contains('hidden')) {
        e.preventDefault();
        if (isConfirm || isBack || isW || isS) {
          this.returnToTitle();
        }
        return;
      }
    }
  }

  getTitleButtons() {
    const container = document.getElementById('screen-title');
    if (!container) return [];
    return Array.from(container.querySelectorAll('.arcade-btn, .arcade-btn-mini'));
  }

  navigateTitleMenu(isW, isS, isA, isD, isConfirm) {
    const buttons = this.getTitleButtons();
    if (!buttons || buttons.length === 0) return;

    if (this.titleMenuIndex < 0 || this.titleMenuIndex >= buttons.length) {
      this.titleMenuIndex = 0;
    }

    if (isConfirm) {
      if (window.soundEngine) window.soundEngine.playConfirm();
      const targetBtn = buttons[this.titleMenuIndex];
      if (targetBtn) targetBtn.click();
      return;
    }

    const prevIndex = this.titleMenuIndex;

    // 0..3: MODO SOLO, VERSUS PVP, VERSUS CPU, MODO TREINO
    // 4..8: VER APRESENTAÇÃO, DIFICULDADE, CONTROLES, SFX, MÚSICA
    if (isW) {
      if (this.titleMenuIndex >= 4) {
        this.titleMenuIndex = 3; // Jump back up from bottom row to Training mode
      } else if (this.titleMenuIndex === 0) {
        this.titleMenuIndex = buttons.length - 1; // Wrap around to bottom
      } else {
        this.titleMenuIndex--;
      }
    } else if (isS) {
      if (this.titleMenuIndex === 3) {
        this.titleMenuIndex = 4; // Jump down to bottom row
      } else if (this.titleMenuIndex >= 4) {
        this.titleMenuIndex = 0; // Wrap around to top
      } else {
        this.titleMenuIndex++;
      }
    } else if (isD) {
      if (this.titleMenuIndex >= 4) {
        this.titleMenuIndex = 4 + ((this.titleMenuIndex - 4 + 1) % 5);
      } else {
        this.titleMenuIndex = (this.titleMenuIndex + 1) % 4;
      }
    } else if (isA) {
      if (this.titleMenuIndex >= 4) {
        this.titleMenuIndex = 4 + ((this.titleMenuIndex - 4 - 1 + 5) % 5);
      } else {
        this.titleMenuIndex = (this.titleMenuIndex - 1 + 4) % 4;
      }
    }

    if (this.titleMenuIndex !== prevIndex) {
      if (window.soundEngine) window.soundEngine.playSelect();
      this.updateTitleFocus();
    }
  }

  updateTitleFocus() {
    const buttons = this.getTitleButtons();
    if (!buttons || buttons.length === 0) return;
    buttons.forEach((btn, idx) => {
      btn.classList.toggle('arcade-menu-focus', idx === this.titleMenuIndex);
    });
    if (buttons[this.titleMenuIndex]) {
      buttons[this.titleMenuIndex].focus();
    }
  }

  navigateModalButtons(container, isW, isS, isA, isD, isConfirm, isBack, onBackCallback) {
    if (!container) return;
    const buttons = Array.from(container.querySelectorAll('button:not(.hidden)'));
    if (!buttons || buttons.length === 0) return;

    if (isBack) {
      if (onBackCallback) onBackCallback();
      return;
    }

    let currentIndex = buttons.findIndex(b => b.classList.contains('arcade-menu-focus'));
    if (currentIndex === -1) currentIndex = 0;

    if (isConfirm) {
      if (window.soundEngine) window.soundEngine.playConfirm();
      if (buttons[currentIndex]) {
        buttons[currentIndex].click();
      }
      return;
    }

    const prevIndex = currentIndex;
    if (isW || isA) {
      currentIndex = (currentIndex - 1 + buttons.length) % buttons.length;
    } else if (isS || isD) {
      currentIndex = (currentIndex + 1) % buttons.length;
    }

    if (currentIndex !== prevIndex) {
      if (window.soundEngine) window.soundEngine.playSelect();
      buttons.forEach((btn, idx) => {
        btn.classList.toggle('arcade-menu-focus', idx === currentIndex);
      });
      if (buttons[currentIndex]) {
        buttons[currentIndex].focus();
      }
    }
  }

  updateModalFocus(container, defaultIndex = 0) {
    if (!container) return;
    const buttons = Array.from(container.querySelectorAll('button:not(.hidden)'));
    if (!buttons || buttons.length === 0) return;
    buttons.forEach((btn, idx) => {
      btn.classList.toggle('arcade-menu-focus', idx === defaultIndex);
    });
    if (buttons[defaultIndex]) {
      buttons[defaultIndex].focus();
    }
  }

  // --- Render & Game Loop ---
  draw() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    if (this.state === 'FIGHT') {
      // 1. Draw Stage Background & Parallax
      window.stageManager.draw(this.ctx, this.cameraX, 0, this.canvasWidth, this.canvasHeight);

      // 2. Draw Fighters (World Space)
      this.ctx.save();
      this.ctx.translate(-this.cameraX, 0);

      // Draw fighter in front who is attacking or based on Y/P1
      this.p1.draw(this.ctx);
      this.p2.draw(this.ctx);

      this.ctx.restore();

      // 3. Draw Particles, Hitsparks, Projectiles, Floating Texts
      window.particleSystem.draw(this.ctx, this.cameraX);

      // 4. Draw Announcer Banners (Round 1, Fight, KO)
      window.uiManager.drawAnnouncerBanner(this.ctx, this.canvasWidth, this.canvasHeight);
    }
  }

  gameLoop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    let elapsed = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // Prevent spiral of death on backgrounding tab or massive lag spikes (clamp max elapsed to 100ms)
    if (elapsed > 100) elapsed = 100;
    if (elapsed < 0) elapsed = 0;

    this.accumulatedTime += elapsed;

    // Run fixed physics/logic updates at exact 60 updates/sec (normalizing speed on 144Hz, 240Hz, etc.)
    let updates = 0;
    while (this.accumulatedTime >= this.fixedStep && updates < 5) {
      this.update(1 / 60);
      this.accumulatedTime -= this.fixedStep;
      updates++;
    }

    this.draw();

    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.gameEngine = new GameEngine();
});
