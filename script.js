// Ticker infini — duplique le contenu et anime via JS
function initTickers() {
    document.querySelectorAll('.band-track').forEach(track => {
        const original = track.querySelector('.band-content');
        if (!original) return;

        const bandWidth = track.parentElement.offsetWidth;
        const contentWidth = original.offsetWidth;
        const copies = Math.ceil((bandWidth * 2) / contentWidth) + 2;
        for (let i = 0; i < copies; i++) {
            track.appendChild(original.cloneNode(true));
        }

        const totalWidth = original.offsetWidth * (copies + 1);
        const reverse = track.classList.contains('band-track-reverse');
        let pos = reverse ? -(totalWidth / 2) : 0;
        const speed = 0.5; // px par frame

        function tick() {
            if (reverse) {
                pos += speed;
                if (pos >= 0) pos = -(totalWidth / 2);
            } else {
                pos -= speed;
                if (pos <= -(totalWidth / 2)) pos = 0;
            }
            track.style.transform = `translateX(${pos}px)`;
            requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    });
}

// Animation compteur CO₂
function animateCarbon() {
    const el = document.querySelector('.carbon-count');
    const bar = document.getElementById('carbon-bar');
    if (!el) return;

    const target = parseFloat(el.dataset.target);
    const duration = 2400;
    const start = performance.now();

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        const val = easeOut(t) * target;
        el.textContent = val.toFixed(1);
        if (bar) bar.style.width = (easeOut(t) * 100) + '%';
        if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

// Carousel swipeable + autoplay
function initCarousel(el) {
    const slides = el.querySelector('.carousel-slides');
    const dots = el.querySelectorAll('.cdot');
    const total = dots.length;
    let current = 0;
    let startX = 0;
    let timer;

    function go(n) {
        current = (n + total) % total;
        slides.style.transform = `translateX(${-current * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function startAuto() {
        timer = setInterval(() => go(current + 1), 3000);
    }

    function resetAuto() {
        clearInterval(timer);
        startAuto();
    }

    startAuto();

    el.addEventListener('mousedown', e => { startX = e.clientX; el.classList.add('grabbing'); });
    el.addEventListener('mouseup', e => {
        el.classList.remove('grabbing');
        const d = e.clientX - startX;
        if (d < -20) { go(current + 1); resetAuto(); }
        else if (d > 20) { go(current - 1); resetAuto(); }
    });
    el.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', e => {
        const d = e.changedTouches[0].clientX - startX;
        if (d < -20) { go(current + 1); resetAuto(); }
        else if (d > 20) { go(current - 1); resetAuto(); }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.carousel').forEach(initCarousel);

    initTickers();
    setTimeout(animateCarbon, 800);
    const container = document.querySelector(".brutal-container");
    const menuLinks = document.querySelectorAll(".sommaire a");
    const projects = document.querySelectorAll(".project-item");
    const galleryGroups = document.querySelectorAll(".gallery-group");
    const logo = document.querySelector(".identity");

    // 1. CLIC SUR LE SOMMAIRE (Ouvre la 2e colonne, ferme col3)
    menuLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.stopPropagation();
            projects.forEach(p => p.classList.remove("selected"));
            container.classList.remove("show-gallery");
            container.classList.remove("show-rairsun");
            container.classList.add("show-content");
        });
    });

    const isMobile = () => window.innerWidth <= 1024;

    // Boutons retour (mobile) — tous les .gallery-back + #btn-back-rairsun
    document.querySelectorAll('.gallery-back, #btn-back-rairsun').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            projects.forEach(p => p.classList.remove('selected'));
            galleryGroups.forEach(g => g.classList.remove('active'));
            container.classList.remove('show-gallery', 'show-rairsun');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // 2. CLIC SUR LES PROJETS (Ouvre la 3e colonne)
    projects.forEach(project => {
        project.addEventListener("click", (e) => {
            if (e.target.classList.contains('project-link')) return;
            e.stopPropagation();

            const targetProject = project.getAttribute("data-project");
            const isRairSun = project.getAttribute("data-panel") === "rairsun";

            // Reclique sur le projet actif → ferme col3
            if (project.classList.contains("selected")) {
                project.classList.remove("selected");
                container.classList.remove("show-gallery");
                container.classList.remove("show-rairsun");
                setTimeout(() => galleryGroups.forEach(g => g.classList.remove("active")), 400);
                return;
            }

            projects.forEach(p => p.classList.remove("selected"));
            galleryGroups.forEach(g => g.classList.remove("active"));
            project.classList.add("selected");

            if (isRairSun) {
                container.classList.remove("show-gallery");
                container.classList.add("show-rairsun");
            } else {
                container.classList.remove("show-rairsun");
                container.classList.add("show-gallery");
            }

            const activeGallery = document.getElementById(`gallery-${targetProject}`);
            if (activeGallery) {
                activeGallery.classList.add("active");
                if (isMobile()) {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                }
                // Force Instagram à retraiter les embeds dans la galerie active
                if (window.instgrm) {
                    window.instgrm.Embeds.process();
                }
            }
        });
    });

    // 3. CLIC SUR LE LOGO (réinitialise tout)
    if (logo) {
        logo.style.cursor = "pointer";
        logo.addEventListener("click", (e) => {
            e.stopPropagation();
            resetAll();
        });
    }

    // 4. ÉCOUTEUR GLOBAL
    document.addEventListener("click", (e) => {
        const clickedOnMiddle = e.target.closest('.right-col');
        const clickedOnLeft = e.target.closest('.left-col');
        const clickedOnImages = e.target.closest('.images-col');
        const clickedOnProject = e.target.closest('.project-item');

        if (container.classList.contains("show-rairsun")) {
            if (clickedOnMiddle && !clickedOnProject) {
                // Clic sur col2 (pas sur un projet) → col1 revient
                projects.forEach(p => p.classList.remove("selected"));
                container.classList.remove("show-rairsun");
                setTimeout(() => galleryGroups.forEach(g => g.classList.remove("active")), 400);
            } else if (!clickedOnImages && !clickedOnProject) {
                resetAll();
            }
        } else if (container.classList.contains("show-gallery") && !clickedOnProject) {
            projects.forEach(p => p.classList.remove("selected"));
            container.classList.remove("show-gallery");
        } else if (!clickedOnLeft && !clickedOnMiddle) {
            resetAll();
        }
    });

    function resetAll() {
        projects.forEach(p => p.classList.remove("selected"));
        container.classList.remove("show-gallery");
        container.classList.remove("show-rairsun");
        container.classList.remove("show-content");
        setTimeout(() => galleryGroups.forEach(g => g.classList.remove("active")), 400);
    }
});
