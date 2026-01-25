// Dream Hackers - Mobile Web App JavaScript

// Capacitor Haptics for iOS support
let CapacitorHaptics = null;

// Check if running in Capacitor
const isCapacitor = typeof window !== 'undefined' && window.Capacitor !== undefined;

if (isCapacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics) {
  CapacitorHaptics = window.Capacitor.Plugins.Haptics;
  console.log('Capacitor Haptics available');
}

// ==========================================
// AUDIO MANAGER FOR SWIPE SOUNDS
// ==========================================
class SwipeAudioManager {
  constructor() {
    this.audioContext = null;
    this.audioBuffers = {
      swipeLeft: null,
      swipeRight: null
    };
    this.isInitialized = false;
    this.isUnlocked = false;
    this.useWebAudio = true;

    // Fallback HTML5 Audio elements
    this.fallbackAudio = {
      swipeLeft: null,
      swipeRight: null
    };
  }

  async init() {
    try {
      // Try Web Audio API first (better for iOS)
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
        await this.loadAudioBuffers();
        console.log('SwipeAudioManager: Web Audio API initialized');
      } else {
        this.useWebAudio = false;
        this.initFallbackAudio();
      }
      this.isInitialized = true;
    } catch (error) {
      console.warn('SwipeAudioManager: Web Audio failed, using fallback', error);
      this.useWebAudio = false;
      this.initFallbackAudio();
      this.isInitialized = true;
    }
  }

  async loadAudioBuffers() {
    const sounds = [
      { name: 'swipeLeft', url: 'sounds/SwipeLeft.wav' },
      { name: 'swipeRight', url: 'sounds/SwipeRight.wav' }
    ];

    for (const sound of sounds) {
      try {
        const response = await fetch(sound.url);
        const arrayBuffer = await response.arrayBuffer();
        this.audioBuffers[sound.name] = await this.audioContext.decodeAudioData(arrayBuffer);
        console.log(`SwipeAudioManager: Loaded ${sound.name}`);
      } catch (error) {
        console.error(`SwipeAudioManager: Failed to load ${sound.name}`, error);
      }
    }
  }

  initFallbackAudio() {
    this.fallbackAudio.swipeLeft = new Audio('sounds/SwipeLeft.wav');
    this.fallbackAudio.swipeRight = new Audio('sounds/SwipeRight.wav');

    // Preload
    this.fallbackAudio.swipeLeft.preload = 'auto';
    this.fallbackAudio.swipeRight.preload = 'auto';

    console.log('SwipeAudioManager: Fallback audio initialized');
  }

  // Call this on first user interaction to unlock audio on iOS
  async unlockAudio() {
    if (this.isUnlocked) return;

    try {
      // Resume AudioContext if suspended
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
        console.log('SwipeAudioManager: AudioContext resumed');
      }

      // Play a silent buffer to fully unlock Web Audio on iOS
      if (this.audioContext) {
        const silentBuffer = this.audioContext.createBuffer(1, 1, 22050);
        const source = this.audioContext.createBufferSource();
        source.buffer = silentBuffer;
        source.connect(this.audioContext.destination);
        source.start(0);
      }

      // Also "warm up" fallback audio with silent play
      if (this.fallbackAudio.swipeLeft) {
        this.fallbackAudio.swipeLeft.volume = 0;
        await this.fallbackAudio.swipeLeft.play().catch(() => {});
        this.fallbackAudio.swipeLeft.pause();
        this.fallbackAudio.swipeLeft.currentTime = 0;
        this.fallbackAudio.swipeLeft.volume = 1;
      }
      if (this.fallbackAudio.swipeRight) {
        this.fallbackAudio.swipeRight.volume = 0;
        await this.fallbackAudio.swipeRight.play().catch(() => {});
        this.fallbackAudio.swipeRight.pause();
        this.fallbackAudio.swipeRight.currentTime = 0;
        this.fallbackAudio.swipeRight.volume = 1;
      }

      this.isUnlocked = true;
      console.log('SwipeAudioManager: Audio unlocked');
    } catch (error) {
      console.warn('SwipeAudioManager: Unlock failed', error);
    }
  }

  play(soundName) {
    if (!this.isInitialized) {
      console.warn('SwipeAudioManager: Not initialized');
      return;
    }

    if (!this.isUnlocked) {
      console.warn('SwipeAudioManager: Audio not unlocked yet');
    }

    console.log(`SwipeAudioManager: Playing ${soundName}`);

    if (this.useWebAudio && this.audioContext && this.audioBuffers[soundName]) {
      this.playWithWebAudio(soundName);
    } else if (this.fallbackAudio[soundName]) {
      this.playWithFallback(soundName);
    } else {
      console.warn(`SwipeAudioManager: No audio available for ${soundName}`);
    }
  }

  playWithWebAudio(soundName) {
    const buffer = this.audioBuffers[soundName];
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start(0);
  }

  playWithFallback(soundName) {
    const audio = this.fallbackAudio[soundName];
    if (!audio) return;

    // Reset and play
    audio.currentTime = 0;
    audio.play().catch(error => {
      console.warn('SwipeAudioManager: Fallback play failed', error);
    });
  }

  playSwipeLeft() {
    this.play('swipeLeft');
  }

  playSwipeRight() {
    this.play('swipeRight');
  }
}

