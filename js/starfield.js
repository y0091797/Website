/* =============================================================
   MoRi — PLACEHOLDER motion layer: hover starfield
   -------------------------------------------------------------
   Renders slowly drifting, twinkling stars plus the occasional
   shooting star onto any <canvas data-starfield> while its parent
   .feature card is hovered/focused.

   This is intentionally a stand-in. To swap in your own design,
   replace the body of `draw()` (or the whole file) — the wiring
   (hover start/stop, sizing, reduced-motion) can stay as-is.
   ============================================================= */
(function () {
    "use strict";

    var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var STAR_COLOR = "242, 230, 200"; // --cream, as rgb for alpha compositing

    Array.prototype.slice
        .call(document.querySelectorAll("canvas[data-starfield]"))
        .forEach(initStarfield);

    function initStarfield(canvas) {
        var ctx = canvas.getContext("2d");
        if (!ctx) return;

        var card = canvas.closest(".feature") || canvas.parentElement;
        var dpr = clampDpr();
        var w = 0, h = 0;
        var stars = [];
        var shooting = [];
        var running = false;
        var rafId = null;
        var stopTimer = null;
        var prev = 0;
        var nextShoot = 0;

        function clampDpr() {
            return Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
        }

        function resize() {
            var rect = canvas.getBoundingClientRect();
            w = rect.width;
            h = rect.height;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            buildStars();
        }

        function buildStars() {
            var count = Math.round((w * h) / 6000);
            count = Math.max(40, Math.min(count, 160));
            stars = [];
            for (var i = 0; i < count; i++) {
                stars.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    r: Math.random() * 1.1 + 0.3,
                    tw: Math.random() * Math.PI * 2,
                    twSpeed: Math.random() * 1.4 + 0.4,
                    vx: (Math.random() - 0.5) * 0.05,
                    vy: Math.random() * 0.04 + 0.015
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

        function draw(dt) {
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
            rafId = requestAnimationFrame(frame);
        }

        function stop() {
            running = false;
            if (rafId) cancelAnimationFrame(rafId);
            rafId = null;
            shooting = [];
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
