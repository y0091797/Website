/* =============================================================
   MoRi — PLACEHOLDER motion layers (per-project hover FX)
   -------------------------------------------------------------
   Attaches to any <canvas data-starfield> and animates it while
   its parent .feature card is hovered/focused. The effect is
   chosen per canvas via the data-fx attribute:
     • data-fx="stars"  (default) — drifting/twinkling stars +
       occasional shooting stars (Mala).
     • data-fx="freya"            — glowing green particle flair
       (floating motes with occasional bright sparkles).

   These are intentionally stand-ins. To swap in your own design,
   replace the matching draw/build pair (or the whole file) — the
   wiring (hover start/stop, sizing) can stay as-is.
   ============================================================= */
(function () {
    "use strict";

    var prefersReduced = false; // window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var STAR_COLOR = "242, 230, 200"; // --cream, as rgb for alpha compositing
    var FREYA_GLOW = "104, 214, 120"; // magic-forest green halo
    var FREYA_CORE = "196, 255, 206"; // bright green-white particle core

    var canvases = Array.prototype.slice.call(document.querySelectorAll("canvas[data-starfield]"));
    canvases.forEach(initStarfield);

    function initStarfield(canvas) {
        var ctx = canvas.getContext("2d");
        if (!ctx) return;

        var card = canvas.closest(".feature") || canvas.parentElement;
        
        if (!card) return;
        var fx = (canvas.getAttribute("data-fx") || "stars").toLowerCase();
        var dpr = clampDpr();
        var w = 0, h = 0;
        var stars = [];
        var shooting = [];
        var particles = [];
        var running = false;
        var rafId = null;
        var stopTimer = null;
        var prev = 0;
        var nextShoot = 0;
        var nextFlare = 0;

        function clampDpr() {
            return Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
        }

        function resize() {
            var rect = canvas.getBoundingClientRect();
            w = rect.width;
            h = rect.height;
            
            // Ensure canvas has valid dimensions
            if (w === 0 || h === 0) {
                // Fallback: use parent container dimensions
                var parent = canvas.parentElement;
                if (parent) {
                    var parentRect = parent.getBoundingClientRect();
                    w = w || parentRect.width;
                    h = h || parentRect.height;
                }
            }
            
            if (w === 0 || h === 0) return; // Bail if we still have no dimensions
            
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            build();
        }

        function build() {
            if (fx === "freya" || fx === "particles") buildParticles();
            else buildStars();
        }

        function buildStars() {
            var count = Math.round((w * h) / 6000);
            count = Math.max(40, Math.min(count, 160));
            stars = [];
            for (var i = 0; i < count; i++) {
                stars.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    r: Math.random() * 1.1 + 0.7, // size radius
                    tw: Math.random() * Math.PI * 2,
                    twSpeed: Math.random() * 1.4 + 0.4,
                    vx: (Math.random() - 0.5) * 0.1, // horizontal drift
                    vy: (Math.random() - 0.5) * 0.06 // vertical drift, slower than horizontal
                });
            }
        }

        function spawnShooting() {
            var angle = Math.PI * (0.10 + Math.random() * 0.12); // shallow, downward-right
            var speed = w * (0.45 + Math.random() * 0.35);        // px/sec, scales with width
            shooting.push({
                x: Math.random() * w * 0.5 - w * 0.05,
                y: Math.random() * h * 0.45,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0,
                ttl: 0.7 + Math.random() * 0.5,
                len: 70 + Math.random() * 90
            });
        }

        function buildParticles() {
            var count = Math.round((w * h) / 13000);
            count = Math.max(16, Math.min(count, 64));
            particles = [];
            for (var i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    r: Math.random() * 1.6 + 1.1,        // core radius
                    glow: Math.random() * 3 + 3.5,       // glow radius = r * glow
                    vx: (Math.random() - 0.5) * 0.16,    // gentle horizontal sway
                    vy: -(Math.random() * 0.16 + 0.04),  // slow upward drift
                    pulse: Math.random() * Math.PI * 2,
                    pulseSpeed: Math.random() * 1.6 + 0.5,
                    flare: 0                             // 0..1, decays after a sparkle
                });
            }
        }

        function draw(dt) {
            if (fx === "freya" || fx === "particles") drawFreya(dt);
            else drawStars(dt);
        }

        function drawFreya(dt) {
            ctx.clearRect(0, 0, w, h);
            ctx.globalCompositeOperation = "lighter"; // additive glow

            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                p.x += p.vx * dt * 60;
                p.y += p.vy * dt * 60;
                if (p.y < -12) p.y = h + 12;
                if (p.x < -12) p.x = w + 12; else if (p.x > w + 12) p.x = -12;
                p.pulse += p.pulseSpeed * dt;
                if (p.flare > 0) p.flare = Math.max(0, p.flare - dt / 0.6);

                var pulse = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(p.pulse));
                var boost = 1 + p.flare * 1.6;
                var gR = p.r * p.glow * (1 + p.flare * 0.9);
                var aGlow = Math.min(1, 0.45 * pulse * boost);
                var aCore = Math.min(1, 0.85 * pulse * boost);

                var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, gR);
                grad.addColorStop(0, "rgba(" + FREYA_GLOW + "," + aGlow.toFixed(3) + ")");
                grad.addColorStop(0.5, "rgba(" + FREYA_GLOW + "," + (aGlow * 0.35).toFixed(3) + ")");
                grad.addColorStop(1, "rgba(" + FREYA_GLOW + ",0)");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(p.x, p.y, gR, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "rgba(" + FREYA_CORE + "," + aCore.toFixed(3) + ")";
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * (0.7 + 0.3 * pulse), 0, Math.PI * 2);
                ctx.fill();

                if (p.flare > 0) drawSparkle(p.x, p.y, gR * 1.7, p.flare);
            }

            nextFlare -= dt;
            if (nextFlare <= 0 && particles.length) {
                particles[(Math.random() * particles.length) | 0].flare = 1;
                nextFlare = 0.9 + Math.random() * 1.8;
            }

            ctx.globalCompositeOperation = "source-over";
        }

        function drawSparkle(x, y, len, strength) {
            var rays = [[1, 0], [-1, 0], [0, 1], [0, -1]];
            ctx.lineCap = "round";
            ctx.lineWidth = 1.2;
            for (var r = 0; r < rays.length; r++) {
                var ex = x + rays[r][0] * len;
                var ey = y + rays[r][1] * len;
                var g = ctx.createLinearGradient(x, y, ex, ey);
                g.addColorStop(0, "rgba(" + FREYA_CORE + "," + (0.7 * strength).toFixed(3) + ")");
                g.addColorStop(1, "rgba(" + FREYA_CORE + ",0)");
                ctx.strokeStyle = g;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(ex, ey);
                ctx.stroke();
            }
        }

        function drawStars(dt) {
            ctx.clearRect(0, 0, w, h);

            for (var i = 0; i < stars.length; i++) {
                var s = stars[i];
                s.x += s.vx * dt * 60;
                s.y += s.vy * dt * 60;
                if (s.x < -2) s.x = w + 2; else if (s.x > w + 2) s.x = -2;
                if (s.y > h + 2) s.y = -2;
                s.tw += s.twSpeed * dt;
                var a = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(s.tw));
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(" + STAR_COLOR + "," + a.toFixed(3) + ")";
                ctx.fill();
            }

            nextShoot -= dt;
            if (nextShoot <= 0) {
                spawnShooting();
                nextShoot = 2.5 + Math.random() * 3.5;
            }

            for (var j = shooting.length - 1; j >= 0; j--) {
                var sh = shooting[j];
                sh.life += dt;
                sh.x += sh.vx * dt;
                sh.y += sh.vy * dt;
                var k = sh.life / sh.ttl;
                if (k >= 1 || sh.x > w + 120 || sh.y > h + 120) {
                    shooting.splice(j, 1);
                    continue;
                }
                var fade = Math.sin(Math.PI * k);
                var mag = Math.hypot(sh.vx, sh.vy) || 1;
                var tailX = sh.x - (sh.vx / mag) * sh.len;
                var tailY = sh.y - (sh.vy / mag) * sh.len;
                var grad = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
                grad.addColorStop(0, "rgba(" + STAR_COLOR + "," + (0.9 * fade).toFixed(3) + ")");
                grad.addColorStop(1, "rgba(" + STAR_COLOR + ",0)");
                ctx.strokeStyle = grad;
                ctx.lineWidth = 1.6;
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(sh.x, sh.y);
                ctx.lineTo(tailX, tailY);
                ctx.stroke();
            }
        }

        function frame(t) {
            if (!running) return;
            if (!prev) prev = t;
            var dt = Math.min(0.05, (t - prev) / 1000);
            prev = t;
            draw(dt);
            rafId = requestAnimationFrame(frame);
        }

        function start() {
            if (stopTimer) { clearTimeout(stopTimer); stopTimer = null; }
            if (running || prefersReduced) return;
            if (!w || !h) resize();
            running = true;
            prev = 0;
            nextShoot = 1.2;
            nextFlare = 0.6;
            rafId = requestAnimationFrame(frame);
        }

        function stop() {
            running = false;
            if (rafId) cancelAnimationFrame(rafId);
            rafId = null;
            shooting = [];
            ctx.globalCompositeOperation = "source-over";
            ctx.clearRect(0, 0, w, h);
        }

        function scheduleStop() {
            // keep animating through the CSS opacity fade-out, then halt
            if (stopTimer) clearTimeout(stopTimer);
            stopTimer = setTimeout(function () { stop(); stopTimer = null; }, 700);
        }

        card.addEventListener("mouseenter", start);
        card.addEventListener("mouseleave", scheduleStop);
        card.addEventListener("focusin", start);
        card.addEventListener("focusout", scheduleStop);

        window.addEventListener("resize", function () {
            dpr = clampDpr();
            resize();
            if (!running) ctx.clearRect(0, 0, w, h);
        });

        resize();
    }
})();
