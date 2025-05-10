// Simple Sound Player
document.addEventListener('DOMContentLoaded', function() {
    // Preload images
    function preloadImages() {
        const imagesToPreload = [
            "https://i.pinimg.com/originals/5f/a7/56/5fa756bd5a44204fc72891f265b4fd2b.gif",
            "https://i.pinimg.com/originals/e5/18/e8/e518e8a24b9c04a887bd4432289a5e88.gif",
            "https://i.pinimg.com/originals/c5/4e/8f/c54e8f5b82a0b0c6ff9d8ccb3f5d66fe.gif"
        ];

        imagesToPreload.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    // Call preload function
    preloadImages();

    // State
    const state = {
      currentSound: null,
      isPlaying: false,
        hideUI: localStorage.getItem('hideUI') === 'true',
        useSoundBackground: true,
        customBackground: null
    };
    
    // Audio element
    const audio = new Audio();
    audio.loop = true;

    // Fallback sounds (original sounds)
    const fallbackSounds = [
          {
            id: "heavy-rain",
            name: "Heavy Rain",
            url: "https://cdn.jsdelivr.net/gh/lofidot/moodist@main/public/sounds/rain/heavy-rain.mp3",
            imageUrl: "https://i.pinimg.com/originals/5f/a7/56/5fa756bd5a44204fc72891f265b4fd2b.gif",
        thumbnailUrl: "https://i.pinimg.com/originals/5f/a7/56/5fa756bd5a44204fc72891f265b4fd2b.gif",
        category: "Nature"
          },
          {
            id: "light-rain",
            name: "Light Rain",
            url: "https://cdn.jsdelivr.net/gh/lofidot/moodist@main/public/sounds/rain/light-rain.mp3",
            imageUrl: "https://i.pinimg.com/originals/5f/a7/56/5fa756bd5a44204fc72891f265b4fd2b.gif",
        thumbnailUrl: "https://i.pinimg.com/originals/5f/a7/56/5fa756bd5a44204fc72891f265b4fd2b.gif",
        category: "Nature"
      },
      {
        id: "white-noise",
        name: "White Noise",
        url: "https://cdn.jsdelivr.net/gh/lofidot/moodist@main/public/sounds/noise/white-noise.mp3",
        imageUrl: "https://i.pinimg.com/originals/5f/a7/56/5fa756bd5a44204fc72891f265b4fd2b.gif",
        thumbnailUrl: "https://i.pinimg.com/originals/5f/a7/56/5fa756bd5a44204fc72891f265b4fd2b.gif",
        category: "Focus"
      },
      {
        id: "brown-noise",
        name: "Brown Noise",
        url: "https://cdn.jsdelivr.net/gh/lofidot/moodist@main/public/sounds/noise/brown-noise.mp3",
        imageUrl: "https://i.pinimg.com/originals/5f/a7/56/5fa756bd5a44204fc72891f265b4fd2b.gif",
        thumbnailUrl: "https://i.pinimg.com/originals/5f/a7/56/5fa756bd5a44204fc72891f265b4fd2b.gif",
        category: "Focus"
      },
      {
        id: "coffee-shop",
        name: "Coffee Shop",
        url: "https://cdn.jsdelivr.net/gh/lofidot/moodist@main/public/sounds/ambient/coffee-shop.mp3",
        imageUrl: "https://i.pinimg.com/originals/e5/18/e8/e518e8a24b9c04a887bd4432289a5e88.gif",
        thumbnailUrl: "https://i.pinimg.com/originals/e5/18/e8/e518e8a24b9c04a887bd4432289a5e88.gif",
        category: "Ambient"
      },
      {
        id: "fireplace",
        name: "Fireplace",
        url: "https://cdn.jsdelivr.net/gh/lofidot/moodist@main/public/sounds/ambient/fireplace.mp3",
        imageUrl: "https://i.pinimg.com/originals/c5/4e/8f/c54e8f5b82a0b0c6ff9d8ccb3f5d66fe.gif",
        thumbnailUrl: "https://i.pinimg.com/originals/c5/4e/8f/c54e8f5b82a0b0c6ff9d8ccb3f5d66fe.gif",
        category: "Ambient"
      }
    ];

    // Fallback themes (original themes)
    const fallbackThemes = [
      {
        id: "rain",
        name: "Rain",
        imageUrl: "https://i.pinimg.com/originals/5f/a7/56/5fa756bd5a44204fc72891f265b4fd2b.gif",
        thumbnailUrl: "https://i.pinimg.com/originals/5f/a7/56/5fa756bd5a44204fc72891f265b4fd2b.gif"
      },
      {
        id: "forest",
        name: "Forest",
        imageUrl: "https://i.pinimg.com/originals/e5/18/e8/e518e8a24b9c04a887bd4432289a5e88.gif",
        thumbnailUrl: "https://i.pinimg.com/originals/e5/18/e8/e518e8a24b9c04a887bd4432289a5e88.gif"
      }
      // ... other fallback themes
    ];

    // Function to get sounds from Webflow CMS
    async function getSoundsFromWebflow() {
      try {
        const soundElements = document.querySelectorAll('[data-sound-item]');
        if (!soundElements || soundElements.length === 0) {
          console.log('No Webflow CMS sounds found, using fallback sounds');
          return fallbackSounds;
        }

        const webflowSounds = Array.from(soundElements).map(element => ({
          id: element.getAttribute('data-sound-id') || generateUniqueId(),
          name: element.getAttribute('data-sound-name') || 'Untitled Sound',
          url: element.getAttribute('data-sound-url'),
          imageUrl: element.getAttribute('data-sound-background') || element.getAttribute('data-sound-thumbnail'),
          thumbnailUrl: element.getAttribute('data-sound-thumbnail'),
          category: element.getAttribute('data-sound-category') || 'Other'
        }));

        // Validate sounds and filter out invalid ones
        const validSounds = webflowSounds.filter(sound => {
          const isValid = sound.url && (sound.thumbnailUrl || sound.imageUrl);
          if (!isValid) {
            console.warn(`Invalid sound configuration for "${sound.name}"`);
          }
          return isValid;
        });

        if (validSounds.length === 0) {
          console.log('No valid Webflow CMS sounds found, using fallback sounds');
          return fallbackSounds;
        }

        return validSounds;
      } catch (error) {
        console.error('Error loading Webflow CMS sounds:', error);
        return fallbackSounds;
      }
    }

    // Function to get themes from Webflow CMS
    async function getThemesFromWebflow() {
      try {
        const themeElements = document.querySelectorAll('[data-theme-item]');
        if (!themeElements || themeElements.length === 0) {
          console.log('No Webflow CMS themes found, using fallback themes');
          return fallbackThemes;
        }

        const webflowThemes = Array.from(themeElements).map(element => ({
          id: element.getAttribute('data-theme-id') || generateUniqueId(),
          name: element.getAttribute('data-theme-name') || 'Untitled Theme',
          imageUrl: element.getAttribute('data-theme-url'),
          thumbnailUrl: element.getAttribute('data-theme-thumbnail') || element.getAttribute('data-theme-url')
        }));

        // Validate themes and filter out invalid ones
        const validThemes = webflowThemes.filter(theme => {
          const isValid = theme.imageUrl && theme.thumbnailUrl;
          if (!isValid) {
            console.warn(`Invalid theme configuration for "${theme.name}"`);
          }
          return isValid;
        });

        if (validThemes.length === 0) {
          console.log('No valid Webflow CMS themes found, using fallback themes');
          return fallbackThemes;
        }

        return validThemes;
      } catch (error) {
        console.error('Error loading Webflow CMS themes:', error);
        return fallbackThemes;
      }
    }

    // Generate unique ID for sounds without IDs
    function generateUniqueId() {
      return 'sound-' + Math.random().toString(36).substr(2, 9);
    }

    // Initialize sounds
    let sounds = [];

    // Load sounds from Webflow CMS or use fallbacks
    async function loadSounds() {
      try {
        sounds = await getSoundsFromWebflow();
        renderSoundGrid();
        renderSoundLibrary();
      } catch (error) {
        console.error('Error initializing sounds:', error);
        sounds = fallbackSounds;
        renderSoundGrid();
        renderSoundLibrary();
      }
    }

    // Initialize themes
    let themes = [];

    // Load themes from Webflow CMS or use fallbacks
    async function loadThemes() {
      try {
        themes = await getThemesFromWebflow();
        renderThemeGrid();
      } catch (error) {
        console.error('Error initializing themes:', error);
        themes = fallbackThemes;
        renderThemeGrid();
      }
    }

    // DOM Elements with error handling
    const getElement = (id) => {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`Element with id '${id}' not found`);
            throw new Error(`Required element '${id}' is missing`);
        }
        return element;
    };

    const app = getElement('app');
    const backgroundOverlay = getElement('background-overlay');
    const soundGrid = getElement('sound-grid');
    const playButton = getElement('play-btn');
    const playIcon = getElement('play-icon');
    const pauseIcon = getElement('pause-icon');
    const hideUIButton = getElement('hide-ui-btn');
    const themeButton = getElement('theme-btn');
    const themeModal = getElement('theme-modal');
    const closeModalButton = getElement('close-modal');
    const useSoundBgCheckbox = getElement('use-sound-bg');
    const customBgUrlInput = getElement('custom-bg-url');
    const applyBgButton = getElement('apply-bg-btn');
    const soundLibraryBtn = getElement('sound-library-btn');
    const soundLibrary = getElement('sound-library');
    const closeLibraryBtn = getElement('close-library');

    // Timer Toggle Functionality
    const timerToggleBtn = document.getElementById('timer-toggle-btn');
    const timerContainer = document.querySelector('.timer-container');
    
    // Load saved timer visibility state
    const timerVisible = localStorage.getItem('timerVisible') === 'true';
    if (timerVisible) {
        timerContainer.classList.add('visible');
        timerToggleBtn.classList.add('active');
    }
    
    timerToggleBtn.addEventListener('click', () => {
        timerContainer.classList.toggle('visible');
        timerToggleBtn.classList.toggle('active');
        
        // Save timer visibility state
        localStorage.setItem('timerVisible', timerContainer.classList.contains('visible'));
    });

    // Functions
    function playSound() {
      if (!state.currentSound) return;
      
        // Only set the source if it's different from the current one
        if (!audio.src || audio.src !== state.currentSound.url) {
            audio.src = state.currentSound.url;
        }
        
        audio.play()
        .then(() => {
          state.isPlaying = true;
          updatePlayButton();
          updateBackground();
          renderSoundGrid();
          updateSoundLibraryIcons();
          backgroundOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        })
        .catch(error => {
          console.error('Error playing audio:', error);
          showToast('Could not play audio. Please try again.', 'error');
          state.isPlaying = false;
        });
    }
    
    function pauseSound() {
        audio.pause();
      state.isPlaying = false;
      updatePlayButton();
      updateSoundLibraryIcons();
      backgroundOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      renderSoundGrid();
    }
    
    function updatePlayButton() {
        playButton.classList.toggle('active', state.isPlaying);
        playIcon.classList.toggle('hidden', state.isPlaying);
        pauseIcon.classList.toggle('hidden', !state.isPlaying);
    }

    function updateBackground() {
        if (state.useSoundBackground && state.currentSound) {
            app.style.backgroundImage = `url(${state.currentSound.imageUrl})`;
        } else if (state.customBackground) {
            app.style.backgroundImage = `url(${state.customBackground})`;
        } else {
            app.style.backgroundImage = 'none';
        }
        backgroundOverlay.style.backgroundColor = state.isPlaying ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.7)';
    }

    function toggleUIVisibility() {
        state.hideUI = !state.hideUI;
        
        // Hide/show elements
        const controlsContainer = document.querySelector('.controls-container');
        const soundGrid = document.getElementById('sound-grid');
        const timerContainer = document.querySelector('.timer-container');
        const unhideButton = document.createElement('button');
        
        if (state.hideUI) {
            // Hide elements
            if (controlsContainer) controlsContainer.classList.add('hidden');
            if (soundGrid) soundGrid.classList.add('hidden');
            
            // Create and show unhide button
            unhideButton.id = 'unhide-btn';
            unhideButton.className = 'unhide-button';
            unhideButton.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 2L22 22" stroke="currentColor" stroke-width="2"/>
                    <path d="M6.71277 6.7226C3.66479 8.79527 2 12 2 12C2 12 5.63636 19 12 19C14.0503 19 15.8174 18.2734 17.2711 17.2884L6.71277 6.7226Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M14 14.2362C13.4692 14.7112 12.7684 15.0001 12 15.0001C10.3431 15.0001 9 13.657 9 12.0001C9 11.1764 9.33193 10.4303 9.86932 9.88818" stroke="currentColor" stroke-width="2"/>
                    <path d="M15.0005 12C15.0005 12 15.0005 12.0001 15.0005 12.0001M12.0005 9C12.0005 9 12.0005 9.00006 12.0005 9.00006" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 5C16.7915 5 20.0334 8.62459 21.4938 10.7509C22.0118 11.5037 22.0118 12.4963 21.4938 13.2491C21.1159 13.8163 20.5485 14.5695 19.8071 15.3454" stroke="currentColor" stroke-width="2"/>
                </svg>
            `;
            unhideButton.addEventListener('click', toggleUIVisibility);
            document.body.appendChild(unhideButton);
        } else {
            // Show elements
            if (controlsContainer) controlsContainer.classList.remove('hidden');
            if (soundGrid) soundGrid.classList.remove('hidden');
            
            // Remove unhide button
            const existingUnhideBtn = document.getElementById('unhide-btn');
            if (existingUnhideBtn) existingUnhideBtn.remove();
        }
        
        // Don't hide timer if it's visible
        if (timerContainer && timerContainer.classList.contains('visible')) {
            timerContainer.classList.remove('hidden');
        }
        
        localStorage.setItem('hideUI', state.hideUI);
    }
    
    function handlePlayPauseClick(event) {
        event.stopPropagation(); // Prevent event bubbling
        
        if (!state.currentSound) {
            showToast('Please select a sound first', 'info');
            return;
        }
        
        if (state.isPlaying) {
            pauseSound();
        } else {
            playSound();
        }
    }

    function selectSound(sound) {
        const wasPlaying = state.isPlaying && state.currentSound && state.currentSound.id === sound.id;
        state.currentSound = sound;
        
        if (wasPlaying) {
        pauseSound();
      } else {
        playSound();
        }
        
        updateBackground();
        renderSoundGrid();
        updateSoundLibraryIcons();
    }

    function handleImageLoad(img) {
        img.setAttribute('loaded', 'true');
        img.style.animation = 'none';
    }

    function renderSoundGrid() {
        soundGrid.innerHTML = '';
        
        sounds.forEach(sound => {
            const soundCard = document.createElement('div');
            soundCard.className = 'sound-card';
            
            const isActive = state.currentSound && state.currentSound.id === sound.id;
            const isCurrentlyPlaying = isActive && state.isPlaying;
            
            soundCard.innerHTML = `
                <button class="sound-button ${isActive ? 'active' : ''} ${isCurrentlyPlaying ? 'playing' : ''}" data-sound-id="${sound.id}">
                    <img loading="lazy" src="${sound.thumbnailUrl}" alt="${sound.name}" width="100" height="100">
                    <div class="sound-overlay">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            ${isCurrentlyPlaying ? 
                                '<path d="M6 4H10V20H6V4Z" fill="white"/><path d="M14 4H18V20H14V4Z" fill="white"/>' : 
                                '<path d="M5 4.99998V19C5 19.3468 5.18 19.6666 5.48 19.8358C5.783 20.005 6.158 19.9941 6.45 19.809L19.45 12.809C19.7231 12.631 19.893 12.3244 19.893 11.9975C19.893 11.6706 19.7231 11.364 19.45 11.186L6.45 4.18598C6.158 4.00098 5.783 3.98998 5.48 4.15898C5.18 4.32798 5 4.64798 5 4.99998Z" fill="white"/>'}
                        </svg>
                    </div>
                    <div class="sound-indicator"></div>
                </button>
                <span class="sound-name">${sound.name}</span>
            `;
            
            const soundButton = soundCard.querySelector('.sound-button');
            const img = soundButton.querySelector('img');
            
            // Add load event listener
            img.addEventListener('load', () => handleImageLoad(img));
            
            soundButton.addEventListener('click', () => selectSound(sound));
            
            soundGrid.appendChild(soundCard);
        });
    }

    function showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideUp 0.3s forwards';
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 300);
        }, 3000);
    }

    function openThemeModal() {
        themeModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        themeModal.querySelector('.modal-container').classList.add('modal-open');
    }

    function closeThemeModal() {
        const modalContainer = themeModal.querySelector('.modal-container');
        modalContainer.classList.remove('modal-open');
        modalContainer.classList.add('modal-close');
        
        setTimeout(() => {
            themeModal.classList.add('hidden');
            document.body.style.overflow = '';
            modalContainer.classList.remove('modal-close');
        }, 300);
    }

    function setCustomBackground(url) {
        if (!url) {
            showToast('Please enter a valid image URL', 'error');
        return;
      }
      
        // Test if the image URL is valid
        const img = new Image();
        img.onload = () => {
            state.customBackground = url;
            state.useSoundBackground = false;
            useSoundBgCheckbox.checked = false;
          updateBackground();
            showToast('Background updated successfully');
            localStorage.setItem('customBackground', url);
            localStorage.setItem('useSoundBackground', 'false');
            closeThemeModal();
        };
        img.onerror = () => {
            showToast('Invalid image URL. Please try another.', 'error');
        };
        img.src = url;
    }

    function toggleSoundLibrary() {
        // Check if sound library exists and has sounds
        const soundLibrary = document.getElementById('sound-library');
        if (!soundLibrary || !sounds || sounds.length === 0) {
            showToast('Sound library is not available', 'error');
            return;
        }
        
        soundLibrary.classList.toggle('active');
        const soundLibraryBtn = document.getElementById('sound-library-btn');
        if (soundLibraryBtn) {
            soundLibraryBtn.classList.toggle('active', soundLibrary.classList.contains('active'));
        }
    }

    function closeSoundLibrary() {
      soundLibrary.classList.remove('active');
      soundLibraryBtn.classList.remove('active');
    }

    function renderSoundLibrary() {
      const categories = [...new Set(sounds.map(sound => sound.category))];
      const sheetContent = soundLibrary.querySelector('.sheet-content');
      sheetContent.innerHTML = '';

      categories.forEach(category => {
        const categorySection = document.createElement('div');
        categorySection.className = 'sound-category';
        categorySection.innerHTML = `
          <h3>${category}</h3>
          <div class="sound-library-list">
            ${sounds
              .filter(sound => sound.category === category)
              .map(sound => {
                const isActive = state.currentSound && state.currentSound.id === sound.id && state.isPlaying;
                return `
                  <div class="library-sound-item ${isActive ? 'active' : ''}" data-sound-id="${sound.id}">
                    <div class="library-sound-thumbnail">
                      <img src="${sound.thumbnailUrl}" alt="${sound.name}">
                    </div>
                    <span class="library-sound-name">${sound.name}</span>
                    <div class="library-sound-status">
                      <svg class="play-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5.14v14.72a.5.5 0 00.76.43l11.52-7.36a.5.5 0 000-.86L8.76 4.71a.5.5 0 00-.76.43z" fill="currentColor"/>
                      </svg>
                      <svg class="pause-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5h2v14H8V5zm6 0h2v14h-2V5z" fill="currentColor"/>
                      </svg>
                    </div>
                  </div>
                `;
              }).join('')}
          </div>
        `;

        // Add click event listeners to sound items
        categorySection.querySelectorAll('.library-sound-item').forEach(item => {
          item.addEventListener('click', () => {
            const soundId = item.dataset.soundId;
            const sound = sounds.find(s => s.id === soundId);
            if (sound) {
              selectSound(sound);
              closeSoundLibrary();
            }
          });
        });

        sheetContent.appendChild(categorySection);
      });
    }

    function updateSoundLibraryIcons() {
      const soundItems = document.querySelectorAll('.library-sound-item');
      soundItems.forEach(item => {
        const soundId = item.dataset.soundId;
        const isActive = state.currentSound && state.currentSound.id === soundId && state.isPlaying;
        item.classList.toggle('active', isActive);
      });
    }

    function toggleSound(soundId) {
      const audio = sounds[soundId];
      const soundItem = document.querySelector(`[data-sound-id="${soundId}"]`);

      if (audio.paused) {
        audio.play();
        soundItem.classList.add('active');
      } else {
        audio.pause();
        soundItem.classList.remove('active');
      }
      
      updateSoundLibraryIcons();
    }

    function initializeSoundLibrary() {
      const soundItems = document.querySelectorAll('.library-sound-item');
      soundItems.forEach(item => {
        const soundId = item.getAttribute('data-sound-id');
        const audio = sounds[soundId];
        
        audio.addEventListener('ended', () => {
          item.classList.remove('active');
          updateSoundLibraryIcons();
        });
        
        item.addEventListener('click', () => toggleSound(soundId));
      });
    }

    function renderThemeGrid() {
      const presetGrid = document.querySelector('.preset-grid');
      if (!presetGrid) return;

      presetGrid.innerHTML = themes.map(theme => `
        <div class="preset-theme" data-theme="${theme.imageUrl}">
          <div class="preset-preview" style="background-image: url('${theme.thumbnailUrl}')"></div>
          <span>${theme.name}</span>
        </div>
      `).join('');

      // Reattach event listeners for theme buttons
      document.querySelectorAll('.preset-theme').forEach(button => {
        button.addEventListener('click', () => {
          const themeUrl = button.dataset.theme;
          setCustomBackground(themeUrl);
        });
      });
    }

    // Event Listeners
    playButton.addEventListener('click', () => {
      if (!state.currentSound) {
        const firstSound = document.querySelector('.sound');
        if (firstSound) {
          firstSound.click();
        }
      }
      state.isPlaying = !state.isPlaying;
      if (state.isPlaying) {
        playSound();
      } else {
        pauseSound();
      }
    });
    hideUIButton.addEventListener('click', toggleUIVisibility);
    themeButton.addEventListener('click', openThemeModal);
    closeModalButton.addEventListener('click', closeThemeModal);
    soundLibraryBtn.addEventListener('click', toggleSoundLibrary);
    closeLibraryBtn.addEventListener('click', closeSoundLibrary);
    
    useSoundBgCheckbox.addEventListener('change', (e) => {
        state.useSoundBackground = e.target.checked;
            updateBackground();
        localStorage.setItem('useSoundBackground', e.target.checked);
        if (e.target.checked) {
            showToast('Using sound backgrounds');
        }
    });

    applyBgButton.addEventListener('click', () => {
        setCustomBackground(customBgUrlInput.value.trim());
    });

    // Handle preset theme buttons
    document.querySelectorAll('.preset-theme').forEach(button => {
        button.addEventListener('click', () => {
            const themeUrl = button.dataset.theme;
            setCustomBackground(themeUrl);
        });
    });

    // Close modal when clicking overlay
    themeModal.querySelector('.modal-overlay').addEventListener('click', closeThemeModal);

    // Handle escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !themeModal.classList.contains('hidden')) {
            closeThemeModal();
        }
    });

    // Initialize
    try {
        // Load saved theme preferences
        const savedBackground = localStorage.getItem('customBackground');
        const useSoundBg = localStorage.getItem('useSoundBackground');
        
        if (useSoundBg !== null) {
            state.useSoundBackground = useSoundBg === 'true';
            useSoundBgCheckbox.checked = state.useSoundBackground;
        }
        
        if (savedBackground) {
            state.customBackground = savedBackground;
            customBgUrlInput.value = savedBackground;
        }

        // Load sounds and themes, then initialize UI
        Promise.all([loadSounds(), loadThemes()]).then(() => {
        updateBackground();
          initializeSoundLibrary();
        });
    } catch (error) {
        console.error('Initialization error:', error);
        showToast('Failed to initialize the player. Please refresh the page.', 'error');
    }
});

// Timer Functionality
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const timerDisplay = document.getElementById('timerDisplay');
  const timeDisplay = document.getElementById('time');
  const progressBar = document.getElementById('progress');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const restartBtn = document.getElementById('restartBtn');
  const decreaseBtn = document.getElementById('decrease');
  const increaseBtn = document.getElementById('increase');
  const modeButtons = document.querySelectorAll('.mode-btn');
  const modeSwitcher = document.getElementById('modeSwitcher');
  const timerTypeDots = document.querySelectorAll('.timer-type-dot');
  const helpBtn = document.getElementById('helpBtn');
  const instructionsContainer = document.getElementById('instructionsContainer');
  const closeInstructions = document.getElementById('closeInstructions');
  
  // Timer State
  let mode = 'focus';
  let timerType = 'pomodoro'; // pomodoro, simple, endless
  let timeLeft = 25 * 60; // 25 minutes in seconds
  let totalTime = 25 * 60;
  let isRunning = false;
  let isEditing = false;
  let timer = null;
  let elapsedTime = 0; // For endless timer
  
  // Format seconds to HH:MM:SS or MM:SS
  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }
  
  // Parse time string to seconds
  function parseTime(timeString) {
    const parts = timeString.split(':').map(Number);
    
    if (parts.length === 3) {
      // Format: HH:MM:SS
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // Format: MM:SS
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
      // Format: minutes only
      return parts[0] * 60;
    }
    
    return 0;
  }
  
  // Update display
  function updateDisplay() {
    if (timerType === 'endless') {
      timeDisplay.textContent = formatTime(elapsedTime);
      progressBar.style.width = '0%';
    } else {
      timeDisplay.textContent = formatTime(timeLeft);
      const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;
      progressBar.style.width = `${progressPercent}%`;
    }
    
    // Toggle button visibility
    if (isRunning) {
      startBtn.style.display = 'none';
      pauseBtn.classList.add('visible');
      restartBtn.classList.add('visible');
    } else {
      startBtn.style.display = 'flex';
      pauseBtn.classList.remove('visible');
      restartBtn.classList.remove('visible');
    }
  }
  
  // Toggle timer
  function toggleTimer() {
    if (isRunning) {
      clearInterval(timer);
      isRunning = false;
      enableControls();
    } else {
      if (timerType !== 'endless' && timeLeft <= 0) resetTimer();
      
      timer = setInterval(() => {
        if (timerType === 'endless') {
          elapsedTime++;
          updateDisplay();
        } else {
          timeLeft--;
          updateDisplay();
          
          if (timeLeft <= 0) {
            clearInterval(timer);
            isRunning = false;
            
            // Auto-start break after focus ends (only for pomodoro)
            if (timerType === 'pomodoro' && mode === 'focus') {
              toggleMode('break');
              toggleTimer(); // Start break timer automatically
            } else {
              enableControls();
            }
          }
        }
      }, 1000);
      
      isRunning = true;
      disableControls();
    }
    
    updateDisplay();
  }
  
  // Reset timer
  function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    
    if (timerType === 'endless') {
      elapsedTime = 0;
    } else if (timerType === 'pomodoro') {
      if (mode === 'focus') {
        timeLeft = 25 * 60;
        totalTime = 25 * 60;
      } else {
        timeLeft = 5 * 60;
        totalTime = 5 * 60;
      }
    } else if (timerType === 'simple') {
      timeLeft = 25 * 60;
      totalTime = 25 * 60;
    }
    
    updateDisplay();
    enableControls();
  }
  
  // Toggle mode (only for pomodoro)
  function toggleMode(newMode) {
    if (newMode === mode || timerType !== 'pomodoro') return;
    
    mode = newMode;
    clearInterval(timer);
    isRunning = false;
    
    if (mode === 'focus') {
      timeLeft = 25 * 60;
      totalTime = 25 * 60;
    } else {
      timeLeft = 5 * 60;
      totalTime = 5 * 60;
    }
    
    updateDisplay();
    enableControls();
    
    // Update active button
    modeButtons.forEach(btn => {
      if (btn.dataset.mode === mode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
  
  // Change timer type
  function changeTimerType(newType) {
    if (newType === timerType) return;
    
    timerType = newType;
    clearInterval(timer);
    isRunning = false;
    
    // Update timer settings based on type
    if (timerType === 'pomodoro') {
      modeSwitcher.classList.remove('hidden');
      mode = 'focus';
      timeLeft = 25 * 60;
      totalTime = 25 * 60;
    } else if (timerType === 'simple') {
      modeSwitcher.classList.add('hidden');
      timeLeft = 25 * 60;
      totalTime = 25 * 60;
    } else if (timerType === 'endless') {
      modeSwitcher.classList.add('hidden');
      elapsedTime = 0;
    }
    
    // Update active dot
    timerTypeDots.forEach(dot => {
      if (dot.dataset.timerType === timerType) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
    
    // Update mode buttons
    modeButtons.forEach(btn => {
      if (btn.dataset.mode === 'focus') {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    updateDisplay();
    enableControls();
  }
  
  // Adjust time
  function adjustTime(amount) {
    if (isRunning || timerType === 'endless') return;
    
    timeLeft = Math.max(0, timeLeft + amount);
    totalTime = timeLeft;
    updateDisplay();
  }
  
  // Handle time display click for editing
  function handleTimeClick() {
    if (isRunning || isEditing || timerType === 'endless') return;
    
    isEditing = true;
    
    // Replace display with input
    const currentTimeText = timeDisplay.textContent;
    timeDisplay.innerHTML = `<input type="text" class="time-input" value="${currentTimeText}" maxlength="8">`;
    
    const timeInput = document.querySelector('.time-input');
    timeInput.focus();
    timeInput.select();
    
    // Handle input blur
    timeInput.addEventListener('blur', finishEditing);
    
    // Handle enter key
    timeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        finishEditing();
      }
    });
    
    // Handle input
    timeInput.addEventListener('input', (e) => {
      // Allow only numbers and colon
      e.target.value = e.target.value.replace(/[^0-9:]/g, '');
    });
  }
  
  // Finish editing time
  function finishEditing() {
    const timeInput = document.querySelector('.time-input');
    if (!timeInput) return;
    
    let timeValue = timeInput.value;
    
    // Process numeric-only input
    if (!timeValue.includes(':')) {
      // Convert minutes to proper time format
      const minutes = parseInt(timeValue, 10) || 0;
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      
      if (hours > 0) {
        timeValue = `${hours}:${mins.toString().padStart(2, '0')}:00`;
      } else {
        timeValue = `${mins.toString().padStart(2, '0')}:00`;
      }
    } else if (timeValue.split(':').length === 2) {
      // MM:SS format, keep as is
      const [mins, secs] = timeValue.split(':');
      timeValue = `${mins.padStart(2, '0')}:${secs.padStart(2, '0')}`;
    } else if (timeValue.split(':').length === 3) {
      // HH:MM:SS format, keep as is
      const [hours, mins, secs] = timeValue.split(':');
      timeValue = `${hours}:${mins.padStart(2, '0')}:${secs.padStart(2, '0')}`;
    }
    
    // Parse and update time
    timeLeft = parseTime(timeValue);
    totalTime = timeLeft;
    
    // Restore display
    timeDisplay.innerHTML = '';
    timeDisplay.textContent = formatTime(timeLeft);
    isEditing = false;
  }
  
  // Disable controls during running state
  function disableControls() {
    decreaseBtn.classList.add('disabled');
    increaseBtn.classList.add('disabled');
    modeButtons.forEach(btn => btn.classList.add('disabled'));
    timerDisplay.classList.add('disabled');
    timerTypeDots.forEach(dot => dot.parentElement.classList.add('disabled'));
  }
  
  // Enable controls when not running
  function enableControls() {
    decreaseBtn.classList.remove('disabled');
    increaseBtn.classList.remove('disabled');
    modeButtons.forEach(btn => btn.classList.remove('disabled'));
    timerDisplay.classList.remove('disabled');
    timerTypeDots.forEach(dot => dot.parentElement.classList.remove('disabled'));
  }
  
  // Event Listeners
  startBtn.addEventListener('click', toggleTimer);
  pauseBtn.addEventListener('click', toggleTimer);
  restartBtn.addEventListener('click', resetTimer);
  decreaseBtn.addEventListener('click', () => adjustTime(-60)); // Decrease by 1 minute
  increaseBtn.addEventListener('click', () => adjustTime(60));  // Increase by 1 minute
  timeDisplay.addEventListener('click', handleTimeClick);
  
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!isRunning && timerType === 'pomodoro') {
        toggleMode(btn.dataset.mode);
      }
    });
  });
  
  timerTypeDots.forEach(dot => {
    dot.addEventListener('click', () => {
      if (!isRunning) {
        changeTimerType(dot.dataset.timerType);
      }
    });
  });
  
  helpBtn.addEventListener('click', () => {
    instructionsContainer.classList.add('visible');
  });

  closeInstructions.addEventListener('click', () => {
    instructionsContainer.classList.remove('visible');
  });
  
  // Initialize
  updateDisplay();
});
  