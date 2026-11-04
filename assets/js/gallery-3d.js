/**
 * 21st.dev Inspired 3D Spatial Photo Gallery & Card Deck for Maggie
 * Handles: 
 * 1. 3D Cylindrical Orbit Carousel (CSS 3D / transform-style: preserve-3d)
 * 2. 21st.dev Stacked Card Deck (Spring swipe & tilt)
 * 3. Curated Masonry / Bento Grid
 * 4. High-Res Interactive Lightbox with like heart reactions and captions
 */

class BirthdayGallery {
    constructor() {
        this.photos = [];
        this.currentMode = 'carousel3d'; // 'carousel3d' | 'deck' | 'grid'
        this.carouselAngle = 0;
        this.isDragging = false;
        this.startX = 0;
        this.currentX = 0;
        this.autoRotateTimer = null;
        this.isAutoRotating = true;

        // Stack Deck state
        this.deckIndex = 0;

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

    async init() {
        // Generate list of 28 photos
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
        this.setupCarouselDrag();
        this.startAutoRotate();
    }

    renderAllViews() {
        this.render3DCarousel();
        this.renderDeckCards();
        this.renderGrid();
    }

    // 1. Mode A: 3D Cylindrical Carousel (21st.dev cult-ui style)
    render3DCarousel() {
        const cylinder = document.getElementById('carousel3dCylinder');
        if (!cylinder) return;

        cylinder.innerHTML = '';
        const total = this.photos.length;
        // Radius based on width
        const radius = Math.max(480, (total * 70) / (2 * Math.PI));

        this.photos.forEach((photo, idx) => {
            const angle = (360 / total) * idx;
            const card = document.createElement('div');
            card.className = 'carousel-3d-item';
            card.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
            
            card.innerHTML = `
                <div class="carousel-card-inner">
                    <img src="${photo.url}" alt="Ambreen ${photo.id}" loading="lazy">
                    <div class="carousel-card-overlay">
                        <span class="photo-badge">#${photo.id}</span>
                        <p class="photo-snippet">${photo.caption.split('-')[0]}</p>
                    </div>
                </div>
            `;

            card.addEventListener('click', (e) => {
                if (this.dragDistance > 10) return; // ignore clicks during drag
                this.openLightbox(photo.id - 1);
            });

            cylinder.appendChild(card);
        });
    }

    // 2. Mode B: 21st.dev Stacked Card Deck (Swipe / Next)
    renderDeckCards() {
        const deckContainer = document.getElementById('deckCardsContainer');
        if (!deckContainer) return;

        deckContainer.innerHTML = '';
        // Render top 5 cards from deckIndex
        const visibleCount = 5;

        for (let i = 0; i < visibleCount; i++) {
            const photoIdx = (this.deckIndex + i) % this.photos.length;
            const photo = this.photos[photoIdx];

            const card = document.createElement('div');
            card.className = 'deck-card';
            card.dataset.index = i;

            // Stack styling: scale down, translate y, reduce opacity for depth
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

            // Parallax mouse tilt on top card
            if (i === 0) {
                this.attachCardTilt(card);
            }

            deckContainer.appendChild(card);
        }

        // Update deck counter
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

    // 3. Mode C: Masonry / Pinterest Bento Grid
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
        const modes = ['carousel3d', 'deck', 'grid'];
        modes.forEach(m => {
            const sec = document.getElementById(`view-${m}`);
            const btn = document.getElementById(`tabBtn-${m}`);
            if (sec) sec.classList.toggle('active', m === mode);
            if (btn) btn.classList.toggle('active', m === mode);
        });

        if (mode === 'carousel3d') {
            this.startAutoRotate();
        } else {
            this.stopAutoRotate();
        }
    }

    // 3D Carousel Drag & Controls
    setupCarouselDrag() {
        const viewport = document.getElementById('carousel3dViewport');
        if (!viewport) return;

        let startX = 0;
        let isDown = false;
        this.dragDistance = 0;

        const onDown = (e) => {
            isDown = true;
            this.stopAutoRotate();
            startX = (e.pageX || (e.touches && e.touches[0].pageX));
            this.dragDistance = 0;
        };

        const onMove = (e) => {
            if (!isDown) return;
            const currentX = (e.pageX || (e.touches && e.touches[0].pageX));
            const deltaX = currentX - startX;
            this.dragDistance += Math.abs(deltaX);
            this.carouselAngle += deltaX * 0.28;
            this.updateCarouselTransform();
            startX = currentX;
        };

        const onUp = () => {
            if (!isDown) return;
            isDown = false;
            this.startAutoRotate();
        };

        viewport.addEventListener('mousedown', onDown);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);

        viewport.addEventListener('touchstart', onDown, { passive: true });
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', onUp);
    }

    updateCarouselTransform() {
        const cylinder = document.getElementById('carousel3dCylinder');
        if (cylinder) {
            cylinder.style.transform = `rotateY(${this.carouselAngle}deg)`;
        }
    }

    rotateCarousel(delta) {
        this.carouselAngle += delta;
        this.updateCarouselTransform();
    }

    startAutoRotate() {
        this.stopAutoRotate();
        this.autoRotateTimer = setInterval(() => {
            this.carouselAngle -= 0.15; // Slow gentle spin
            this.updateCarouselTransform();
        }, 30);
    }

    stopAutoRotate() {
        if (this.autoRotateTimer) {
            clearInterval(this.autoRotateTimer);
            this.autoRotateTimer = null;
        }
    }

    // Interactive Lightbox Modal
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

        // Update deck count if visible
        const deckSpan = document.getElementById(`deckLikeCount-${photo.id}`);
        if (deckSpan) deckSpan.textContent = photo.likes;

        // Update lightbox button if open
        const likeBtn = document.getElementById('lightboxLikeBtn');
        if (likeBtn && this.activeLightboxIndex === index) {
            likeBtn.innerHTML = `❤️ ${photo.likes} Loves`;
        }

        // Float love heart effect
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

        setTimeout(() => {
            heart.remove();
        }, 1200);
    }

    setupEventListeners() {
        // Keyboard arrow navigation
        window.addEventListener('keydown', (e) => {
            const modal = document.getElementById('photoLightboxModal');
            if (modal && modal.classList.contains('active')) {
                if (e.key === 'ArrowRight') this.lightboxNext();
                if (e.key === 'ArrowLeft') this.lightboxPrev();
                if (e.key === 'Escape') this.closeLightbox();
            }
        });
    }
}

window.birthdayGallery = new BirthdayGallery();