// Global audio manager instance
let swipeAudioManager = null;

// ==========================================
// 3D MODEL VIEWER CLASS
// ==========================================
class ModelViewer {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      color: options.color || '#8B5CF6',
      autoRotate: options.autoRotate !== false,
      ...options
    };

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.model = null;
    this.animationId = null;
    this.isDestroyed = false;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 200;
    const height = this.container.clientHeight || 200;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.z = 3;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.container.appendChild(this.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(-5, -5, -5);
    this.scene.add(backLight);

    // Start animation
    this.animate();
  }

  // Create primitive shape (fallback if no GLB model)
  createPrimitive(type, color) {
    let geometry;

    switch(type) {
      case 'sphere':
        geometry = new THREE.SphereGeometry(0.8, 32, 32);
        break;
      case 'cube':
        geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(0.6, 0.6, 1.4, 32);
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(0.7, 1.4, 32);
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(0.6, 0.25, 16, 100);
        break;
      default:
        geometry = new THREE.SphereGeometry(0.8, 32, 32);
    }

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      metalness: 0.3,
      roughness: 0.4,
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.1
    });

    this.model = new THREE.Mesh(geometry, material);
    this.scene.add(this.model);
  }

  // Load GLB model (if available)
  loadModel(url, fallbackType, color) {
    if (typeof THREE.GLTFLoader === 'undefined') {
      console.log('GLTFLoader not available, using primitive');
      this.createPrimitive(fallbackType, color);
      return;
    }

    const loader = new THREE.GLTFLoader();

    loader.load(
      url,
      (gltf) => {
        const loadedModel = gltf.scene;

        // Calculate bounding box to find center and size
        const box = new THREE.Box3().setFromObject(loadedModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.5 / maxDim;

        // Create a pivot group for proper rotation around center
        this.model = new THREE.Group();

        // Scale the loaded model
        loadedModel.scale.setScalar(scale);

        // Offset the model so its center is at the pivot point (0,0,0)
        loadedModel.position.set(
          -center.x * scale,
          -center.y * scale,
          -center.z * scale
        );

        // Add the offset model to our pivot group
        this.model.add(loadedModel);
        this.scene.add(this.model);
        console.log('Model loaded successfully:', url);
      },
      (progress) => {
        if (progress.total > 0) {
          console.log('Loading:', url, Math.round((progress.loaded / progress.total) * 100) + '%');
        }
      },
      (error) => {
        console.error('Model load failed:', url, error);
        this.createPrimitive(fallbackType, color);
      }
    );
  }

  animate() {
    if (this.isDestroyed) return;

    this.animationId = requestAnimationFrame(() => this.animate());

    if (this.model && this.options.autoRotate) {
      this.model.rotation.y += 0.01;
      this.model.rotation.x += 0.005;
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.isDestroyed = true;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }

    if (this.model) {
      this.scene.remove(this.model);
    }
  }
}

