/**
 * Rapunzel-Style Glowing Sky Lanterns Ceremony
 * Features: Procedural sky lanterns floating into the night sky,
 * interactive user wish submission, and click-to-read lantern wishes.
 */

class SkyLanternsManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.lanterns = [];
        this.stars = [];
        this.width = 0;
        this.height = 0;
        this.animationFrame = null;

        // Preloaded wishes from friends & loved ones
        this.presetWishes = [
            { sender: "Tera Best Friend", text: "Online mile the hum, par tum mere jigar ka tukda ban gayi. Hamesha hasti raho! 💕" },
            { sender: "Aarav", text: "May your year ahead be as bright and radiant as your smile, Ambreen! ✨" },
            { sender: "Sneha", text: "To the sweetest soul, wishing you endless joy and laughter! 💖" },
            { sender: "Rohit", text: "Happy Birthday Ambreen! May all your secret dreams come true this year! 🌟" },
            { sender: "Pooja", text: "Stay wild, stay sweet, and keep spreading your infectious laughs! 🎂" },
            { sender: "Aryan", text: "Cheers to our bond, endless chats, and all future memories! 🥂" },
            { sender: "Deepak", text: "Wishing you peace, happiness, and unparalleled success! 🚀" }
        ];

        this.init();
    }

    init() {
        this.resize();
        this.createStars();
        this.populateInitialLanterns();

        window.addEventListener('resize', () => this.resize());
        this.setupCanvasClick();
        this.animate();
    }

    resize() {
        this.width = this.canvas.parentElement.clientWidth || window.innerWidth;
        this.height = this.canvas.parentElement.clientHeight || 550;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    createStars() {
        this.stars = [];
        const count = 150;
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.8 + 0.2,
                twinkleSpeed: 0.02 + Math.random() * 0.04
            });
        }
    }

    populateInitialLanterns() {
        this.presetWishes.forEach((wish, idx) => {
            const l = this.createLantern(
                Math.random() * this.width,
                Math.random() * (this.height - 100) + 50,
                wish.sender,
                wish.text,
                0.5 + Math.random() * 0.5
            );
            this.lanterns.push(l);
        });

        // Add 12 ambient background tiny lanterns for depth
        for (let i = 0; i < 15; i++) {
            const ambient = this.createLantern(
                Math.random() * this.width,
                Math.random() * this.height,
                "Wish for Ambreen",
                "Joy, health and love always ✨",
                0.25 + Math.random() * 0.25
            );
            this.lanterns.push(ambient);
        }
    }

    createLantern(x, y, sender, text, scale = 1.0) {
        return {
            x: x,
            y: y,
            sender: sender,
            text: text,
            scale: scale,
            baseScale: scale,
            speedY: (0.35 + Math.random() * 0.45) * scale,
            swayAngle: Math.random() * Math.PI * 2,
            swaySpeed: 0.015 + Math.random() * 0.02,
            swayAmplitude: 1.2 + Math.random() * 1.5,
            width: 38 * scale,
            height: 52 * scale,
            glowIntensity: 0.8 + Math.random() * 0.4
        };
    }

    // Add a new user wish lantern
    releaseWish(sender, text) {
        if (window.birthdayAudio) {
            window.birthdayAudio.playWishChime();
        }

        const newLantern = this.createLantern(
            this.width / 2 + (Math.random() - 0.5) * 120,
            this.height - 30,
            sender || "A Well-Wisher",
            text || "Happy Birthday Ambreen! 🌟",
            0.9
        );

        this.lanterns.push(newLantern);

        // Confetti burst on lantern release
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.8 },
                colors: ['#f6c867', '#ffaa00', '#ffffff']
            });
        }

        return newLantern;
    }

    setupCanvasClick() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            // Check if any lantern was clicked (from front/largest to smallest)
            const sorted = [...this.lanterns].sort((a, b) => b.scale - a.scale);
            for (let l of sorted) {
                const dist = Math.hypot(clickX - l.x, clickY - l.y);
                if (dist < Math.max(l.width, 30)) {
                    this.showLanternWishPopup(l, e.clientX, e.clientY);
                    break;
                }
            }
        });
    }

    showLanternWishPopup(lantern, clientX, clientY) {
        let popup = document.getElementById('lanternWishPopup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'lanternWishPopup';
            popup.className = 'lantern-wish-popup';
            document.body.appendChild(popup);
        }

        popup.innerHTML = `
            <div class="lantern-popup-content">
                <span class="lantern-popup-close" onclick="this.parentElement.parentElement.classList.remove('active')">&times;</span>
                <div class="lantern-popup-tag">🏮 Whispered Wish for Ambreen</div>
                <p class="lantern-popup-text">"${lantern.text}"</p>
                <div class="lantern-popup-author">— With love, <strong>${lantern.sender}</strong></div>
            </div>
        `;

        // Position popup near click
        const x = Math.min(window.innerWidth - 320, Math.max(20, clientX - 150));
        const y = Math.min(window.innerHeight - 180, Math.max(20, clientY - 140));
        popup.style.left = `${x}px`;
        popup.style.top = `${y}px`;
        popup.classList.add('active');

        // Auto close after 6 seconds
        clearTimeout(this.popupTimeout);
        this.popupTimeout = setTimeout(() => {
            popup.classList.remove('active');
        }, 6000);
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw deep midnight night sky gradient
        const bgGrad = this.ctx.createLinearGradient(0, 0, 0, this.height);
        bgGrad.addColorStop(0, '#04020a');
        bgGrad.addColorStop(0.5, '#0b0819');
        bgGrad.addColorStop(1, '#17112d');
        this.ctx.fillStyle = bgGrad;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw soft glowing Moon
        this.drawMoon();

        // Draw Twinkling Stars
        this.stars.forEach(s => {
            s.alpha += s.twinkleSpeed;
            if (s.alpha > 1 || s.alpha < 0.2) s.twinkleSpeed = -s.twinkleSpeed;
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(s.alpha)})`;
            this.ctx.fill();
        });

        // Draw and update lanterns
        this.lanterns.forEach((l) => {
            l.swayAngle += l.swaySpeed;
            l.x += Math.sin(l.swayAngle) * (l.swayAmplitude * l.scale);
            l.y -= l.speedY;

            // When lantern floats out of the top, recycle it to the bottom with gentle variation
            if (l.y < -80) {
                l.y = this.height + 40;
                l.x = Math.random() * this.width;
            }

            this.drawLantern(l);
        });

        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    drawMoon() {
        const mx = this.width - 120;
        const my = 90;
        const mRadius = 38;

        // Moon outer glow
        const glow = this.ctx.createRadialGradient(mx, my, mRadius * 0.8, mx, my, mRadius * 3.5);
        glow.addColorStop(0, 'rgba(255, 248, 220, 0.45)');
        glow.addColorStop(0.5, 'rgba(255, 240, 180, 0.1)');
        glow.addColorStop(1, 'rgba(255, 240, 180, 0)');
        this.ctx.fillStyle = glow;
        this.ctx.beginPath();
        this.ctx.arc(mx, my, mRadius * 3.5, 0, Math.PI * 2);
        this.ctx.fill();

        // Moon body
        const moonGrad = this.ctx.createRadialGradient(mx - 10, my - 10, 5, mx, my, mRadius);
        moonGrad.addColorStop(0, '#fffdf0');
        moonGrad.addColorStop(0.8, '#f5e6b3');
        moonGrad.addColorStop(1, '#dfca88');
        this.ctx.fillStyle = moonGrad;
        this.ctx.beginPath();
        this.ctx.arc(mx, my, mRadius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawLantern(l) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(l.x, l.y);

        // Radial golden aura around lantern
        const auraRadius = Math.max(l.width, l.height) * 1.8;
        const aura = ctx.createRadialGradient(0, 0, 5 * l.scale, 0, 0, auraRadius);
        aura.addColorStop(0, 'rgba(255, 175, 40, 0.55)');
        aura.addColorStop(0.4, 'rgba(255, 130, 20, 0.2)');
        aura.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(0, 0, auraRadius, 0, Math.PI * 2);
        ctx.fill();

        // Lantern Paper Body (barrel-shaped)
        const w = l.width;
        const h = l.height;
        ctx.beginPath();
        ctx.moveTo(-w / 2 * 0.7, -h / 2);
        ctx.quadraticCurveTo(-w * 0.6, 0, -w / 2 * 0.85, h / 2);
        ctx.lineTo(w / 2 * 0.85, h / 2);
        ctx.quadraticCurveTo(w * 0.6, 0, w / 2 * 0.7, -h / 2);
        ctx.closePath();

        // Warm paper gradient
        const paperGrad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
        paperGrad.addColorStop(0, '#ffcc44');
        paperGrad.addColorStop(0.5, '#ff8811');
        paperGrad.addColorStop(1, '#d84400');
        ctx.fillStyle = paperGrad;
        ctx.fill();

        // Inner flame flickering hotspot
        const flicker = Math.sin(Date.now() * 0.01 + l.x) * 0.2;
        const innerGlow = ctx.createRadialGradient(0, h * 0.2, 1, 0, h * 0.2, (w * 0.45) * (1 + flicker));
        innerGlow.addColorStop(0, '#ffffff');
        innerGlow.addColorStop(0.4, '#ffee66');
        innerGlow.addColorStop(1, 'rgba(255, 120, 0, 0)');
        ctx.fillStyle = innerGlow;
        ctx.beginPath();
        ctx.arc(0, h * 0.2, w * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Bamboo wire ribs
        ctx.strokeStyle = 'rgba(100, 30, 0, 0.35)';
        ctx.lineWidth = 1 * l.scale;
        ctx.stroke();

        ctx.restore();
    }
}
