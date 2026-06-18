/* =============================================================
   MoRi — interactions
   Lenis smooth scroll · GSAP reveals · MoRi → Moritz Richter morph
   ============================================================= */
(function () {
    "use strict";

    var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var hasGSAP = typeof window.gsap !== "undefined";
    var hasLenis = typeof window.Lenis !== "undefined";

    /* ---------------- Footer year ---------------- */
    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------------- Smooth scroll (Lenis) ---------------- */
    var lenis = null;
    if (hasLenis && !prefersReduced) {
        lenis = new window.Lenis({
            duration: 1.1,
            easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
            smoothWheel: true
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        if (hasGSAP && window.ScrollTrigger) {
            lenis.on("scroll", window.ScrollTrigger.update);
        }
    }

    /* In-page anchor scrolling (works with or without Lenis) */
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener("click", function (e) {
            var id = a.getAttribute("href");
            if (id === "#" || id.length < 2) return;
            var target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            closeNav();
            if (lenis) {
                lenis.scrollTo(target, { offset: 0, duration: 1.2 });
            } else {
                target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
            }
        });
    });

    /* ---------------- Header scrolled state ---------------- */
    var header = document.getElementById("header");
    function onScrollHeader(y) {
        if (!header) return;
        if (y > 40) header.classList.add("is-scrolled");
        else header.classList.remove("is-scrolled");
    }

    /* ---------------- Wordmark morph ---------------- */
    var wordmark = document.getElementById("wordmark");
    var growEls = wordmark ? Array.prototype.slice.call(wordmark.querySelectorAll(".grow")) : [];
    var gapEl = wordmark ? wordmark.querySelector(".gap") : null;
    var targets = [];
    var gapTarget = 0;

    function measure() {
        targets = growEls.map(function (el) {
            return el.scrollWidth; // full content width even while clipped
        });
        if (gapEl) gapTarget = gapEl.scrollWidth || 0;
    }

    function applyMorph(p) {
        // p: 0 (MoRi) -> 1 (Moritz Richter)
        var eased = p * p * (3 - 2 * p); // smoothstep
        growEls.forEach(function (el, i) {
            el.style.maxWidth = (targets[i] * eased) + "px";
            el.style.opacity = Math.min(1, eased * 1.4);
        });
        if (gapEl) gapEl.style.width = (gapTarget * eased) + "px";
    }

    var hero = document.getElementById("hero");
    var heroPin = document.getElementById("heroPin");
    // Whether we drive the sticky-pin reveal (home page with the wordmark).
    var hasPin = !!(heroPin && wordmark);

    // Progress (0..1) of the pinned reveal, from how far we've scrolled through
    // the tall .hero-pin wrapper while the hero stays stuck to the top.
    function morphProgress() {
        if (!heroPin) return 0;
        var rect = heroPin.getBoundingClientRect();
        var dist = rect.height - window.innerHeight;
        if (dist <= 0) return rect.top <= 0 ? 1 : 0;
        return Math.max(0, Math.min(1, (-rect.top) / dist));
    }

    function onScroll(y) {
        if (hasPin) {
            var p = morphProgress();
            applyMorph(p);
            // Brand "MoRi" appears once the name is fully revealed and stays for
            // the rest of the page; collapses back near the top.
            if (header) header.classList.toggle("is-scrolled", p > 0.985);
        } else {
            onScrollHeader(y);
        }
    }

    if (lenis) {
        lenis.on("scroll", function (e) { onScroll(e.scroll); });
    } else {
        window.addEventListener("scroll", function () { onScroll(window.scrollY || window.pageYOffset); }, { passive: true });
    }

    /* ---------------- Reveals ---------------- */
    var reveals = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
    if (hasGSAP && window.ScrollTrigger && !prefersReduced) {
        window.gsap.registerPlugin(window.ScrollTrigger);
        reveals.forEach(function (el) {
            window.gsap.fromTo(el,
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0, duration: 0.95, ease: "power3.out",
                    scrollTrigger: { trigger: el, start: "top 86%" }
                });
        });
        // subtle parallax on feature/about media
        document.querySelectorAll(".feature__media img, .about__portrait img").forEach(function (img) {
            window.gsap.fromTo(img, { y: -14 }, {
                y: 14, ease: "none",
                scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: true }
            });
        });
    } else if ("IntersectionObserver" in window && !prefersReduced) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
            });
        }, { threshold: 0.12 });
        reveals.forEach(function (el) { io.observe(el); });
    } else {
        reveals.forEach(function (el) { el.classList.add("is-in"); });
    }

    /* ---------------- Mobile nav ---------------- */
    var toggle = document.getElementById("navToggle");
    function closeNav() {
        document.body.classList.remove("nav-open");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
        if (lenis) lenis.start();
    }
    if (toggle) {
        toggle.addEventListener("click", function () {
            var open = document.body.classList.toggle("nav-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
            if (lenis) { open ? lenis.stop() : lenis.start(); }
        });
    }

    /* ---------------- Feature Video Autoplay ---------------- */
    document.querySelectorAll(".feature").forEach(card => {
        const video = card.querySelector("video");

        if (!video) return;

        card.addEventListener("mouseenter", () => {
            video.muted = true;
            video.play();
        });

        card.addEventListener("mouseleave", () => {
            video.pause();
            // video.currentTime = 0;
        });
    });

    /* ---------------- Feature Video Autoplay ---------------- */
    document.querySelectorAll(".hover-play").forEach(video => {
        const container = video.closest("figure") || video.closest('.feature__media') || video.parentElement;
        if (!container) return;

        container.addEventListener("mouseenter", () => video.play());
        container.addEventListener("mouseleave", () => video.pause());
    });

    /* Touch: play hover-play videos when scrolled into view */
    var isTouchDevice = ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);
    if (isTouchDevice && "IntersectionObserver" in window) {
        var hpIO = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                var v = en.target;
                if (en.isIntersecting) {
                    v.muted = true;
                    var p = v.play();
                    if (p && p.catch) p.catch(function () {});
                } else {
                    v.pause();
                }
            });
        }, { threshold: 0.25 });
        document.querySelectorAll(".hover-play").forEach(function (v) {
            hpIO.observe(v);
        });
    }

    /* ---------------- Showreel play ---------------- */
    var reelPlayer = document.getElementById("reelPlayer");
    var reelVideo = document.getElementById("reelVideo");
    var reelPlay = document.getElementById("reelPlay");
    function startReel() {
        if (!reelVideo) return;
        reelPlayer.classList.add("is-playing");
        reelVideo.play();
    }
    if (reelPlay) reelPlay.addEventListener("click", startReel);
    if (reelPlayer) reelPlayer.addEventListener("click", function (e) {
        if (e.target === reelPlay || (reelPlay && reelPlay.contains(e.target))) return;
        if (!reelPlayer.classList.contains("is-playing")) startReel();
    });

    /* ---------------- Feature inline videos: pause offscreen ---------------- */
    if ("IntersectionObserver" in window) {
        var vIO = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                var v = en.target;
                if (en.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () { }); }
                else v.pause();
            });
        }, { threshold: 0.25 });
        document.querySelectorAll(".feature__media video[autoplay]").forEach(function (v) { vIO.observe(v); });
    }

    /* ---------------- Portrait Images ---------------- */
    const portraitImages = document.querySelectorAll(".portrait-image");

    if (portraitImages.length > 1) {
    let current = 0;

    setInterval(() => {
        portraitImages[current].classList.remove("active");

        current = (current + 1) % portraitImages.length;

        portraitImages[current].classList.add("active");
    }, 5000);
    }

    /* ---------------- Lightbox ---------------- */
    var lightbox = null;
    var lightboxContent = null;
    var lightboxActive = false;

    function createLightbox() {
        lightbox = document.createElement("div");
        lightbox.className = "lightbox";
        lightbox.setAttribute("role", "dialog");
        lightbox.setAttribute("aria-modal", "true");
        lightbox.setAttribute("aria-label", "Media viewer");

        var backdrop = document.createElement("div");
        backdrop.className = "lightbox__backdrop";

        lightboxContent = document.createElement("div");
        lightboxContent.className = "lightbox__content";

        var closeBtn = document.createElement("button");
        closeBtn.className = "lightbox__close";
        closeBtn.setAttribute("aria-label", "Close viewer");
        closeBtn.innerHTML = "&#x2715;";

        lightbox.appendChild(backdrop);
        lightbox.appendChild(lightboxContent);
        lightbox.appendChild(closeBtn);
        document.body.appendChild(lightbox);

        backdrop.addEventListener("click", closeLightbox);
        closeBtn.addEventListener("click", closeLightbox);
    }

    function openLightbox(mediaEl) {
        if (!lightbox) createLightbox();
        lightboxContent.innerHTML = "";

        var clone;
        if (mediaEl.tagName === "VIDEO") {
            clone = document.createElement("video");
            clone.src = mediaEl.currentSrc || mediaEl.src;
            if (mediaEl.querySelector("source")) {
                var sources = mediaEl.querySelectorAll("source");
                for (var i = 0; i < sources.length; i++) {
                    var s = document.createElement("source");
                    s.src = sources[i].src;
                    s.type = sources[i].type;
                    clone.appendChild(s);
                }
            }
            clone.controls = true;
            clone.autoplay = true;
            clone.muted = false;
            clone.loop = true;
            clone.playsInline = true;
        } else {
            clone = document.createElement("img");
            clone.src = mediaEl.src;
            clone.alt = mediaEl.alt || "";
        }

        lightboxContent.appendChild(clone);
        document.body.classList.add("lightbox-open");
        lightbox.classList.add("is-active");
        lightboxActive = true;
        if (lenis) lenis.stop();
    }

    function closeLightbox() {
        if (!lightboxActive) return;
        lightbox.classList.remove("is-active");
        document.body.classList.remove("lightbox-open");
        lightboxActive = false;
        if (lenis) lenis.start();

        setTimeout(function () {
            if (lightboxContent) {
                var vid = lightboxContent.querySelector("video");
                if (vid) vid.pause();
                lightboxContent.innerHTML = "";
            }
        }, 400);
    }

    document.querySelectorAll(".proj-gallery figure").forEach(function (fig) {
        fig.addEventListener("click", function (e) {
            var media = fig.querySelector("video") || fig.querySelector("img");
            if (media) openLightbox(media);
        });
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && lightboxActive) closeLightbox();
    });

    /* ---------------- Init ---------------- */
    function init() {
        measure();
        onScroll(window.scrollY || window.pageYOffset);
        if (hasGSAP && window.ScrollTrigger) window.ScrollTrigger.refresh();
    }

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { measure(); onScroll(window.scrollY || 0); });
    }
    window.addEventListener("load", init);
    window.addEventListener("resize", function () { measure(); onScroll(window.scrollY || (lenis ? lenis.scroll : 0)); });
    init();
})();
