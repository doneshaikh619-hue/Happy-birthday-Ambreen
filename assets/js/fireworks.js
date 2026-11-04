/**
 * Interactive Particle Fireworks Engine
 * Features: Click-to-launch rockets, physical particle gravity, sparkle trails,
 * vibrant color palettes, sound effects integration, and grand celebration sequence.
 */

class InteractiveFireworks {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.rockets = [];
        this.particles = [];
        this.isActive = true;

        this.colors = [
            '#ff5964', '#f6c867', '#35a7ff', '#38b000',
            '#ff70a6', '#ff9770', '#ffd670', '#e9ecef', '#9d4edd'
        ];

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Launch firework on screen click if clicked outside interactive controls
        window.addEventListener('click', (e) => {
            // Ignore if clicking buttons, inputs, links or cards
            if (e.target.closest('button, input, textarea, a, .carousel-card-inner, .deck-card, .lightbox-content')) {
                return;
            }
            this.launchRocket(e.clientX, e.clientY);
        });

        this.animate();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    launchRocket(targetX, targetY) {
        const startX = targetX + (Math.random() - 0.5) * 60;
        const startY = this.height;
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];

        if (window.birthdayAudio) {
            window.birthdayAudio.playFireworkPop();
        }

        this.rockets.push({
            x: startX,
            y: startY,
            targetX: targetX,
            targetY: targetY,
            speed: 12 + Math.random() * 4,
            angle: Math.atan2(targetY - startY, targetX - startX),
            color: color,
            trail: []
        });
    }

    explode(x, y, color) {
        const particleCount = 65 + Math.floor(Math.random() * 45);
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6.5 + 1.5;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                decay: 0.014 + Math.random() * 0.018,
                color: color,
                size: Math.random() * 2.5 + 1.2,
                sparkle: Math.random() > 0.6
            });
        }
    }

    grandCelebration() {
        let count = 0;
        const maxBursts = 10;
        const interval = setInterval(() => {
            const tx = this.width * 0.2 + Math.random() * (this.width * 0.6);
            const ty = this.height * 0.15 + Math.random() * (this.height * 0.35);
            this.launchRocket(tx, ty);
            count++;
            if (count >= maxBursts) clearInterval(interval);
        }, 320);
    }

    animate() {
        // Soft trail clear for motion blur effect
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.globalCompositeOperation = 'lighter';

        // Update & draw rockets
        for (let i = this.rockets.length - 1; i >= 0; i--) {
            const r = this.rockets[i];
            r.x += Math.cos(r.angle) * r.speed;
            r.y += Math.sin(r.angle) * r.speed;

            // Draw rocket trail
            this.ctx.beginPath();
            this.ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
            this.ctx.fillStyle = '#fff4cc';
            this.ctx.fill();

            // Check if reached apex
            const dist = Math.hypot(r.targetX - r.x, r.targetY - r.y);
            if (dist < 20 || r.y <= r.targetY) {
                this.explode(r.x, r.y, r.color);
                this.rockets.splice(i, 1);
            }
        }

        // Update & draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.09; // Gravity
            p.vx *= 0.98; // Air resistance
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fill();

            // Sparkle flicker
            if (p.sparkle && Math.random() > 0.4) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
                this.ctx.fill();
            }
            this.ctx.globalAlpha = 1.0;
        }

        requestAnimationFrame(() => this.animate());
    }
}
