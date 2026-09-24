
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

    let visible = false;

    function resetAuto() {
        clearInterval(timer);
        if (visible) startAuto();
    }

    // Défile seulement quand le post est visible : le 2e post de l'iPhone reste
    // immobile jusqu'à ce qu'on fasse défiler l'écran jusqu'à lui.
    new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        resetAuto();
    }, { threshold: 0.6 }).observe(el);

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

    const container = document.querySelector(".brutal-container");
    const menuLinks = document.querySelectorAll(".sommaire a");
    const projects = document.querySelectorAll(".project-item");
    const galleryGroups = document.querySelectorAll(".gallery-group");
    const logo = document.querySelector(".site-header .logo");
    const sections = document.querySelectorAll(".right-col .brutal-section");

    // 1. CLIC SUR LE SOMMAIRE (Ouvre la 2e colonne, ferme col3)
    function showSection(href) {
        menuLinks.forEach(l => l.classList.toggle("active", l.getAttribute("href") === href));
        sections.forEach(s => { s.hidden = "#" + s.id !== href; });
        document.querySelector(".right-col").scrollTop = 0;
        if (isMobile()) document.querySelector(href).scrollIntoView();
        projects.forEach(p => p.classList.remove("selected"));
        container.classList.remove("show-gallery", "show-rairsun");
        container.classList.add("show-content");
    }

    menuLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.stopPropagation();
            // Pas de saut d'ancre (une seule section visible) : l'historique est géré à la main
            // pour que la flèche retour du navigateur revienne à l'écran précédent.
            e.preventDefault();
            const href = link.getAttribute("href");
            if (!history.state || history.state.section !== href) history.pushState({ section: href }, "", href);
            showSection(href);
        });
    });

    // Flèche du 1er écran : descend au sommaire (sans ancre, pour ne pas ajouter d'étape d'historique)
    document.querySelector(".scroll-hint").addEventListener("click", (e) => {
        e.preventDefault();
        const sommaire = document.getElementById("sommaire");
        // Desktop : la colonne défile ; mobile : la fenêtre. L'autre appel est sans effet.
        document.querySelector(".left-col").scrollTo({ top: sommaire.offsetTop, behavior: "smooth" });
        window.scrollTo({ top: sommaire.getBoundingClientRect().top + window.scrollY, behavior: "smooth" });
    });

    // Sommaire RaYSun : même principe. Une ancre (#rs-…) déclencherait popstate
    // sans section, que le gestionnaire ci-dessous prend pour un retour à l'accueil.
    document.querySelectorAll(".rairsun-nav a").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            document.querySelector(link.getAttribute("href")).scrollIntoView({ behavior: "smooth" });
        });
    });

    // Flèche retour / avant du navigateur
    window.addEventListener("popstate", (e) => {
        stopAllMedia();
        if (e.state && e.state.section) showSection(e.state.section);
        else resetAll();
    });

    const isMobile = () => window.innerWidth <= 1024;

    // Coupe le son/lecture de toutes les vidéos et iframes (Instagram, YouTube, Vimeo, etc.)
    function stopAllMedia(root) {
        const scope = root || document;
        scope.querySelectorAll('video, audio').forEach(m => {
            try { m.pause(); m.currentTime = 0; } catch (e) {}
        });
        scope.querySelectorAll('iframe').forEach(f => {
            if (f.closest('.insta-grid')) return;
            const src = f.src;
            if (src) { f.src = ''; f.src = src; }
        });
    }

    // Lazy loading Instagram embeds + Facebook iframes
    let igScriptEl = null;
    const igCallbacks = [];

    function loadIgScript(cb) {
        if (window.instgrm) { cb(); return; }
        igCallbacks.push(cb);
        if (igScriptEl) return;
        igScriptEl = document.createElement('script');
        igScriptEl.src = 'https://www.instagram.com/embed.js';
        igScriptEl.async = true;
        igScriptEl.onload = () => {
            igCallbacks.forEach(fn => fn());
            igCallbacks.length = 0;
        };
        document.body.appendChild(igScriptEl);
    }

    function loadLazyEmbeds(gallery) {
        gallery.querySelectorAll('.insta-grid[data-lazy-posts]').forEach(grid => {
            const posts = grid.dataset.lazyPosts;
            if (!posts || grid.dataset.loaded) return;
            grid.dataset.loaded = '1';
            const postUrl = id => 'https://www.instagram.com/p/' + id + '/';
            posts.split(',').forEach(id => {
                const wrap = document.createElement('div');
                wrap.className = 'insta-lazy-wrap';

                const loader = document.createElement('div');
                loader.className = 'insta-loader';
                const dots = document.createElement('div');
                dots.className = 'insta-loader-dots';
                dots.innerHTML = '<span></span><span></span><span></span>';
                const link = document.createElement('a');
                link.href = postUrl(id);
                link.target = '_blank';
                link.rel = 'noopener';
                link.textContent = 'Voir sur Instagram ↗';
                loader.appendChild(dots);
                loader.appendChild(link);

                const bq = document.createElement('blockquote');
                bq.className = 'instagram-media';
                bq.dataset.instgrmPermalink = postUrl(id) + '?utm_source=ig_embed&utm_campaign=loading';
                bq.dataset.instgrmVersion = '14';
                // Légende du post, sauf si la galerie la refuse (data-no-caption : visuels seuls).
                if (!('noCaption' in grid.dataset)) bq.dataset.instgrmCaptioned = '';
                bq.style.cssText = 'background:#FFF;border:0;border-radius:3px;box-shadow:0 0 1px 0 rgba(0,0,0,.5),0 1px 10px 0 rgba(0,0,0,.15);margin:0;min-width:260px;padding:0;width:100%;';

                wrap.appendChild(loader);
                wrap.appendChild(bq);
                grid.appendChild(wrap);
            });
            loadIgScript(() => {
                if (window.instgrm) window.instgrm.Embeds.process(grid);
                const checkLoaded = setInterval(() => {
                    grid.querySelectorAll('.insta-lazy-wrap:not(.insta-loaded)').forEach(wrap => {
                        const ifr = wrap.querySelector('iframe');
                        if (ifr && ifr.offsetHeight > 50) {
                            wrap.classList.remove('insta-failed');
                            wrap.classList.add('insta-loaded');
                        }
                    });
                }, 500);
                // 10 s : bouton de secours, mais on continue d'écouter — certains posts arrivent après.
                setTimeout(() => {
                    grid.querySelectorAll('.insta-lazy-wrap:not(.insta-loaded)').forEach(wrap => {
                        wrap.classList.add('insta-failed');
                    });
                }, 10000);
                setTimeout(() => clearInterval(checkLoaded), 60000);
            });
        });

        gallery.querySelectorAll('[data-lazy-fb]').forEach(wrap => {
            if (wrap.dataset.loaded) return;
            wrap.dataset.loaded = '1';
            const iframe = document.createElement('iframe');
            iframe.src = wrap.dataset.lazyFb;
            iframe.width = '400';
            iframe.height = '710';
            iframe.style.cssText = 'border:none;overflow:hidden;max-width:100%;';
            iframe.scrolling = 'no';
            iframe.frameBorder = '0';
            iframe.allowFullscreen = true;
            iframe.allow = 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share';
            wrap.appendChild(iframe);
        });
    }

    // Navigation retour contextuelle (un niveau à la fois)
    function goBack() {
        if (container.classList.contains('show-gallery') || container.classList.contains('show-rairsun')) {
            stopAllMedia();
            projects.forEach(p => p.classList.remove('selected'));
            galleryGroups.forEach(g => g.classList.remove('active'));
            container.classList.remove('show-gallery', 'show-rairsun');
            if (!container.classList.contains('show-content')) {
                container.classList.add('show-content');
            }
            if (isMobile()) window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (container.classList.contains('show-content')) {
            container.classList.remove('show-content');
        }
    }

    // Boutons retour (mobile) — tous les .gallery-back + #btn-back-rairsun
    document.querySelectorAll('.gallery-back, #btn-back-rairsun').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            goBack();
        });
    });

    // Retour au sommaire RaYSun (2 lignes). Un cran moins profond que le menu
    // global : il ne quitte pas le panneau, il y remonte au sommaire.
    const rairsunBackBtn = document.getElementById('rairsun-back-btn');
    const rsSommaire = document.getElementById('rs-sommaire');
    const rsPanel = document.querySelector('.rairsun-panel');
    if (rairsunBackBtn && rsSommaire) {
        rairsunBackBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Le scroller change selon la mise en page : le panneau sur desktop
            // (height 100vh, overflow auto), la fenêtre sur mobile où le
            // conteneur passe en height auto. Ne pas choisir — les remonter tous
            // les deux. Celui qui ne défile pas est un no-op, alors qu'un mauvais
            // choix (transition de grille en cours, images pas encore chargées)
            // rendait le premier clic sans effet et en imposait un second.
            if (rsPanel) rsPanel.scrollTo({ top: 0, behavior: 'smooth' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        function updateRairsunBack() {
            const inPanel = container.classList.contains('show-rairsun');
            // Le sommaire est entièrement passé au-dessus : on est dans un projet.
            const scrolledPast = rsSommaire.getBoundingClientRect().bottom < 0;
            rairsunBackBtn.classList.toggle('visible', inPanel && scrolledPast);
        }

        if (rsPanel) rsPanel.addEventListener('scroll', updateRairsunBack, { passive: true });
        window.addEventListener('scroll', updateRairsunBack, { passive: true });
        document.addEventListener('click', () => setTimeout(updateRairsunBack, 450));
    }

    // Bouton menu global (desktop + mobile)
    const globalMenuBtn = document.getElementById('global-menu-btn');
    if (globalMenuBtn) {
        globalMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            goBack();
        });
    }

    // 2. CLIC SUR LES PROJETS (Ouvre la 3e colonne)
    projects.forEach(project => {
        project.addEventListener("click", (e) => {
            e.stopPropagation();

            const targetProject = project.getAttribute("data-project");
            const isRairSun = project.getAttribute("data-panel") === "rairsun";

            // Reclique sur le projet actif → ferme col3
            if (project.classList.contains("selected")) {
                project.classList.remove("selected");
                container.classList.remove("show-gallery");
                container.classList.remove("show-rairsun");
                setTimeout(() => { stopAllMedia(); galleryGroups.forEach(g => g.classList.remove("active")); }, 400);
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
                loadLazyEmbeds(activeGallery);
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
        if (e.target.closest('.global-menu-btn, .site-header')) return;
        // Sans ce garde, un clic sur le bouton retour RaYSun tomberait dans la
        // branche "ni images ni projet" plus bas et fermerait tout le panneau.
        if (e.target.closest('.rairsun-back-btn')) return;
        const clickedOnMiddle = e.target.closest('.right-col');
        const clickedOnLeft = e.target.closest('.left-col');
        const clickedOnImages = e.target.closest('.images-col');
        const clickedOnProject = e.target.closest('.project-item');

        if (container.classList.contains("show-rairsun")) {
            if (clickedOnMiddle && !clickedOnProject) {
                // Clic sur col2 (pas sur un projet) → col1 revient
                projects.forEach(p => p.classList.remove("selected"));
                container.classList.remove("show-rairsun");
                setTimeout(() => { stopAllMedia(); galleryGroups.forEach(g => g.classList.remove("active")); }, 400);
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
        // Retour à l'accueil par le logo ou un clic hors colonnes : nouvelle étape d'historique,
        // pour que la flèche retour ramène à la section quittée.
        if (history.state && history.state.section) history.pushState(null, "", location.pathname + location.search);
        projects.forEach(p => p.classList.remove("selected"));
        container.classList.remove("show-gallery");
        container.classList.remove("show-rairsun");
        container.classList.remove("show-content");
        setTimeout(() => galleryGroups.forEach(g => g.classList.remove("active")), 400);
        // Remonte aussi bien .left-col (desktop) que la fenêtre (mobile) : le scroller
        // actif dépend de la mise en page, l'autre appel est un no-op sans effet.
        const leftCol = document.querySelector(".left-col");
        if (leftCol) leftCol.scrollTo({ top: 0, behavior: "instant" });
        window.scrollTo({ top: 0, behavior: "instant" });
    }

    // Auto-pause vidéos/iframes quand elles sortent du viewport
    const mediaObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                const el = entry.target;
                if (el.tagName === 'VIDEO' || el.tagName === 'AUDIO') {
                    try { el.pause(); } catch (e) {}
                } else if (el.tagName === 'IFRAME' && !el.closest('.insta-grid')) {
                    const src = el.src;
                    if (src) { el.src = ''; el.src = src; }
                }
            }
        });
    }, { threshold: 0.1 });

    function observeMedia() {
        document.querySelectorAll('video, audio, iframe').forEach(el => {
            mediaObserver.observe(el);
        });
    }

    observeMedia();

    // Re-observer après chargement d'embeds Instagram
    const embedObserver = new MutationObserver(() => observeMedia());
    document.querySelectorAll('.insta-grid').forEach(grid => {
        embedObserver.observe(grid, { childList: true, subtree: true });
    });
});

