// Dream Hackers - Mobile Web App JavaScript

class DreamHackersApp {
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
      restartBtn: document.getElementById('restart-btn')
    };

    this.init();
  }

  async init() {
    // Load objects
    await this.loadObjects();

    // Setup event listeners
    this.setupEventListeners();

    // Try to get saved server IP
    const savedIP = localStorage.getItem('dream_hackers_server_ip');
    if (savedIP) {
      this.elements.serverIpInput.value = savedIP;
    }
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

    // Touch events for card swiping
    this.elements.cardContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    this.elements.cardContainer.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    this.elements.cardContainer.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });

    // Mouse events for desktop testing
    this.elements.cardContainer.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
  }

  connect() {
    const serverIP = this.elements.serverIpInput.value.trim();

    if (!serverIP) {
      alert('Please enter server IP address');
      return;
    }

    // Save server IP
    localStorage.setItem('dream_hackers_server_ip', serverIP);

    // Build WebSocket URL
    let wsUrl = serverIP;
    if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
      wsUrl = 'ws://' + wsUrl;
    }

    this.elements.connectBtn.disabled = true;
    this.elements.connectBtn.innerHTML = '<span class="loading"></span>';

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Connected to server');
        this.isConnected = true;

        // Identify as phone client
        this.ws.send(JSON.stringify({
          type: 'identify',
          clientType: 'phone',
          timestamp: Date.now()
        }));

        // Show app screen
        this.showAppScreen();
      };

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.handleDisconnect();
        alert('Connection failed. Check server IP and try again.');
      };

      this.ws.onclose = () => {
        console.log('Disconnected from server');
        this.handleDisconnect();
      };

    } catch (error) {
      console.error('Connection error:', error);
      this.handleDisconnect();
      alert('Invalid server address');
    }
  }

  handleMessage(message) {
    console.log('Received message:', message);

    switch (message.type) {
      case 'connection_established':
        console.log('Connection established:', message.message);
        break;

      case 'swipe_confirmed':
        console.log(`Swipe confirmed for ${message.objectId}`);
        // Optionally show success feedback
        break;

      case 'spawn_confirmed':
        console.log(`Object ${message.objectId} spawned in VR!`);
        // Optionally show spawn success
        break;

      case 'error':
        console.error('Server error:', message.message);
        break;
    }
  }

  handleDisconnect() {
    this.isConnected = false;
    this.elements.connectBtn.disabled = false;
    this.elements.connectBtn.textContent = 'Connect';
    this.updateConnectionStatus(false);
  }

  showAppScreen() {
    this.elements.connectionScreen.style.display = 'none';
    this.elements.appScreen.style.display = 'flex';
    this.updateConnectionStatus(true);
    this.renderCard();
  }

  updateConnectionStatus(connected) {
    if (connected) {
      this.elements.statusDot.classList.remove('disconnected');
      this.elements.statusText.textContent = 'Connected';
    } else {
      this.elements.statusDot.classList.add('disconnected');
      this.elements.statusText.textContent = 'Disconnected';
    }
  }

  renderCard() {
    if (this.currentIndex >= this.objects.length) {
      this.showNoMoreCards();
      return;
    }

    const obj = this.objects[this.currentIndex];

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-emoji">${obj.thumbnail}</div>
      <div class="card-name">${obj.name}</div>
      <div class="card-description">${obj.description}</div>
    `;

    // Clear container and add new card
    this.elements.cardContainer.innerHTML = '';
    this.elements.cardContainer.appendChild(card);

    // Add swipe indicators
    this.elements.cardContainer.innerHTML += `
      <div class="swipe-indicators swipe-left-indicator">✗</div>
      <div class="swipe-indicators swipe-right-indicator">✓</div>
    `;
  }

  showNoMoreCards() {
    this.elements.cardContainer.style.display = 'none';
    this.elements.instructions.style.display = 'none';
    this.elements.noMoreCards.style.display = 'flex';
  }

  restart() {
    this.currentIndex = 0;
    this.elements.cardContainer.style.display = 'flex';
    this.elements.instructions.style.display = 'block';
    this.elements.noMoreCards.style.display = 'none';
    this.renderCard();
  }

  // Touch event handlers
  handleTouchStart(e) {
    if (e.target.classList.contains('card')) {
      this.isDragging = true;
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
      e.target.classList.add('swiping');
    }
  }

  handleTouchMove(e) {
    if (!this.isDragging) return;
    e.preventDefault();

    const card = e.target;
    this.currentX = e.touches[0].clientX - this.startX;
    this.currentY = e.touches[0].clientY - this.startY;

    const rotation = this.currentX / 10;
    card.style.transform = `translate(${this.currentX}px, ${this.currentY}px) rotate(${rotation}deg)`;

    // Show indicators
    const leftIndicator = document.querySelector('.swipe-left-indicator');
    const rightIndicator = document.querySelector('.swipe-right-indicator');

    if (this.currentX < -50) {
      leftIndicator.classList.add('show');
      rightIndicator.classList.remove('show');
    } else if (this.currentX > 50) {
      rightIndicator.classList.add('show');
      leftIndicator.classList.remove('show');
    } else {
      leftIndicator.classList.remove('show');
      rightIndicator.classList.remove('show');
    }
  }

  handleTouchEnd(e) {
    if (!this.isDragging) return;

    this.isDragging = false;
    const card = e.target;
    card.classList.remove('swiping');

    // Determine swipe direction
    const threshold = 100;

    if (this.currentX < -threshold) {
      // Swipe left - discard
      this.swipeLeft(card);
    } else if (this.currentX > threshold) {
      // Swipe right - send to VR
      this.swipeRight(card);
    } else {
      // Return to center
      card.style.transform = '';
      document.querySelectorAll('.swipe-indicators').forEach(el => el.classList.remove('show'));
    }

    this.currentX = 0;
    this.currentY = 0;
  }

  // Mouse event handlers (for desktop testing)
  handleMouseDown(e) {
    if (e.target.classList.contains('card')) {
      this.isDragging = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
      e.target.classList.add('swiping');
    }
  }

  handleMouseMove(e) {
    if (!this.isDragging) return;

    const card = document.querySelector('.card.swiping');
    if (!card) return;

    this.currentX = e.clientX - this.startX;
    this.currentY = e.clientY - this.startY;

    const rotation = this.currentX / 10;
    card.style.transform = `translate(${this.currentX}px, ${this.currentY}px) rotate(${rotation}deg)`;

    // Show indicators
    const leftIndicator = document.querySelector('.swipe-left-indicator');
    const rightIndicator = document.querySelector('.swipe-right-indicator');

    if (this.currentX < -50) {
      leftIndicator.classList.add('show');
      rightIndicator.classList.remove('show');
    } else if (this.currentX > 50) {
      rightIndicator.classList.add('show');
      leftIndicator.classList.remove('show');
    } else {
      leftIndicator.classList.remove('show');
      rightIndicator.classList.remove('show');
    }
  }

  handleMouseUp(e) {
    if (!this.isDragging) return;

    this.isDragging = false;
    const card = document.querySelector('.card.swiping');
    if (!card) return;

    card.classList.remove('swiping');

    const threshold = 100;

    if (this.currentX < -threshold) {
      this.swipeLeft(card);
    } else if (this.currentX > threshold) {
      this.swipeRight(card);
    } else {
      card.style.transform = '';
      document.querySelectorAll('.swipe-indicators').forEach(el => el.classList.remove('show'));
    }

    this.currentX = 0;
    this.currentY = 0;
  }

  swipeLeft(card) {
    console.log('Swiped left - discarded');
    card.classList.add('swipe-left');
    document.querySelectorAll('.swipe-indicators').forEach(el => el.classList.remove('show'));

    setTimeout(() => {
      this.currentIndex++;
      this.renderCard();
    }, 300);
  }

  swipeRight(card) {
    const obj = this.objects[this.currentIndex];
    console.log('Swiped right - sending to VR:', obj.id);

    // Send to server
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'swipe_right',
        objectId: obj.id,
        timestamp: Date.now()
      }));
    }

    card.classList.add('swipe-right');
    document.querySelectorAll('.swipe-indicators').forEach(el => el.classList.remove('show'));

    setTimeout(() => {
      this.currentIndex++;
      this.renderCard();
    }, 300);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new DreamHackersApp();
  console.log('Dream Hackers app initialized');
});
