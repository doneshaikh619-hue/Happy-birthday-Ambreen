/**
 * Main Application Orchestrator for Maggie's Birthday Experience
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Fireworks Canvas
    window.birthdayFireworks = new InteractiveFireworks('fireworksCanvas');

    // 2. Initialize 3D Three.js Cake
    window.cake3D = new BirthdayCake3D('cake3dContainer');

    // 3. Setup Intro Unwrapping Ceremony
    setupIntroUnwrap();

    // 4. Setup Wish Wall / Guestbook
    setupWishWall();

    // 5. Setup Golden Wax-Seal Envelope
    setupWaxSealLetter();

    // 6. Setup Interactive Cake Controls
    setupCakeControls();

    // 7. Setup Sparkle Cursor Trail
    setupSparkleCursor();

    // 8. Setup Floating Love Hearts
    setupFloatingLove();
});

// 1. Intro Unwrap Ceremony (Bulletproof Multi-Trigger)
function setupIntroUnwrap() {
    const unwrapBtn = document.getElementById('unwrapBtn');
    const giftBoxTrigger = document.getElementById('giftBoxTrigger');
    const introTag = document.querySelector('.intro-tag');
    const introCard = document.querySelector('.intro-card');
    const introOverlay = document.getElementById('introOverlay');
    const mainContent = document.getElementById('mainContent');

    if (!introOverlay || !mainContent) return;

    let isUnwrapped = false;

    function triggerUnwrap(e) {
        if (isUnwrapped) return;
        isUnwrapped = true;

        if (e) e.stopPropagation();

        // 1. Lid popping visual animation on the giftbox
        if (giftBoxTrigger) {
            giftBoxTrigger.classList.add('opening');
        }

        // 2. Play audio & sound effect safely
        try {
            if (window.birthdayAudio) {
                window.birthdayAudio.startMusic();
                window.birthdayAudio.playWishChime();
            }
        } catch (err) {
            console.warn('Audio start note:', err);
        }

        // 3. Multi-color confetti explosion
        try {
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 180,
                    spread: 120,
                    origin: { y: 0.5 },
                    colors: ['#f6c867', '#ff6584', '#a855f7', '#38bdf8', '#ffffff']
                });
                setTimeout(() => {
                    confetti({
                        particleCount: 90,
                        angle: 60,
                        spread: 60,
                        origin: { x: 0, y: 0.7 }
                    });
                    confetti({
                        particleCount: 90,
                        angle: 120,
                        spread: 60,
                        origin: { x: 1, y: 0.7 }
                    });
                }, 300);
            }
        } catch (err) {}

        // 4. Immediately ensure main content can be interacted with and overlay won't block clicks
        introOverlay.style.pointerEvents = 'none';
        mainContent.classList.add('visible');
        mainContent.style.opacity = '1';

        // 5. Guaranteed Safety Fallback Timer (Overlay is ALWAYS removed)
        const safetyTimer = setTimeout(() => {
            if (introOverlay) {
                introOverlay.style.display = 'none';
                introOverlay.remove();
            }
        }, 700);

        // 6. Smooth GSAP cinematic fade-out
        if (typeof gsap !== 'undefined') {
            gsap.to(introOverlay, {
                opacity: 0,
                scale: 1.08,
                duration: 0.6,
                ease: "power2.inOut",
                onComplete: () => {
                    clearTimeout(safetyTimer);
                    if (introOverlay && introOverlay.parentNode) {
                        introOverlay.style.display = 'none';
                        introOverlay.remove();
                    }

                    // Trigger smooth entrance animation for hero elements
                    gsap.from('.hero-badge, .hero-title, .hero-subtitle, .hero-actions', {
                        y: 35,
                        opacity: 0,
                        stagger: 0.12,
                        duration: 0.8,
                        ease: "back.out(1.5)"
                    });
                }
            });
        } else {
            introOverlay.style.opacity = '0';
            setTimeout(() => {
                clearTimeout(safetyTimer);
                if (introOverlay && introOverlay.parentNode) {
                    introOverlay.style.display = 'none';
                    introOverlay.remove();
                }
            }, 500);
        }
    }

    // Attach click and touch listeners to ALL interactive elements on the intro card
    if (unwrapBtn) {
        unwrapBtn.addEventListener('click', triggerUnwrap);
        unwrapBtn.addEventListener('touchend', triggerUnwrap);
    }
    if (giftBoxTrigger) {
        giftBoxTrigger.addEventListener('click', triggerUnwrap);
        giftBoxTrigger.addEventListener('touchend', triggerUnwrap);
    }
    if (introTag) {
        introTag.addEventListener('click', triggerUnwrap);
        introTag.addEventListener('touchend', triggerUnwrap);
    }
    if (introCard) {
        introCard.addEventListener('click', (e) => {
            // Trigger unwrap if clicking card background or texts
            triggerUnwrap(e);
        });
    }

    // Global hook for programmatic reveal if ever needed
    window.triggerBirthdayUnwrap = triggerUnwrap;
}

// 2. Cake Interactive Controls
function setupCakeControls() {
    const blowBtn = document.getElementById('blowCandlesBtn');
    const relightBtn = document.getElementById('relightCandlesBtn');
    const cutBtn = document.getElementById('cutCakeBtn');

    if (blowBtn) {
        blowBtn.addEventListener('click', () => {
            if (window.cake3D) {
                window.cake3D.blowOutCandles(() => {
                    blowBtn.style.display = 'none';
                    if (relightBtn) relightBtn.style.display = 'inline-flex';
                });
            }
        });
    }

    if (relightBtn) {
        relightBtn.addEventListener('click', () => {
            if (window.cake3D) {
                window.cake3D.relightCandles();
                relightBtn.style.display = 'none';
                if (blowBtn) blowBtn.style.display = 'inline-flex';
            }
        });
    }

    if (cutBtn) {
        cutBtn.addEventListener('click', () => {
            if (window.cake3D) {
                window.cake3D.cutCake();
            }
        });
    }

    // Grand Celebration Button
    const grandBtn = document.getElementById('grandCelebrationBtn');
    if (grandBtn) {
        grandBtn.addEventListener('click', () => {
            if (window.birthdayFireworks) {
                window.birthdayFireworks.grandCelebration();
            }
            if (typeof confetti === 'function') {
                const end = Date.now() + 2500;
                const colors = ['#f6c867', '#ff6584', '#00f5d4'];
                (function frame() {
                    confetti({
                        particleCount: 5,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 },
                        colors: colors
                    });
                    confetti({
                        particleCount: 5,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 },
                        colors: colors
                    });
                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                }());
            }
        });
    }
}

// 3. Wax Seal Envelope & Heartfelt Letter
function setupWaxSealLetter() {
    const waxSeal = document.getElementById('waxSealBtn');
    const envelope = document.getElementById('birthdayEnvelope');
    const letter = document.getElementById('birthdayLetter');

    if (!waxSeal || !envelope || !letter) return;

    waxSeal.addEventListener('click', () => {
        if (envelope.classList.contains('opened')) return;
        envelope.classList.add('opened');

        if (window.birthdayAudio) {
            window.birthdayAudio.playWishChime();
        }

        if (typeof confetti === 'function') {
            confetti({
                particleCount: 70,
                spread: 70,
                origin: { y: 0.7 },
                colors: ['#f6c867', '#e0a96d', '#ffffff']
            });
        }
    });
}

// 4. Wish Wall / Guestbook with LocalStorage
function setupWishWall() {
    const defaultWishes = [
        { 
            name: "Mustapha", 
            msg: "Happy Birthday Ambreen! Online mile the hum, lekin tum meri zindagi ki sabse pyari dost aur mere jigar ka tukda ban gayi. Hamesha aise hi hasti muskurati raho, meri dua hai ke tumhari har khwahish poori ho! 💕🎂", 
            date: "Today" 
        }
    ];

    let stored = [];
    try {
        stored = JSON.parse(localStorage.getItem('ambreen_wishes_mustapha')) || [];
    } catch(e) { stored = []; }

    const allWishes = [...defaultWishes, ...stored];
    const grid = document.getElementById('wishesGrid');

    function renderWishes() {
        if (!grid) return;
        grid.innerHTML = '';
        allWishes.forEach((w) => {
            const card = document.createElement('div');
            card.className = 'wish-note-card';
            card.innerHTML = `
                <div class="wish-pin">📌</div>
                <p class="wish-note-body">"${w.msg}"</p>
                <div class="wish-note-footer">
                    <span class="wish-note-author">— ${w.name}</span>
                    <span class="wish-note-time">${w.date || 'Today'}</span>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    renderWishes();

    const form = document.getElementById('addWishForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('wishAuthorInput');
            const msgInput = document.getElementById('wishTextInput');

            if (!nameInput.value.trim() || !msgInput.value.trim()) return;

            const newWish = {
                name: nameInput.value.trim(),
                msg: msgInput.value.trim(),
                date: "Just now"
            };

            allWishes.unshift(newWish);
            stored.unshift(newWish);
            try {
                localStorage.setItem('ambreen_wishes_mustapha', JSON.stringify(stored));
            } catch(e) {}

            renderWishes();

            if (window.birthdayAudio) {
                window.birthdayAudio.playWishChime();
            }

            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.8 }
                });
            }

            nameInput.value = '';
            msgInput.value = '';

            const successMsg = document.getElementById('wishSuccessMsg');
            if (successMsg) {
                successMsg.style.display = 'block';
                setTimeout(() => { successMsg.style.display = 'none'; }, 4000);
            }
        });
    }
}

// 6. Floating Sparkle Cursor Trail
function setupSparkleCursor() {
    // Only on pointer-capable devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let lastX = 0, lastY = 0;
    window.addEventListener('mousemove', (e) => {
        const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
        if (dist > 25) {
            lastX = e.clientX;
            lastY = e.clientY;
            createCursorSparkle(e.clientX, e.clientY);
        }
    });

    function createCursorSparkle(x, y) {
        const sp = document.createElement('div');
        sp.className = 'cursor-sparkle';
        sp.style.left = `${x}px`;
        sp.style.top = `${y}px`;
        document.body.appendChild(sp);

        setTimeout(() => { sp.remove(); }, 800);
    }
}

// 7. Floating Love Hearts (Shower of Love)
function setupFloatingLove() {
    const loveBtn = document.getElementById('floatingLoveBtn');
    const countSpan = document.getElementById('loveCounter');
    let loves = 365;

    if (loveBtn) {
        loveBtn.addEventListener('click', (e) => {
            loves++;
            if (countSpan) countSpan.textContent = loves;

            // Spawn 3 floating hearts
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    spawnHeart(e.clientX + (Math.random() - 0.5) * 40, e.clientY - 20);
                }, i * 100);
            }
        });
    }

    function spawnHeart(x, y) {
        const heart = document.createElement('div');
        heart.className = 'floating-love-heart';
        const emojis = ['❤️', '💖', '✨', '🎂', '🥳', '🌸', '💫'];
        heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;
        document.body.appendChild(heart);

        setTimeout(() => { heart.remove(); }, 1600);
    }
}

// Music toggle helper
window.toggleBirthdayMusic = function() {
    if (window.birthdayAudio) {
        window.birthdayAudio.toggleMusic();
    }
};
