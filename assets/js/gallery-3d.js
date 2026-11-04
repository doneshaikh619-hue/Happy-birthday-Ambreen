/**
 * Ultra-Smooth 3D Spatial Coverflow & Card Showcase for Ambreen
 * Re-engineered to replace the spinning cylinder with a high-end 3D Coverflow:
 * - Center card is focused, prominent, with glossy reflections & drop-shadow
 * - Side cards cascade naturally with 3D perspective, angle tilt, scale, and smooth depth
 * - Zero z-fighting or spinning glitches; one photo flows behind the other seamlessly
 * - Touch swipe, drag, keyboard arrows, and direct click to bring any card forward
 */

class BirthdayGallery {
    constructor() {
        this.photos = [];
        this.currentMode = 'coverflow'; // 'coverflow' | 'deck' | 'grid'
        this.currentIndex = 0;
        this.deckIndex = 0;
        this.isDragging = false;
        this.startX = 0;
        this.autoPlayInterval = null;
        this.isHovered = false;

        // Custom captions for Ambreen's 28 photos
        this.captions = [
            "Mera Jigar Ka Tukda 💕 - A smile that can brighten up the entire universe, Ambreen.",
            "Grace & Elegance ✨ - Naturally stunning and pure in every single frame.",
            "Pure Joy Moments 🌸 - Wo hansi jo sab ke dil ko sukoon de de.",
            "Queen of Confidence 👑 - Owning every moment with effortless charm.",
            "Timeless Beauty 🤍 - Like poetry in motion, gentle and captivating.",
            "Sweet Memories 📸 - Online mile the, par dosti sabse qareebi ban gayi.",
            "Golden Hour Magic 🌅 - Even the sunset pales compared to your glow, Ambreen.",
            "Playful Spirit 🎈 - Keeping life lighthearted, fun, and magical.",
            "Shining Bright 🌟 - A heart as pure, kind, and sparkling as diamonds.",
            "Charming Smile 😊 - Teri pyari smile jo kisi ka bhi din bana de.",
            "Elegance in Simplicity 🌷 - True beauty that needs no filter.",
            "Dreamer & Achiever 🚀 - Reaching for the highest stars with confidence.",
            "Heart of Gold 💛 - Unconditionally kind, caring, and genuine best friend.",
            "Vibrant & Bold 🌺 - Adding color and happiness wherever you step.",
            "Serenity & Peace 🕊️ - Calm, collected, and full of graceful poise.",
            "Unforgettable Laughs 😂 - Wo bematlab ki baatein aur pagalon wali hasi.",
            "Glamourous Vibes 💎 - Stealing the spotlight effortlessly, Queen Ambreen.",
            "A True Masterpiece 🎨 - One of a kind, irreplaceable and unforgettable.",
            "Endless Positivity 🌈 - Your aura brings joy to every cloudy day.",
            "Cherished Chapters 📖 - Ek khoobsurat dosti ka safar jo hamesha chalega.",
            "Magnetic Aura 🧲 - Drawing smiles, kindness, and love wherever you go.",
            "Spontaneous Joy 💃 - Living life to the fullest with no regrets.",
            "Sparkling Eyes ✨ - Reflecting pure dreams, ambition, and happiness.",
            "Best Vibes Only 🎶 - The life of every conversation and comfort of home.",
            "Gentle Soul 💐 - Soft-spoken kindness that touches every heart.",
            "Bold & Beautiful 🔥 - Strong, fearless, and passionately living.",
            "Forever Iconic 🌟 - A true standard of genuine friendship and love.",
            "Happy Birthday Ambreen 🎂 - Mere jigar ka tukda, may all your dreams come true!"
        ];

        this.init();
    }

    init() {
        for (let i = 1; i <= 28; i++) {
            this.photos.push({
                id: i,
                url: `assets/images/maggie-${i}.jpg`,
                caption: this.captions[i - 1] || `Unforgettable Ambreen Moment #${i}`,
                likes: Math.floor(25 + Math.random() * 45)
            });
        }

        this.renderAllViews();
        this.setupEventListeners();
        this.setupCoverflowGestures();
        this.startAutoPlay();
    }

    renderAllViews() {
        this.buildCoverflowDOM();
        this.updateCoverflowPositions();
        this.renderDeckCards();
        this.renderGrid();
    }