class DreamHackersApp {
  // Configuration constants
  static CONFIG = {
    SWIPE_THRESHOLD: 75,           // Reduced from 100px for better responsiveness
    INDICATOR_THRESHOLD: 50,        // When indicators start showing
    VELOCITY_THRESHOLD: 200,        // px/s for flick gesture
    MIN_SWIPE_DISTANCE: 30,         // Minimum distance for velocity swipe
    DOUBLE_TAP_DELAY: 300,          // ms between taps for double-tap
    CARD_TRANSITION_DELAY: 400,     // ms before next card
    HAPTIC_LIGHT_THRESHOLD: 50,
    HAPTIC_STRONG_THRESHOLD: 75,
    MAX_RECONNECT_ATTEMPTS: 5,
    RECONNECT_DELAY: 1000           // Base delay in ms
  };

  constructor() {
    this.ws = null;
    this.objects = [];
    this.currentIndex = 0;
    this.isConnected = false;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;

    // New properties for enhanced features
    this.swipeStartTime = 0;
    this.lastHapticThreshold = null;
    this.swipeQueue = [];
    this.reconnectAttempts = 0;
    this.lastTapTime = 0;
    this.rafId = null;
    this.serverIP = null;

    // 3D Model viewer
    this.currentModelViewer = null;

    // Audio manager for swipe sounds
    this.audioManager = null;

    this.elements = {
      connectionScreen: document.getElementById('connection-screen'),
      appScreen: document.getElementById('app-screen'),
      serverIpInput: document.getElementById('server-ip-input'),
      connectBtn: document.getElementById('connect-btn'),
      statusDot: document.getElementById('status-dot'),
      statusText: document.getElementById('status-text'),
      cardContainer: document.getElementById('card-container'),
      instructions: document.getElementById('instructions'),
      noMoreCards: document.getElementById('no-more-cards'),
      restartBtn: document.getElementById('restart-btn'),
      toastContainer: document.getElementById('toast-container'),
      connectionWarning: document.getElementById('connection-warning'),
      queueCount: document.getElementById('queue-count')
    };

    this.init();
  }

  async init() {
    // Initialize audio manager for swipe sounds
    swipeAudioManager = new SwipeAudioManager();
    await swipeAudioManager.init();
    this.audioManager = swipeAudioManager;

    // Load objects
    await this.loadObjects();

    // Setup event listeners
    this.setupEventListeners();

    // Try to get saved server IP
    const savedIP = localStorage.getItem('dream_hackers_server_ip');
    if (savedIP) {
      this.elements.serverIpInput.value = savedIP;
    }

    // Show connection screen - user must connect first
  }

  async loadObjects() {
    try {
      const response = await fetch('objects.json');
      const data = await response.json();
      this.objects = data.objects;
      console.log('Loaded objects:', this.objects);
    } catch (error) {
      console.error('Error loading objects:', error);
      // Fallback objects if file not found
      this.objects = [
        { id: 'sphere', name: 'Memory Orb', description: 'A floating sphere', thumbnail: '🔮' },
        { id: 'cube', name: 'Thought Block', description: 'A solid block', thumbnail: '📦' },
        { id: 'torus', name: 'Dream Ring', description: 'An endless loop', thumbnail: '💫' }
      ];
    }
  }

