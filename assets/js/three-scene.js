/**
 * 3D Interactive Birthday Cake & Stage using Three.js
 * Features: Procedural 3D cake, gold pedestal, realistic flickering flame shaders/lights,
 * smoke simulation on blowout, 360 orbit controls, and celebration trigger.
 */

class BirthdayCake3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.cakeGroup = new THREE.Group();
        this.flames = [];
        this.smokeParticles = [];
        this.candleLights = [];
        this.isBlownOut = false;
        this.isCutting = false;
        this.ambientLight = null;
        this.dirLight = null;
        this.clock = new THREE.Clock();

        this.init();
    }

    init() {
        const width = this.container.clientWidth || 500;
        const height = this.container.clientHeight || 450;

        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        this.camera.position.set(0, 5.5, 9);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Controls
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.maxPolarAngle = Math.PI / 2 + 0.1; // Don't go below floor
            this.controls.minDistance = 5;
            this.controls.maxDistance = 14;
            this.controls.autoRotate = true;
            this.controls.autoRotateSpeed = 1.0;
        }

        // Lighting
        this.setupLighting();

        // Build 3D Cake & Stand
        this.buildCake();

        // Floating Stardust Particles
        this.buildStardust();

        // Events
        window.addEventListener('resize', () => this.onWindowResize());

        // Animation Loop
        this.animate();
    }

    setupLighting() {
        this.ambientLight = new THREE.AmbientLight(0xfff0f5, 0.7);
        this.scene.add(this.ambientLight);

        this.dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
        this.dirLight.position.set(6, 10, 6);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.mapSize.width = 1024;
        this.dirLight.shadow.mapSize.height = 1024;
        this.scene.add(this.dirLight);

        // Soft pink rim light
        const rimLight = new THREE.DirectionalLight(0xff88a5, 0.5);
        rimLight.position.set(-6, 4, -5);
        this.scene.add(rimLight);
    }

    buildCake() {
        // Pedestal / Cake Stand
        const goldMaterial = new THREE.MeshStandardMaterial({
            color: 0xe5b869,
            metalness: 0.85,
            roughness: 0.25
        });

        // Stand base
        const standBaseGeo = new THREE.CylinderGeometry(2.8, 3.2, 0.35, 48);
        const standBase = new THREE.Mesh(standBaseGeo, goldMaterial);
        standBase.position.y = -1.4;
        standBase.receiveShadow = true;
        this.cakeGroup.add(standBase);

        // Stand stem
        const standStemGeo = new THREE.CylinderGeometry(0.7, 1.1, 0.9, 32);
        const standStem = new THREE.Mesh(standStemGeo, goldMaterial);
        standStem.position.y = -0.85;
        this.cakeGroup.add(standStem);

        // Stand top plate
        const standPlateGeo = new THREE.CylinderGeometry(3.6, 3.6, 0.2, 48);
        const standPlate = new THREE.Mesh(standPlateGeo, goldMaterial);
        standPlate.position.y = -0.35;
        standPlate.receiveShadow = true;
        this.cakeGroup.add(standPlate);

        // Stand decorative rim
        const standRimGeo = new THREE.TorusGeometry(3.6, 0.08, 16, 64);
        const standRim = new THREE.Mesh(standRimGeo, goldMaterial);
        standRim.rotation.x = Math.PI / 2;
        standRim.position.y = -0.26;
        this.cakeGroup.add(standRim);

        // Tier 1 (Bottom Cake - Rose Velvet)
        const tier1Mat = new THREE.MeshStandardMaterial({
            color: 0xfce4ec, // Creamy blush rose
            roughness: 0.45,
            metalness: 0.05
        });
        const tier1Geo = new THREE.CylinderGeometry(3.0, 3.0, 1.4, 64);
        const tier1 = new THREE.Mesh(tier1Geo, tier1Mat);
        tier1.position.y = 0.45;
        tier1.castShadow = true;
        tier1.receiveShadow = true;
        this.cakeGroup.add(tier1);

        // Tier 1 Frosting Ribbon & Pearls
        const ribbon1Mat = new THREE.MeshStandardMaterial({ color: 0xff6584, roughness: 0.3 });
        const ribbon1Geo = new THREE.TorusGeometry(3.02, 0.09, 16, 64);
        const ribbon1 = new THREE.Mesh(ribbon1Geo, ribbon1Mat);
        ribbon1.rotation.x = Math.PI / 2;
        ribbon1.position.y = -0.2;
        this.cakeGroup.add(ribbon1);

        // Pearls around bottom tier top
        const pearlMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.3 });
        const pearlCount = 28;
        for (let i = 0; i < pearlCount; i++) {
            const angle = (i / pearlCount) * Math.PI * 2;
            const px = Math.cos(angle) * 3.0;
            const pz = Math.sin(angle) * 3.0;
            const pearlGeo = new THREE.SphereGeometry(0.1, 16, 16);
            const pearl = new THREE.Mesh(pearlGeo, pearlMat);
            pearl.position.set(px, 1.15, pz);
            this.cakeGroup.add(pearl);
        }

        // Tier 2 (Top Cake - Vanilla Chantilly)
        const tier2Mat = new THREE.MeshStandardMaterial({
            color: 0xfff9f0, // Chantilly cream
            roughness: 0.4,
            metalness: 0.05
        });
        const tier2Geo = new THREE.CylinderGeometry(2.0, 2.0, 1.2, 64);
        const tier2 = new THREE.Mesh(tier2Geo, tier2Mat);
        tier2.position.y = 1.75;
        tier2.castShadow = true;
        tier2.receiveShadow = true;
        this.cakeGroup.add(tier2);

        // Gold Drip Accents on Tier 2
        const dripMat = new THREE.MeshStandardMaterial({ color: 0xf5b041, metalness: 0.6, roughness: 0.2 });
        const dripTorus = new THREE.TorusGeometry(2.02, 0.08, 16, 64);
        const dripMesh = new THREE.Mesh(dripTorus, dripMat);
        dripMesh.rotation.x = Math.PI / 2;
        dripMesh.position.y = 2.34;
        this.cakeGroup.add(dripMesh);

        // Cream rosettes on top tier
        const rosetteCount = 12;
        for (let i = 0; i < rosetteCount; i++) {
            const angle = (i / rosetteCount) * Math.PI * 2;
            const rx = Math.cos(angle) * 1.8;
            const rz = Math.sin(angle) * 1.8;
            const rosetteGeo = new THREE.SphereGeometry(0.18, 16, 16);
            const rosette = new THREE.Mesh(rosetteGeo, ribbon1Mat);
            rosette.scale.set(1, 0.7, 1);
            rosette.position.set(rx, 2.4, rz);
            this.cakeGroup.add(rosette);
        }

        // Fresh Strawberries on top
        const strawberryMat = new THREE.MeshStandardMaterial({ color: 0xdf2935, roughness: 0.3 });
        const sAngles = [0.4, 1.5, 2.7, 3.8, 5.0];
        sAngles.forEach(a => {
            const sx = Math.cos(a) * 1.2;
            const sz = Math.sin(a) * 1.2;
            const sGeo = new THREE.ConeGeometry(0.2, 0.4, 16);
            const berry = new THREE.Mesh(sGeo, strawberryMat);
            berry.position.set(sx, 2.5, sz);
            berry.rotation.x = Math.PI;
            this.cakeGroup.add(berry);
        });

        // Candles (3 Elegant Striped Candles)
        const candlePositions = [
            { x: 0, z: 0, h: 1.1 },       // Center main candle
            { x: -0.7, z: 0.4, h: 0.95 }, // Left
            { x: 0.7, z: -0.4, h: 0.95 }  // Right
        ];

        const candleMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.3,
            metalness: 0.1
        });

        candlePositions.forEach((pos, idx) => {
            // Candle wax body
            const candleGeo = new THREE.CylinderGeometry(0.1, 0.1, pos.h, 24);
            const candle = new THREE.Mesh(candleGeo, candleMat);
            candle.position.set(pos.x, 2.35 + pos.h / 2, pos.z);
            candle.castShadow = true;
            this.cakeGroup.add(candle);

            // Gold spiral stripe around candle
            const stripeMat = new THREE.MeshStandardMaterial({ color: 0xf6c867, metalness: 0.8, roughness: 0.2 });
            const stripeGeo = new THREE.TorusGeometry(0.105, 0.02, 8, 32);
            for (let s = 0; s < 4; s++) {
                const stripe = new THREE.Mesh(stripeGeo, stripeMat);
                stripe.rotation.x = Math.PI / 2 + 0.2;
                stripe.position.set(pos.x, 2.35 + 0.18 + s * 0.22, pos.z);
                this.cakeGroup.add(stripe);
            }

            // Wick
            const wickGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.18, 8);
            const wickMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
            const wick = new THREE.Mesh(wickGeo, wickMat);
            const wickY = 2.35 + pos.h + 0.08;
            wick.position.set(pos.x, wickY, pos.z);
            this.cakeGroup.add(wick);

            // Flame (Teardrop shape)
            const flameGeo = new THREE.ConeGeometry(0.1, 0.32, 16);
            flameGeo.translate(0, 0.16, 0); // Pivot at base
            const flameMat = new THREE.MeshBasicMaterial({
                color: 0xffaa00,
                transparent: true,
                opacity: 0.95
            });
            const flame = new THREE.Mesh(flameGeo, flameMat);
            const flameY = wickY + 0.08;
            flame.position.set(pos.x, flameY, pos.z);
            this.cakeGroup.add(flame);

            // Flame Inner Core (White/Yellow Hot)
            const coreGeo = new THREE.ConeGeometry(0.05, 0.18, 12);
            coreGeo.translate(0, 0.09, 0);
            const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const core = new THREE.Mesh(coreGeo, coreMat);
            flame.add(core);

            // Dynamic Point Light for flickering candle illumination
            const candleLight = new THREE.PointLight(0xff9900, 1.2, 5.0, 2);
            candleLight.position.set(pos.x, flameY + 0.1, pos.z);
            this.cakeGroup.add(candleLight);

            this.flames.push({
                mesh: flame,
                baseY: flameY,
                seed: idx * 2.0,
                candleIndex: idx,
                x: pos.x,
                z: pos.z
            });
            this.candleLights.push(candleLight);
        });

        this.scene.add(this.cakeGroup);
    }

    buildStardust() {
        const particleCount = 120;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const r = 4.0 + Math.random() * 5.0;
            const theta = Math.random() * Math.PI * 2;
            const phi = (Math.random() - 0.5) * Math.PI;

            positions[i * 3] = r * Math.cos(theta) * Math.cos(phi);
            positions[i * 3 + 1] = 0.5 + Math.random() * 5.0;
            positions[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi);

            // Golden / rose sparkle colors
            if (Math.random() > 0.5) {
                colors[i * 3] = 0.98; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 0.4;
            } else {
                colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.4; colors[i * 3 + 2] = 0.6;
            }
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.14,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.stardustPoints = new THREE.Points(geo, mat);
        this.scene.add(this.stardustPoints);
    }

    // Interactive Candle Blowout
    blowOutCandles(callback) {
        if (this.isBlownOut) return;
        this.isBlownOut = true;

        if (window.birthdayAudio) {
            window.birthdayAudio.playCandleBlow();
        }

        // Hide flame meshes and extinguish point lights
        this.flames.forEach((flame, idx) => {
            gsap.to(flame.mesh.scale, {
                x: 0, y: 0, z: 0, duration: 0.35, ease: "power2.in",
                onComplete: () => { flame.mesh.visible = false; }
            });
            gsap.to(this.candleLights[idx], {
                intensity: 0, duration: 0.35
            });

            // Create rising smoke particles at candle tip
            this.createSmoke(flame.x, flame.baseY, flame.z);
        });

        // Briefly dim ambient light for dramatic effect
        gsap.to(this.ambientLight, { intensity: 0.25, duration: 0.6, yoyo: true, repeat: 1 });

        // Trigger confetti & fireworks celebration callback
        setTimeout(() => {
            if (callback) callback();
            if (window.birthdayFireworks) {
                window.birthdayFireworks.grandCelebration();
            }
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 150,
                    spread: 90,
                    origin: { y: 0.6 }
                });
            }
            const banner = document.getElementById('wishCelebrationBanner');
            if (banner) {
                banner.classList.add('visible');
            }
        }, 600);
    }

    createSmoke(x, y, z) {
        for (let i = 0; i < 15; i++) {
            const smokeGeo = new THREE.SphereGeometry(0.06 + Math.random() * 0.04, 8, 8);
            const smokeMat = new THREE.MeshBasicMaterial({
                color: 0xcccccc,
                transparent: true,
                opacity: 0.65
            });
            const p = new THREE.Mesh(smokeGeo, smokeMat);
            p.position.set(x + (Math.random() - 0.5) * 0.05, y, z + (Math.random() - 0.5) * 0.05);
            this.scene.add(p);

            const targetY = y + 1.2 + Math.random() * 0.8;
            const targetX = x + (Math.random() - 0.5) * 0.5;
            const targetZ = z + (Math.random() - 0.5) * 0.5;

            gsap.to(p.position, {
                x: targetX, y: targetY, z: targetZ,
                duration: 1.2 + Math.random() * 0.8,
                delay: i * 0.05,
                ease: "power1.out"
            });
            gsap.to(p.scale, {
                x: 3.5, y: 3.5, z: 3.5,
                duration: 1.2 + Math.random() * 0.8,
                delay: i * 0.05
            });
            gsap.to(smokeMat, {
                opacity: 0,
                duration: 1.0,
                delay: 0.4 + i * 0.05,
                onComplete: () => {
                    this.scene.remove(p);
                    smokeGeo.dispose();
                    smokeMat.dispose();
                }
            });
        }
    }

    relightCandles() {
        this.isBlownOut = false;
        if (window.birthdayAudio) {
            window.birthdayAudio.playWishChime();
        }

        this.flames.forEach((flame, idx) => {
            flame.mesh.visible = true;
            gsap.to(flame.mesh.scale, {
                x: 1, y: 1, z: 1, duration: 0.4, ease: "back.out(2)"
            });
            gsap.to(this.candleLights[idx], {
                intensity: 1.2, duration: 0.4
            });
        });

        const banner = document.getElementById('wishCelebrationBanner');
        if (banner) {
            banner.classList.remove('visible');
        }
    }

    cutCake() {
        if (this.isCutting) return;
        this.isCutting = true;

        if (window.birthdayAudio) {
            window.birthdayAudio.playCakeSlice();
        }

        // Slight playful cake bounce
        gsap.to(this.cakeGroup.position, {
            y: 0.3,
            duration: 0.25,
            yoyo: true,
            repeat: 1,
            ease: "power2.out",
            onComplete: () => {
                this.isCutting = false;
            }
        });

        if (typeof confetti === 'function') {
            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.55 },
                colors: ['#f6c867', '#ff6584', '#ffffff']
            });
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const elapsedTime = this.clock.getElapsedTime();

        // Candle flame flicker simulation
        if (!this.isBlownOut) {
            this.flames.forEach(f => {
                const flicker1 = Math.sin(elapsedTime * 14 + f.seed) * 0.12;
                const flicker2 = Math.cos(elapsedTime * 20 + f.seed * 2) * 0.08;
                f.mesh.scale.x = 1.0 + flicker1;
                f.mesh.scale.z = 1.0 + flicker1;
                f.mesh.scale.y = 1.0 + flicker2;
                f.mesh.rotation.z = Math.sin(elapsedTime * 8 + f.seed) * 0.08;
            });

            this.candleLights.forEach((light, i) => {
                light.intensity = 1.0 + Math.sin(elapsedTime * 12 + i) * 0.25;
            });
        }

        // Slow stardust drift
        if (this.stardustPoints) {
            this.stardustPoints.rotation.y = elapsedTime * 0.04;
        }

        // OrbitControls update
        if (this.controls) {
            this.controls.update();
        }

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        if (!this.container || !this.renderer || !this.camera) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}
