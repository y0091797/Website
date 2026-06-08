/* =====================================================
   Moritz Richter — Portfolio · interactions
   ===================================================== */

/* ---- About / tabs ---- */
function opentab(tabname){
    document.querySelectorAll(".tab-links").forEach(l => l.classList.remove("active-link"));
    document.querySelectorAll(".tab-contents").forEach(c => c.classList.remove("active-tab"));
    if (window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add("active-link");
    }
    const el = document.getElementById(tabname);
    if (el) el.classList.add("active-tab");
}

/* ---- Mobile navigation ---- */
function openmenu(){
    const m = document.getElementById("sidemenu");
    if (m) m.classList.add("open");
}
function closemenu(){
    const m = document.getElementById("sidemenu");
    if (m) m.classList.remove("open");
}

/* ---- "Read my full story" toggle ---- */
(function(){
    const btn = document.getElementById("aboutbtn");
    const text = document.getElementById("abouttext");
    if (!btn || !text) return;
    btn.addEventListener("click", () => {
        const open = text.style.display === "block";
        text.style.display = open ? "none" : "block";
        btn.innerHTML = open
            ? '<i class="fa-solid fa-circle-info"></i> Read my full story'
            : '<i class="fa-solid fa-xmark"></i> Hide';
    });
})();

/* ---- Sticky navbar shadow on scroll ---- */
(function(){
    const header = document.getElementById("header");
    if (!header) return;
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
})();

/* ---- Scroll reveal ---- */
(function(){
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
        items.forEach(i => i.classList.add("in"));
        return;
    }
    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                e.target.classList.add("in");
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    items.forEach((i, idx) => {
        i.style.transitionDelay = `${Math.min(idx % 4, 3) * 80}ms`;
        io.observe(i);
    });
})();

/* ---- Custom cursor ---- */
(function(){
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    if (!dot || !ring || window.matchMedia("(hover: none)").matches) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener("mousemove", (e) => {
        mx = e.clientX; my = e.clientY;
        dot.style.left = mx + "px";
        dot.style.top = my + "px";
    });
    (function loop(){
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.left = rx + "px";
        ring.style.top = ry + "px";
        requestAnimationFrame(loop);
    })();

    const interactive = "a, button, .tab-links, .work, .service-card, input, textarea, .menu-open";
    document.querySelectorAll(interactive).forEach((el) => {
        el.addEventListener("mouseenter", () => ring.classList.add("is-active"));
        el.addEventListener("mouseleave", () => ring.classList.remove("is-active"));
    });
})();

/* ---- Project video: start a touch in ---- */
(function(){
    const video = document.getElementById("vid");
    if (!video) return;
    video.addEventListener("loadedmetadata", function(){ this.currentTime = 1; }, false);
})();
