/**
 * Audio Engine for Ambreen's Birthday Website
 * Procedural Web Audio API Synthesizer (Zero-latency, 100% offline, zero external dependencies)
 */
class BirthdayAudioEngine {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.isMuted = false;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.melodyTimeout = null;
        this.step = 0;

        // "Happy Birthday to You" notes and frequencies (Key of C / F)
        // [noteFreq, durationInBeats]
        this.melody = [
            { f: 261.63, d: 0.75 }, // C4  Hap-
            { f: 261.63, d: 0.25 }, // C4  py
            { f: 293.66, d: 1.0 },  // D4  birth-
            { f: 261.63, d: 1.0 },  // C4  day
            { f: 349.23, d: 1.0 },  // F4  to
            { f: 329.63, d: 2.0 },  // E4  you

            { f: 261.63, d: 0.75 }, // C4  Hap-
            { f: 261.63, d: 0.25 }, // C4  py
            { f: 293.66, d: 1.0 },  // D4  birth-
            { f: 261.63, d: 1.0 },  // C4  day
            { f: 392.00, d: 1.0 },  // G4  to
            { f: 349.23, d: 2.0 },  // F4  you

            { f: 261.63, d: 0.75 }, // C4  Hap-
            { f: 261.63, d: 0.25 }, // C4  py
            { f: 523.25, d: 1.0 },  // C5  birth-
            { f: 440.00, d: 1.0 },  // A4  day
            { f: 349.23, d: 1.0 },  // F4  dear
            { f: 329.63, d: 1.0 },  // E4  Mag-
            { f: 293.66, d: 2.0 },  // D4  gie

            { f: 466.16, d: 0.75 }, // Bb4 Hap-
            { f: 466.16, d: 0.25 }, // Bb4 py
            { f: 440.00, d: 1.0 },  // A4  birth-
            { f: 349.23, d: 1.0 },  // F4  day
            { f: 392.00, d: 1.0 },  // G4  to
            { f: 349.23, d: 2.5 }   // F4  you!
        ];

        // Soft chords accompanying the melody
        this.chords = [
            [130.81, 196.00, 261.63], // C
            [130.81, 196.00, 261.63],
            [174.61, 220.00, 261.63], // F
            [130.81, 196.00, 261.63], // C
            [196.00, 246.94, 293.66], // G
            [174.61, 220.00, 261.63]  // F
        ];
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();

            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
            this.musicGain.connect(this.masterGain);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
            this.sfxGain.connect(this.masterGain);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    startMusic() {
        this.init();
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.step = 0;
        this.playNextNote();
        this.updateVisualizerState(true);
    }

    stopMusic() {
        this.isPlaying = false;
        if (this.melodyTimeout) {
            clearTimeout(this.melodyTimeout);
            this.melodyTimeout = null;
        }
        this.updateVisualizerState(false);
    }

    toggleMusic() {
        if (this.isPlaying) {
            this.stopMusic();
        } else {
            this.startMusic();
        }
        return this.isPlaying;
    }

    playNextNote() {
        if (!this.isPlaying || !this.ctx) return;

        const note = this.melody[this.step % this.melody.length];
        const tempo = 440; // ms per beat (warm, gentle tempo)
        const duration = note.d * (tempo / 1000);

        this.synthesizeBellNote(note.f, duration);

        // Every 4 melody steps, trigger a lush background warm pad chord
        if (this.step % 4 === 0) {
            const chordIndex = Math.floor((this.step / 4) % this.chords.length);
            this.synthesizeChord(this.chords[chordIndex], 2.2);
        }

        this.step++;
        const nextDelay = note.d * tempo;
        this.melodyTimeout = setTimeout(() => {
            this.playNextNote();
        }, nextDelay);
    }

    synthesizeBellNote(freq, duration) {
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        // Two oscillators for rich music box / celesta tone
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now);

        // Harmonically rich subtle overtone
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 2, now);

        // Envelope: quick attack, sparkling sustain, gentle decay
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.28, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration + 0.6);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.musicGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration + 0.6);
        osc2.stop(now + duration + 0.6);
    }

    synthesizeChord(frequencies, duration) {
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        frequencies.forEach(f => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.06, now + 0.4);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(gain);
            gain.connect(this.musicGain);

            osc.start(now);
            osc.stop(now + duration);
        });
    }

    // Sound FX: Candle Blowout (Whoosh + White Noise Puff)
    playCandleBlow() {
        this.init();
        if (this.isMuted || !this.ctx) return;

        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.8;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.8);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.0, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(now);
        noise.stop(now + 0.8);
    }

    // Sound FX: Firework Launch & Pop
    playFireworkPop() {
        this.init();
        if (this.isMuted || !this.ctx) return;

        const now = this.ctx.currentTime;
        // Whistle
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.3);

        oscGain.gain.setValueAtTime(0.15, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.connect(oscGain);
        oscGain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.3);

        // Pop burst
        setTimeout(() => {
            if (!this.ctx) return;
            const popTime = this.ctx.currentTime;
            const popOsc = this.ctx.createOscillator();
            const popGain = this.ctx.createGain();
            popOsc.type = 'sine';
            popOsc.frequency.setValueAtTime(160, popTime);
            popOsc.frequency.exponentialRampToValueAtTime(40, popTime + 0.25);

            popGain.gain.setValueAtTime(0.4, popTime);
            popGain.gain.exponentialRampToValueAtTime(0.001, popTime + 0.35);

            popOsc.connect(popGain);
            popGain.connect(this.sfxGain);
            popOsc.start(popTime);
            popOsc.stop(popTime + 0.35);
        }, 300);
    }

    // Sound FX: Celestial Harp / Wish Sparkle
    playWishChime() {
        this.init();
        if (this.isMuted || !this.ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C E G C E
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                if (!this.ctx) return;
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);

                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(now);
                osc.stop(now + 0.9);
            }, idx * 70);
        });
    }

    // Sound FX: Cake Slice Ding
    playCakeSlice() {
        this.init();
        if (this.isMuted || !this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.4);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.5);
    }

    updateVisualizerState(active) {
        const visualizer = document.getElementById('musicVisualizer');
        const vinylDisc = document.getElementById('vinylDisc');
        const playBtn = document.getElementById('musicToggleBtn');
        if (visualizer) {
            visualizer.classList.toggle('playing', active);
        }
        if (vinylDisc) {
            vinylDisc.classList.toggle('spinning', active);
        }
        if (playBtn) {
            playBtn.innerHTML = active 
                ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect></svg>' 
                : '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
        }
    }
}

// Global Audio Engine Instance
window.birthdayAudio = new BirthdayAudioEngine();
