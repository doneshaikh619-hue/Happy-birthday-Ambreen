/**
 * Main Application Orchestrator for Maggie's Birthday Experience
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Fireworks Canvas
    window.birthdayFireworks = new InteractiveFireworks('fireworksCanvas');

    // 2. Initialize 3D Three.js Cake
    window.cake3D = new BirthdayCake3D('cake3dContainer');

    // 3. Initialize Sky Lanterns
    window.skyLanterns = new SkyLanternsManager('lanternSkyCanvas');

    // 4. Setup Intro Unwrapping Ceremony
    setupIntroUnwrap();

    // 5. Setup Wish Wall / Guestbook
    setupWishWall();

    // 6. Setup Golden Wax-Seal Envelope
    setupWaxSealLetter();

    // 7. Setup Interactive Cake Controls
    setupCakeControls();

    // 8. Setup Sparkle Cursor Trail
    setupSparkleCursor();

    // 9. Setup Floating Love Hearts
    setupFloatingLove();

    // 10. Setup Lantern Modal
    setupLanternModal();
});

// 1. Intro Unwrap Ceremony
function setupIntroUnwrap() {
    const unwrapBtn = document.getElementById('unwrapBtn');
    const introOverlay = document.getElementById('introOverlay');
    const mainContent = document.getElementById('mainContent');

    if (!unwrapBtn || !introOverlay) return;

    unwrapBtn.addEventListener('click', () => {
        // Play audio & sound effect
        if (window.birthdayAudio) {
            window.birthdayAudio.startMusic();
            window.birthdayAudio.playWishChime();
        }

        // Confetti blast
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 160,
                spread: 100,
                origin: { y: 0.5 },
                colors: ['#f6c867', '#ff6584', '#a855f7', '#38bdf8']
            });
        }

        // GSAP cinematic vanish
        gsap.to(introOverlay, {
            opacity: 0,
            scale: 1.08,
            duration: 1.0,
            ease: "power2.inOut",
            onComplete: () => {
                introOverlay.style.display = 'none';
                mainContent.classList.add('visible');

                // Trigger entrance animation for hero elements
                gsap.from('.hero-badge, .hero-title, .hero-subtitle, .hero-actions', {
                    y: 40,
                    opacity: 0,
                    stagger: 0.15,
                    duration: 1.0,
                    ease: "back.out(1.5)"
                });
            }
        });
    });
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
        { name: "Tera Best Friend", msg: "Happy Birthday Ambreen! Online mile the hum, par tum sach mein mere jigar ka tukda ban gayi. Hamesha hasti muskurati raho! 💕", date: "Today" },
        { name: "Aarav", msg: "Happy Birthday Ambreen! Keep blessing everyone with your boundless energy and kindness! 🌟", date: "Today" },
        { name: "Priya", msg: "To the girl whose laugh cures bad moods! Have the most magical year ahead Ambreen! 💕", date: "Today" },
        { name: "Dev & Riya", msg: "Wishing you peace, laughter, and every dream fulfilled! Happy Birthday Queen! 👑", date: "Today" },
        { name: "Kavya", msg: "Always stay your authentic, vibrant, and lovable self Ambreen! Cheers! 🥂", date: "Today" }
    ];

    let stored = [];
    try {
        stored = JSON.parse(localStorage.getItem('ambreen_birthday_wishes')) || [];
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
                localStorage.setItem('ambreen_birthday_wishes', JSON.stringify(stored));
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

// 5. Sky Lantern Modal & Submission
function setupLanternModal() {
    const openBtn = document.getElementById('openLanternModalBtn');
    const modal = document.getElementById('lanternModal');
    const closeBtn = document.getElementById('closeLanternModalBtn');
    const submitBtn = document.getElementById('sendLanternBtn');
    const senderInput = document.getElementById('lanternSenderInput');
    const textInput = document.getElementById('lanternWishInput');

    if (!modal) return;

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            modal.classList.add('active');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    // Preset wish pill click
    document.querySelectorAll('.preset-wish-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            if (textInput) textInput.value = pill.textContent.trim();
        });
    });

    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const sender = senderInput ? senderInput.value.trim() : "";
            const text = textInput ? textInput.value.trim() : "";
            if (!text) return;

            if (window.skyLanterns) {
                window.skyLanterns.releaseWish(sender || "A Close Friend", text);
            }

            modal.classList.remove('active');
            if (textInput) textInput.value = '';
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