// Électron : parcours de lecture en « Z », rejoué à chaque arrivée sur l'écran du sommaire.
// Haut gauche (sous les contacts) → haut droite → diagonale jusqu'à EXPERIENCES
// (pause) → bas droite, puis il s'éteint.
document.addEventListener("DOMContentLoaded", () => {
    const sommaire = document.getElementById("sommaire");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let playing = false;

    new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting || playing) return;
        playing = true;
        // Laisse le scroll-snap se poser avant de mesurer l'écran
        setTimeout(play, 400);
    }, { threshold: 0.9 }).observe(sommaire);

    function play() {
        const NS = "http://www.w3.org/2000/svg";
        const link = sommaire.querySelector("a");
        // Coordonnées relatives au bloc du sommaire : l'électron y est placé et défile avec lui.
        // Ordinateur : le bloc fait tout l'écran. Téléphone : le Z tient dans le bloc (~200 px).
        const r = sommaire.getBoundingClientRect();
        const e = link.getBoundingClientRect();
        const pad = parseFloat(getComputedStyle(sommaire).paddingLeft);
        const header = document.querySelector(".site-header").getBoundingClientRect().bottom - r.top;
        const top = Math.max(24, header + 24);
        const L = pad, R = r.width - pad, B = r.height - 20;
        const ex = e.left - r.left + e.width / 2, ey = e.top - r.top + e.height / 2;

        // Trajet A : le coin haut droit est arrondi, l'électron prend le virage sans s'arrêter.
        // Trajet B : courbe douce d'EXPERIENCES vers le bas droite.
        // Les tracés ne sont pas affichés : ils servent seulement à calculer la position.
        const k = Math.min(160, (R - L) / 4), dx = ex - R, dy = ey - top, d = Math.hypot(dx, dy);
        const paths = [
            `M${L},${top} L${R - k},${top} Q${R},${top} ${R + dx / d * k},${top + dy / d * k} L${ex},${ey}`,
            `M${ex},${ey} Q${(ex + R) / 2},${B} ${R},${B}`,
        ].map(def => {
            const p = document.createElementNS(NS, "path");
            p.setAttribute("d", def);
            return p;
        });
        const span = cls => Object.assign(document.createElement("span"), { className: cls });
        const dot = span("electron"), ring = span("electron-ring");
        dot.setAttribute("aria-hidden", "true");
        ring.setAttribute("aria-hidden", "true");
        sommaire.append(dot, ring);
        const lens = paths.map(p => p.getTotalLength());

        // Minutage (ms) : apparition, trajet A, clic, survol, trajet B, extinction
        const T = [300, 1700, 260, 520, 950, 380];
        const at = T.reduce((acc, x) => [...acc, acc[acc.length - 1] + x], [0]);
        const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const backOut = t => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);
        const clamp = t => Math.min(1, Math.max(0, t));

        let t0, prev, angle = 0, clicked = false;

        function frame(now) {
            t0 ??= now;
            const t = now - t0;
            let seg = 0, p = 0, s = 1, o = 1;
            if (t < at[1]) s = backOut(clamp(t / T[0]));
            else if (t < at[2]) p = ease((t - at[1]) / T[1]);
            else if (t < at[4]) { p = 1; s = 1 - 0.45 * Math.sin(Math.PI * clamp((t - at[2]) / T[2])); }
            else if (t < at[5]) { seg = 1; p = ease((t - at[4]) / T[4]); }
            else { seg = 1; p = 1; const u = clamp((t - at[5]) / T[5]); s = 1 - u * u; o = 1 - u; }

            // Clic : le bouton passe en survol et une onde part du point
            const onLink = t >= at[2] && t < at[4];
            link.classList.toggle("electron-hover", onLink);
            dot.classList.toggle("on-link", onLink);
            if (onLink && !clicked) {
                clicked = true;
                ring.animate([
                    { transform: `translate(${ex}px, ${ey}px) scale(0.4)`, opacity: 0.7 },
                    { transform: `translate(${ex}px, ${ey}px) scale(3.2)`, opacity: 0 },
                ], { duration: 700, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" });
            }

            // Vitesse → étirement du point dans le sens du mouvement
            const dist = p * lens[seg];
            const pt = paths[seg].getPointAtLength(dist);
            let speed = 0;
            if (prev) {
                const vx = pt.x - prev.x, vy = pt.y - prev.y;
                speed = Math.hypot(vx, vy) / Math.max(1, now - prev.now);
                if (speed > 0.05) angle = Math.atan2(vy, vx);
            }
            prev = { x: pt.x, y: pt.y, now };
            const st = Math.min(1.2, speed * 0.5);
            dot.style.opacity = o;
            dot.style.transform = `translate(${pt.x}px, ${pt.y}px) rotate(${angle}rad) scale(${s * (1 + st)}, ${s / (1 + st * 0.5)})`;

            if (t < at[6]) requestAnimationFrame(frame);
            else { dot.remove(); ring.remove(); link.classList.remove("electron-hover"); playing = false; }
        }
        requestAnimationFrame(frame);
    }
});