    // =========================================================================
    // 1. MODE A: 3D SPATIAL COVERFLOW (Apple & 21st.dev Style)
    // =========================================================================
    buildCoverflowDOM() {
        const track = document.getElementById('coverflowTrack');
        if (!track) return;

        track.innerHTML = '';
        this.coverflowCards = [];

        this.photos.forEach((photo, idx) => {
            const card = document.createElement('div');
            card.className = 'coverflow-card';
            card.dataset.index = idx;

            card.innerHTML = `
                <div class="coverflow-card-inner">
                    <img src="${photo.url}" alt="Ambreen ${photo.id}" loading="lazy">
                    <div class="coverflow-card-glass"></div>
                    <div class="coverflow-card-tag">#${photo.id}</div>
                </div>
            `;

            // Click interaction
            card.addEventListener('click', () => {
                if (this.currentIndex === idx) {
                    this.openLightbox(idx);
                } else {
                    this.goToCoverflow(idx);
                }
            });

            track.appendChild(card);
            this.coverflowCards.push(card);
        });

        // Track hover to pause autoplay
        const viewport = document.getElementById('coverflowViewport');
        if (viewport) {
            viewport.addEventListener('mouseenter', () => { this.isHovered = true; });
            viewport.addEventListener('mouseleave', () => { this.isHovered = false; });
        }
    }

    updateCoverflowPositions() {
        if (!this.coverflowCards || this.coverflowCards.length === 0) return;

        const total = this.photos.length;
        const current = this.currentIndex;
        const isMobile = window.innerWidth <= 768;

        const spacing = isMobile ? 130 : 210;
        const centerZ = isMobile ? 60 : 120;
        const depthZ = isMobile ? -100 : -140;
        const maxVisible = isMobile ? 3 : 5;

        this.coverflowCards.forEach((card, idx) => {
            let offset = idx - current;

            // Circular wrap around for smooth infinite carousel
            const half = Math.floor(total / 2);
            if (offset > half) offset -= total;
            if (offset < -half) offset += total;

            const absOffset = Math.abs(offset);

            if (absOffset > maxVisible) {
                card.style.opacity = '0';
                card.style.pointerEvents = 'none';
                card.style.transform = `translateX(${offset * spacing}px) translateZ(-600px) scale(0.5)`;
                card.style.zIndex = '0';
                return;
            }

            let tx, tz, rotY, scale, opacity;

            if (offset === 0) {
                // Focused Active Card
                tx = 0;
                tz = centerZ;
                rotY = 0;
                scale = 1.05;
                opacity = 1;
                card.classList.add('active');
            } else if (offset > 0) {
                // Cards to the Right
                tx = offset * spacing + (isMobile ? 30 : 60);
                tz = depthZ - (absOffset - 1) * 80;
                rotY = -35;
                scale = Math.max(0.68, 1 - absOffset * 0.1);
                opacity = Math.max(0.2, 1 - absOffset * 0.2);
                card.classList.remove('active');
            } else {
                // Cards to the Left
                tx = offset * spacing - (isMobile ? 30 : 60);
                tz = depthZ - (absOffset - 1) * 80;
                rotY = 35;
                scale = Math.max(0.68, 1 - absOffset * 0.1);
                opacity = Math.max(0.2, 1 - absOffset * 0.2);
                card.classList.remove('active');
            }

            card.style.pointerEvents = 'auto';
            card.style.zIndex = 50 - absOffset;
            card.style.opacity = opacity;
            card.style.transform = `translateX(${tx}px) translateZ(${tz}px) rotateY(${rotY}deg) scale(${scale})`;
        });

        // Update active caption and counter
        const activePhoto = this.photos[current];
        const captionEl = document.getElementById('coverflowActiveCaption');
        const counterEl = document.getElementById('coverflowCounter');

        if (captionEl && activePhoto) {
            captionEl.innerHTML = `
                <span class="coverflow-title">${activePhoto.caption.split('-')[0]}</span>
                <span class="coverflow-sub">${activePhoto.caption.split('-')[1] || ''}</span>
            `;
        }

        if (counterEl) {
            counterEl.textContent = `${current + 1} / ${total}`;
        }
    }

    goToCoverflow(index) {
        const total = this.photos.length;
        this.currentIndex = (index + total) % total;
        this.updateCoverflowPositions();
    }

    nextCoverflow() {
        this.goToCoverflow(this.currentIndex + 1);
    }