  setupEventListeners() {
    // Connection button
    this.elements.connectBtn.addEventListener('click', () => this.connect());

    // Allow Enter key to connect
    this.elements.serverIpInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.connect();
    });

    // Restart button
    this.elements.restartBtn.addEventListener('click', () => this.restart());

    // Touch events for card swiping - using unified handlers
    this.elements.cardContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    this.elements.cardContainer.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    this.elements.cardContainer.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });

    // Mouse events for desktop testing - using unified handlers
    this.elements.cardContainer.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    document.addEventListener('mouseup', (e) => this.handleMouseUp(e));

    // Action button listeners
    document.addEventListener('click', (e) => {
      if (e.target.closest('.reject-btn')) {
        this.triggerButtonSwipe('left');
      } else if (e.target.closest('.accept-btn')) {
        this.triggerButtonSwipe('right');
      }
    });
  }

  // ==========================================
  // HAPTIC FEEDBACK
  // ==========================================

  async triggerHaptic(pattern) {
    // Try Capacitor Haptics first (works on iOS)
    if (CapacitorHaptics) {
      try {
        switch (pattern) {
          case 'light':
            await CapacitorHaptics.impact({ style: 'light' });
            break;
          case 'strong':
            await CapacitorHaptics.impact({ style: 'medium' });
            break;
          case 'success':
            await CapacitorHaptics.notification({ type: 'success' });
            break;
          case 'error':
            await CapacitorHaptics.notification({ type: 'error' });
            break;
        }
        return;
      } catch (e) {
        console.warn('Capacitor Haptics failed:', e);
      }
    }

    // Fallback to Web Vibration API (Android)
    if (navigator.vibrate) {
      switch (pattern) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'strong':
          navigator.vibrate(25);
          break;
        case 'success':
          navigator.vibrate([50, 50, 100]);
          break;
        case 'error':
          navigator.vibrate([100, 50, 100]);
          break;
      }
    }
  }

  triggerHapticFeedback() {
    const absX = Math.abs(this.currentX);
    const { HAPTIC_STRONG_THRESHOLD, HAPTIC_LIGHT_THRESHOLD } = DreamHackersApp.CONFIG;

    // Check thresholds in order (strong first)
    if (absX >= HAPTIC_STRONG_THRESHOLD && this.lastHapticThreshold !== 'strong') {
      this.triggerHaptic('strong');
      this.lastHapticThreshold = 'strong';
    } else if (absX >= HAPTIC_LIGHT_THRESHOLD && absX < HAPTIC_STRONG_THRESHOLD && this.lastHapticThreshold !== 'light') {
      this.triggerHaptic('light');
      this.lastHapticThreshold = 'light';
    } else if (absX < HAPTIC_LIGHT_THRESHOLD) {
      this.lastHapticThreshold = null;  // Reset when returning to center
    }
  }

  // ==========================================
  // UNIFIED POINTER HANDLERS
  // ==========================================

  handlePointerStart(clientX, clientY, target) {
    if (!target.classList.contains('card')) return false;

    // Unlock audio on first user interaction (iOS requirement)
    if (this.audioManager) {
      this.audioManager.unlockAudio();
    }

    // Double-tap detection
    const now = Date.now();
    const timeSinceLastTap = now - this.lastTapTime;

    if (timeSinceLastTap < DreamHackersApp.CONFIG.DOUBLE_TAP_DELAY) {
      // Double-tap detected!
      this.handleDoubleTap(target);
      this.lastTapTime = 0;
      return false;  // Don't start drag
    }

    this.lastTapTime = now;

    // Start drag
    this.isDragging = true;
    this.startX = clientX;
    this.startY = clientY;
    this.swipeStartTime = now;
    this.lastHapticThreshold = null;
    target.classList.add('swiping');
    return true;
  }

  handlePointerMove(clientX, clientY) {
    if (!this.isDragging) return;

    this.currentX = clientX - this.startX;
    this.currentY = clientY - this.startY;

    // Use RAF for smooth updates
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => {
        this.rafId = null;
        this.updateCardPosition();
        this.updateVisualFeedback();
        this.triggerHapticFeedback();
      });
    }
  }

  handlePointerEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.evaluateSwipe();
  }

  updateCardPosition() {
    const card = document.querySelector('.card.swiping');
    if (!card) return;

    const rotation = this.currentX / 10;
    const absX = Math.abs(this.currentX);
    const threshold = DreamHackersApp.CONFIG.SWIPE_THRESHOLD;

    // Card opacity decreases as it approaches threshold
    const cardOpacity = Math.max(0.7, 1 - (absX / threshold) * 0.3);

    card.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0) rotate(${rotation}deg)`;
    card.style.opacity = cardOpacity;
  }

  updateVisualFeedback() {
    const absX = Math.abs(this.currentX);
    const threshold = DreamHackersApp.CONFIG.SWIPE_THRESHOLD;
    const indicatorThreshold = DreamHackersApp.CONFIG.INDICATOR_THRESHOLD;

    // Get elements
    const leftIndicator = document.querySelector('.swipe-left-indicator');
    const rightIndicator = document.querySelector('.swipe-right-indicator');
    const leftTint = document.querySelector('.tint-left');
    const rightTint = document.querySelector('.tint-right');

    if (!leftIndicator || !rightIndicator) return;

    // Calculate progressive opacity: 0 at 20px, 1 at threshold
    const indicatorOpacity = Math.min(1, Math.max(0, (absX - 20) / (threshold - 20)));
    const tintOpacity = indicatorOpacity * 0.5;

    if (this.currentX < -indicatorThreshold) {
      leftIndicator.style.opacity = indicatorOpacity;
      rightIndicator.style.opacity = 0;
      if (leftTint) leftTint.style.opacity = tintOpacity;
      if (rightTint) rightTint.style.opacity = 0;
      this.highlightButton('reject');
    } else if (this.currentX > indicatorThreshold) {
      rightIndicator.style.opacity = indicatorOpacity;
      leftIndicator.style.opacity = 0;
      if (rightTint) rightTint.style.opacity = tintOpacity;
      if (leftTint) leftTint.style.opacity = 0;
      this.highlightButton('accept');
    } else {
      leftIndicator.style.opacity = 0;
      rightIndicator.style.opacity = 0;
      if (leftTint) leftTint.style.opacity = 0;
      if (rightTint) rightTint.style.opacity = 0;
      this.highlightButton(null);
    }
  }

  evaluateSwipe() {
    const card = document.querySelector('.card.swiping');
    if (!card) return;

    card.classList.remove('swiping');

    const distance = this.currentX;
    const absDistance = Math.abs(distance);
    const elapsedTime = Date.now() - this.swipeStartTime;
    const velocity = absDistance / (elapsedTime / 1000);  // px/s

    const { SWIPE_THRESHOLD, VELOCITY_THRESHOLD, MIN_SWIPE_DISTANCE } = DreamHackersApp.CONFIG;

    // Accept swipe if: meets distance threshold OR (fast velocity AND minimum distance)
    const meetsDistanceThreshold = absDistance >= SWIPE_THRESHOLD;
    const meetsVelocityThreshold = velocity >= VELOCITY_THRESHOLD && absDistance >= MIN_SWIPE_DISTANCE;

    if (distance < 0 && (meetsDistanceThreshold || meetsVelocityThreshold)) {
      this.swipeLeft(card);
    } else if (distance > 0 && (meetsDistanceThreshold || meetsVelocityThreshold)) {
      this.swipeRight(card);
    } else {
      this.snapBack(card);
    }

    this.currentX = 0;
    this.currentY = 0;
  }

  snapBack(card) {
    // Set CSS variables for spring animation
    card.style.setProperty('--snap-from', `translate(${this.currentX}px, ${this.currentY}px) rotate(${this.currentX / 10}deg)`);
    card.style.setProperty('--snap-x', `${this.currentX}px`);
    card.style.setProperty('--snap-y', `${this.currentY}px`);
    card.style.setProperty('--snap-rotation', `${this.currentX / 10}deg`);

    card.classList.add('snap-back');
    card.style.opacity = '';

    // Clean up
    card.addEventListener('animationend', () => {
      card.classList.remove('snap-back');
      card.style.transform = '';
    }, { once: true });

    // Reset indicators and tints
    document.querySelectorAll('.swipe-indicators').forEach(el => el.style.opacity = 0);
    document.querySelectorAll('.card-container-tint').forEach(el => el.style.opacity = 0);
    this.highlightButton(null);
  }

  // ==========================================
  // TOUCH EVENT HANDLERS
  // ==========================================

  handleTouchStart(e) {
    const target = e.target.closest('.card');
    if (target && this.handlePointerStart(e.touches[0].clientX, e.touches[0].clientY, target)) {
      // Started dragging
    }
  }

  handleTouchMove(e) {
    if (!this.isDragging) return;
    e.preventDefault();
    this.handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
  }

  handleTouchEnd(e) {
    this.handlePointerEnd();
  }

  // ==========================================
  // MOUSE EVENT HANDLERS
  // ==========================================

  handleMouseDown(e) {
    const target = e.target.closest('.card');
    if (target && this.handlePointerStart(e.clientX, e.clientY, target)) {
      // Started dragging
    }
  }

  handleMouseMove(e) {
    if (!this.isDragging) return;
    this.handlePointerMove(e.clientX, e.clientY);
  }

  handleMouseUp(e) {
    this.handlePointerEnd();
  }

  // ==========================================
  // DOUBLE-TAP & BUTTON ACTIONS
  // ==========================================

  handleDoubleTap(card) {
    console.log('Double-tap detected - quick send to VR');
    this.triggerHaptic('strong');

    // Add visual feedback
    card.classList.add('double-tap-flash');

    setTimeout(() => {
      card.classList.remove('double-tap-flash');
      this.swipeRight(card);
    }, 150);
  }

  triggerButtonSwipe(direction) {
    const card = document.querySelector('.card');
    if (!card || card.classList.contains('swipe-left') || card.classList.contains('swipe-right')) {
      return;  // Already animating
    }

    this.triggerHaptic('strong');

    if (direction === 'left') {
      this.swipeLeft(card);
    } else {
      this.swipeRight(card);
    }
  }

  highlightButton(which) {
    const rejectBtn = document.querySelector('.reject-btn');
    const acceptBtn = document.querySelector('.accept-btn');

    if (rejectBtn) rejectBtn.classList.toggle('highlight', which === 'reject');
    if (acceptBtn) acceptBtn.classList.toggle('highlight', which === 'accept');
  }

  // ==========================================
  // SWIPE ACTIONS
  // ==========================================

  swipeLeft(card) {
    const obj = this.objects[this.currentIndex];
    console.log('Swiped left - discarded:', obj.id);

    // Play swipe left sound
    if (this.audioManager) {
      this.audioManager.playSwipeLeft();
    }

    // Send reject event to server
    this.sendSwipeLeft(obj.id);

    card.classList.add('swipe-left');
    this.resetVisualFeedback();

    setTimeout(() => {
      this.currentIndex++;
      this.renderCard();
    }, DreamHackersApp.CONFIG.CARD_TRANSITION_DELAY);
  }

  swipeRight(card) {
    const obj = this.objects[this.currentIndex];
    console.log('Swiped right - sending to VR:', obj.id);

    // Play swipe right sound
    if (this.audioManager) {
      this.audioManager.playSwipeRight();
    }

    // Send accept event to server
    this.sendSwipeRight(obj.id);

    card.classList.add('swipe-right');
    this.resetVisualFeedback();

    setTimeout(() => {
      this.currentIndex++;
      this.renderCard();
    }, DreamHackersApp.CONFIG.CARD_TRANSITION_DELAY);
  }

  resetVisualFeedback() {
    document.querySelectorAll('.swipe-indicators').forEach(el => el.style.opacity = 0);
    document.querySelectorAll('.card-container-tint').forEach(el => el.style.opacity = 0);
    this.highlightButton(null);
  }

  // ==========================================
  // WEBSOCKET & CONNECTION RESILIENCE
  // ==========================================

  sendSwipeRight(objectId) {
    const message = {
      type: 'swipe_right',
      objectId: objectId,
      timestamp: Date.now()
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue for later
      this.swipeQueue.push(message);
      console.log('Swipe queued (offline):', objectId);
      this.showConnectionWarning();
      this.updateQueueCount();
    }
  }

  sendSwipeLeft(objectId) {
    const message = {
      type: 'swipe_left',
      objectId: objectId,
      timestamp: Date.now()
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
    // Don't queue swipe_left - rejections don't need to be persisted
  }

  flushSwipeQueue() {
    if (this.swipeQueue.length === 0) return;

    console.log(`Flushing ${this.swipeQueue.length} queued swipes`);

    while (this.swipeQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.swipeQueue.shift();
      this.ws.send(JSON.stringify(message));
    }

    this.updateQueueCount();
    if (this.swipeQueue.length === 0) {
      this.hideConnectionWarning();
    }
  }

  connect() {
    const serverIP = this.elements.serverIpInput.value.trim();

    if (!serverIP) {
      alert('Please enter server IP address');
      return;
    }

    // Save server IP
    localStorage.setItem('dream_hackers_server_ip', serverIP);
    this.serverIP = serverIP;

    this.connectToServer(serverIP, false);
  }

  connectToServer(serverIP, isReconnect = false) {
    let wsUrl = serverIP;
    if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
      wsUrl = 'ws://' + wsUrl;
    }

    if (!isReconnect) {
      this.elements.connectBtn.disabled = true;
      this.elements.connectBtn.innerHTML = '<span class="loading"></span>';
    }

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Connected to server');
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // Identify as phone client
        this.ws.send(JSON.stringify({
          type: 'identify',
          clientType: 'phone',
          timestamp: Date.now()
        }));

        if (isReconnect) {
          this.updateConnectionStatus('connected');
          this.flushSwipeQueue();
          this.hideConnectionWarning();
        } else {
          this.showAppScreen();
        }
      };

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (!isReconnect) {
          this.handleDisconnect();
          alert('Connection failed. Check server IP and try again.');
        }
      };

      this.ws.onclose = () => {
        console.log('Disconnected from server');
        this.isConnected = false;
        this.updateConnectionStatus('disconnected');

        // Only auto-reconnect if we were previously connected (in app screen)
        if (this.elements.appScreen.style.display !== 'none') {
          this.attemptReconnect();
        } else {
          this.handleDisconnect();
        }
      };

    } catch (error) {
      console.error('Connection error:', error);
      if (!isReconnect) {
        this.handleDisconnect();
        alert('Invalid server address');
      }
    }
  }

  attemptReconnect() {
    const { MAX_RECONNECT_ATTEMPTS, RECONNECT_DELAY } = DreamHackersApp.CONFIG;

    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.log('Max reconnect attempts reached');
      this.showReconnectFailed();
      return;
    }

    this.reconnectAttempts++;
    const delay = RECONNECT_DELAY * Math.pow(1.5, this.reconnectAttempts - 1);

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    this.updateConnectionStatus('reconnecting');
    this.showConnectionWarning();

    setTimeout(() => {
      if (this.serverIP) {
        this.connectToServer(this.serverIP, true);
      }
    }, delay);
  }

  showReconnectFailed() {
    this.updateConnectionStatus('disconnected');
    this.showToast('Connection lost. Please reconnect manually.', 'error');
  }

  handleMessage(message) {
    console.log('Received message:', message);

    switch (message.type) {
      case 'connection_established':
        console.log('Connection established:', message.message);
        break;

      case 'swipe_confirmed':
        console.log(`Swipe confirmed for ${message.objectId}`);
        break;

      case 'spawn_confirmed':
        console.log(`Object ${message.objectId} spawned in VR!`);
        this.triggerHaptic('success');
        this.showSpawnConfirmation(message.objectId);
        break;

      case 'error':
        console.error('Server error:', message.message);
        this.triggerHaptic('error');
        break;
    }
  }

  handleDisconnect() {
    this.isConnected = false;
    this.elements.connectBtn.disabled = false;
    this.elements.connectBtn.textContent = 'Connect';
    this.updateConnectionStatus('disconnected');
  }

  // ==========================================
  // UI HELPERS
  // ==========================================

  showAppScreen() {
    this.elements.connectionScreen.style.display = 'none';
    this.elements.appScreen.style.display = 'flex';
    this.updateConnectionStatus('connected');
    this.renderCard();
  }

  updateConnectionStatus(status) {
    const dot = this.elements.statusDot;
    const text = this.elements.statusText;

    // These elements are optional - skip if not present
    if (!dot || !text) return;

    dot.classList.remove('disconnected', 'reconnecting');

    switch (status) {
      case 'connected':
      case true:
        text.textContent = 'Connected';
        break;
      case 'disconnected':
      case false:
        dot.classList.add('disconnected');
        text.textContent = 'Disconnected';
        break;
      case 'reconnecting':
        dot.classList.add('reconnecting');
        text.textContent = 'Reconnecting...';
        break;
    }
  }

  showConnectionWarning() {
    if (this.elements.connectionWarning) {
      this.elements.connectionWarning.classList.add('show');
    }
  }

  hideConnectionWarning() {
    if (this.elements.connectionWarning) {
      this.elements.connectionWarning.classList.remove('show');
    }
  }

  updateQueueCount() {
    if (this.elements.queueCount) {
      this.elements.queueCount.textContent = `${this.swipeQueue.length} queued`;
    }
  }

  showSpawnConfirmation(objectId) {
    const obj = this.objects.find(o => o.id === objectId);
    const objName = obj ? obj.name : objectId;
    this.showToast(`${objName} spawned in VR!`, 'success');
  }

  showToast(message, type = 'info') {
    const container = this.elements.toastContainer;
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Remove after animation
    setTimeout(() => {
      toast.remove();
    }, 2000);
  }

  renderCard() {
    // Cleanup previous 3D viewer
    if (this.currentModelViewer) {
      this.currentModelViewer.destroy();
      this.currentModelViewer = null;
    }

    if (this.currentIndex >= this.objects.length) {
      this.showNoMoreCards();
      return;
    }

    const obj = this.objects[this.currentIndex];

    // Build card HTML with 3D canvas container
    this.elements.cardContainer.innerHTML = `
      <div class="card-container-tint tint-left"></div>
      <div class="card-container-tint tint-right"></div>
      <div class="card">
        <div class="card-3d-container" id="model-container"></div>
        <div class="card-name">${obj.name}</div>
        <div class="card-description">${obj.description}</div>
      </div>
      <div class="swipe-indicators swipe-left-indicator">✗</div>
      <div class="swipe-indicators swipe-right-indicator">✓</div>
    `;

    // Initialize 3D viewer
    const modelContainer = document.getElementById('model-container');
    if (modelContainer && typeof THREE !== 'undefined') {
      this.currentModelViewer = new ModelViewer(modelContainer, {
        color: obj.color || '#8B5CF6',
        autoRotate: true
      });

      // Try to load GLB model, fallback to primitive
      if (obj.model) {
        this.currentModelViewer.loadModel(obj.model, obj.id, obj.color || '#8B5CF6');
      } else {
        this.currentModelViewer.createPrimitive(obj.id, obj.color || '#8B5CF6');
      }
    } else {
      // Fallback to emoji if Three.js not available
      const card = this.elements.cardContainer.querySelector('.card');
      if (card) {
        const container = card.querySelector('.card-3d-container');
        if (container) {
          container.innerHTML = `<div class="card-emoji">${obj.thumbnail}</div>`;
        }
      }
    }
  }

  showNoMoreCards() {
    this.elements.cardContainer.style.display = 'none';
    this.elements.instructions.style.display = 'none';
    this.elements.noMoreCards.style.display = 'flex';
    // Hide action buttons on no more cards screen
    const actionButtons = document.getElementById('action-buttons');
    if (actionButtons) actionButtons.style.display = 'none';
  }

  restart() {
    this.currentIndex = 0;
    this.elements.cardContainer.style.display = 'flex';
    this.elements.instructions.style.display = 'flex';
    this.elements.noMoreCards.style.display = 'none';
    // Show action buttons again
    const actionButtons = document.getElementById('action-buttons');
    if (actionButtons) actionButtons.style.display = 'flex';
    this.renderCard();
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new DreamHackersApp();
  console.log('Dream Hackers app initialized');
});