    prevCoverflow() {
        this.goToCoverflow(this.currentIndex - 1);
    }

    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            if (!this.isHovered && this.currentMode === 'coverflow') {
                this.nextCoverflow();
            }
        }, 3800);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    setupCoverflowGestures() {
        const viewport = document.getElementById('coverflowViewport');
        if (!viewport) return;

        let startX = 0;
        let deltaX = 0;
        let isDown = false;

        const handleStart = (clientX) => {
            isDown = true;
            startX = clientX;
            deltaX = 0;
        };

        const handleMove = (clientX) => {
            if (!isDown) return;
            deltaX = clientX - startX;
        };

        const handleEnd = () => {
            if (!isDown) return;
            isDown = false;
            if (deltaX < -45) {
                this.nextCoverflow();
            } else if (deltaX > 45) {
                this.prevCoverflow();
            }
        };

        viewport.addEventListener('mousedown', (e) => handleStart(e.clientX));
        window.addEventListener('mousemove', (e) => handleMove(e.clientX));
        window.addEventListener('mouseup', handleEnd);

        viewport.addEventListener('touchstart', (e) => handleStart(e.touches[0].clientX), { passive: true });
        window.addEventListener('touchmove', (e) => handleMove(e.touches[0].clientX), { passive: true });
        window.addEventListener('touchend', handleEnd);
    }

    // =========================================================================
    // 2. MODE B: 21st.dev STACKED CARD DECK (Swipe Physics)
    // =========================================================================
    renderDeckCards() {
        const deckContainer = document.getElementById('deckCardsContainer');
        if (!deckContainer) return;

        deckContainer.innerHTML = '';
        const visibleCount = 5;

        for (let i = 0; i < visibleCount; i++) {
            const photoIdx = (this.deckIndex + i) % this.photos.length;
            const photo = this.photos[photoIdx];

            const card = document.createElement('div');
            card.className = 'deck-card';
            card.dataset.index = i;

            const scale = 1 - i * 0.05;
            const translateY = i * 16;
            const translateZ = -i * 50;
            const opacity = 1 - i * 0.18;
            const rotate = (i % 2 === 0 ? 1 : -1) * i * 2.5;

            card.style.transform = `translate3d(0, ${translateY}px, ${translateZ}px) scale(${scale}) rotate(${rotate}deg)`;
            card.style.opacity = opacity;
            card.style.zIndex = visibleCount - i;

            card.innerHTML = `
                <div class="deck-card-media">
                    <img src="${photo.url}" alt="Ambreen Photo" loading="lazy">
                    <div class="deck-card-tag">Memory #${photo.id} of 28</div>
                </div>
                <div class="deck-card-caption">
                    <h4>${photo.caption.split('-')[0]}</h4>
                    <p>${photo.caption.split('-')[1] || ''}</p>
                    <div class="deck-card-footer">
                        <button class="deck-like-btn" onclick="window.birthdayGallery.toggleLike(${photo.id - 1}, event)">
                            ❤️ <span id="deckLikeCount-${photo.id}">${photo.likes}</span>
                        </button>
                        <button class="deck-expand-btn" onclick="window.birthdayGallery.openLightbox(${photoIdx})">
                            🔍 View Full
                        </button>
                    </div>
                </div>
            `;

            if (i === 0) {
                this.attachCardTilt(card);
            }

            deckContainer.appendChild(card);
        }

        const counter = document.getElementById('deckCounterText');
        if (counter) {
            counter.textContent = `${this.deckIndex + 1} / ${this.photos.length}`;
        }
    }

    attachCardTilt(card) {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const rotX = -(y / rect.height) * 16;
            const rotY = (x / rect.width) * 16;
            card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
        });
    }

    nextDeckCard() {
        const topCard = document.querySelector('.deck-card[data-index="0"]');
        if (topCard) {
            topCard.style.transition = 'transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease';
            topCard.style.transform = 'translate3d(400px, -60px, 100px) rotate(25deg)';
            topCard.style.opacity = '0';
        }

        setTimeout(() => {
            this.deckIndex = (this.deckIndex + 1) % this.photos.length;
            this.renderDeckCards();
        }, 300);
    }

    prevDeckCard() {
        this.deckIndex = (this.deckIndex - 1 + this.photos.length) % this.photos.length;
        this.renderDeckCards();
    }

    // =========================================================================
    // 3. MODE C: MASONRY / BENTO GRID
    // =========================================================================
    renderGrid() {
        const gridContainer = document.getElementById('photoGridContainer');
        if (!gridContainer) return;

        gridContainer.innerHTML = '';
        this.photos.forEach((photo, idx) => {
            const item = document.createElement('div');
            item.className = 'grid-photo-card';
            item.innerHTML = `
                <div class="grid-card-inner" onclick="window.birthdayGallery.openLightbox(${idx})">
                    <img src="${photo.url}" alt="Ambreen" loading="lazy">
                    <div class="grid-card-overlay">
                        <span class="grid-card-number">#${photo.id}</span>
                        <div class="grid-card-info">
                            <h5>${photo.caption.split('-')[0]}</h5>
                            <span class="grid-likes">❤️ ${photo.likes}</span>
                        </div>
                    </div>
                </div>
            `;
            gridContainer.appendChild(item);
        });
    }

    switchMode(mode) {
        this.currentMode = mode;
        const modes = ['coverflow', 'deck', 'grid'];
        modes.forEach(m => {
            const sec = document.getElementById(`view-${m}`);
            const btn = document.getElementById(`tabBtn-${m}`);
            if (sec) sec.classList.toggle('active', m === mode);
            if (btn) btn.classList.toggle('active', m === mode);
        });

        if (mode === 'coverflow') {
            this.updateCoverflowPositions();
            this.startAutoPlay();
        } else {
            this.stopAutoPlay();
        }
    }

    // =========================================================================
    // 4. INTERACTIVE LIGHTBOX
    // =========================================================================
    openLightbox(index) {
        this.activeLightboxIndex = index;
        const photo = this.photos[index];
        const modal = document.getElementById('photoLightboxModal');
        const img = document.getElementById('lightboxImg');
        const caption = document.getElementById('lightboxCaption');
        const count = document.getElementById('lightboxCounter');
        const likeBtn = document.getElementById('lightboxLikeBtn');

        if (!modal || !photo) return;

        img.src = photo.url;
        caption.innerHTML = `<strong>${photo.caption.split('-')[0]}</strong><br><span>${photo.caption.split('-')[1] || ''}</span>`;
        count.textContent = `${index + 1} / ${this.photos.length}`;
        likeBtn.innerHTML = `❤️ ${photo.likes} Loves`;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
        const modal = document.getElementById('photoLightboxModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    lightboxNext() {
        this.activeLightboxIndex = (this.activeLightboxIndex + 1) % this.photos.length;
        this.openLightbox(this.activeLightboxIndex);
    }

    lightboxPrev() {
        this.activeLightboxIndex = (this.activeLightboxIndex - 1 + this.photos.length) % this.photos.length;
        this.openLightbox(this.activeLightboxIndex);
    }

    toggleLike(index, event) {
        if (event) event.stopPropagation();
        const photo = this.photos[index];
        if (!photo) return;
        photo.likes++;

        const deckSpan = document.getElementById(`deckLikeCount-${photo.id}`);
        if (deckSpan) deckSpan.textContent = photo.likes;

        const likeBtn = document.getElementById('lightboxLikeBtn');
        if (likeBtn && this.activeLightboxIndex === index) {
            likeBtn.innerHTML = `❤️ ${photo.likes} Loves`;
        }

        if (event) {
            this.spawnFloatingHeart(event.clientX, event.clientY);
        }
    }

    spawnFloatingHeart(x, y) {
        const heart = document.createElement('div');
        heart.className = 'floating-click-heart';
        heart.innerHTML = '❤️';
        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;
        document.body.appendChild(heart);

        setTimeout(() => { heart.remove(); }, 1200);
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            const modal = document.getElementById('photoLightboxModal');
            if (modal && modal.classList.contains('active')) {
                if (e.key === 'ArrowRight') this.lightboxNext();
                if (e.key === 'ArrowLeft') this.lightboxPrev();
                if (e.key === 'Escape') this.closeLightbox();
            } else if (this.currentMode === 'coverflow') {
                if (e.key === 'ArrowRight') this.nextCoverflow();
                if (e.key === 'ArrowLeft') this.prevCoverflow();
            }
        });

        window.addEventListener('resize', () => {
            if (this.currentMode === 'coverflow') {
                this.updateCoverflowPositions();
            }
        });
    }
}

window.birthdayGallery = new BirthdayGallery();
