
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
                bq.style.cssText = 'background:#FFF;border:0;border-radius:3px;box-shadow:0 0 1px 0 rgba(0,0,0,.5),0 1px 10px 0 rgba(0,0,0,.15);margin:0;min-width:260px;padding:0;width:100%;';

                wrap.appendChild(loader);
                wrap.appendChild(bq);
                grid.appendChild(wrap);
            });
            loadIgScript(() => {
                if (window.instgrm) window.instgrm.Embeds.process(grid);
                const checkLoaded = setInterval(() => {
                    grid.querySelectorAll('.insta-lazy-wrap:not(.insta-loaded):not(.insta-failed)').forEach(wrap => {
                        if (wrap.querySelector('iframe')) wrap.classList.add('insta-loaded');
                    });
                }, 500);
                setTimeout(() => {
                    clearInterval(checkLoaded);
                    grid.querySelectorAll('.insta-lazy-wrap:not(.insta-loaded)').forEach(wrap => {
                        wrap.classList.add('insta-failed');
                    });
                }, 10000);
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
        if (e.target.closest('.global-menu-btn')) return;
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
        projects.forEach(p => p.classList.remove("selected"));
        container.classList.remove("show-gallery");
        container.classList.remove("show-rairsun");
        container.classList.remove("show-content");
        setTimeout(() => galleryGroups.forEach(g => g.classList.remove("active")), 400);
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

    // Scroll-driven solar viz
    const solarStory = document.querySelector('.rairsun-solar-story');
    if (solarStory) {
        const solarIframe = solarStory.querySelector('iframe');
        const steps = solarStory.querySelectorAll('.solar-step[data-phase]');
        const panel = solarStory.closest('.rairsun-panel');
        const solarTitle = solarStory.querySelector('.solar-overlay-title');
        const solarSource = solarStory.querySelector('.solar-overlay-source');
        let solarAutoTransitioned = false;

        function updateSolarScroll() {
            if (!solarIframe.contentWindow) return;
            const storyRect = solarStory.getBoundingClientRect();

            if (storyRect.bottom < 0 || storyRect.top > window.innerHeight) {
                solarIframe.contentWindow.postMessage('solar-pause', '*');
                return;
            }
            solarIframe.contentWindow.postMessage('solar-resume', '*');

            let bestPhase = 0;
            let bestT = 0;

            steps.forEach(step => {
                const phase = parseInt(step.dataset.phase);
                if (isNaN(phase)) return;
                const rect = step.getBoundingClientRect();
                const viewH = window.innerHeight;
                const t = Math.max(0, Math.min(1, (viewH - rect.top) / (viewH + rect.height)));

                if (t >= 1 && phase > bestPhase) {
                    bestPhase = phase;
                    bestT = 1;
                } else if (t > 0 && t < 1 && phase > bestPhase) {
                    bestPhase = phase;
                    bestT = t;
                }
            });

            if (bestPhase === 0) bestPhase = 1;

            // Brugel source visible from phase 5, stays through the tilt (phase 6)
            if (solarTitle) {
                solarTitle.classList.toggle('visible', bestPhase === 1);
                if (bestPhase === 1) {
                    const startTop = window.innerHeight - 80 - 40;
                    const endTop = 24;
                    const p = Math.min(bestT / 0.4, 1);
                    solarTitle.style.top = (startTop + (endTop - startTop) * p) + 'px';
                    solarTitle.style.bottom = 'auto';
                }
            }
            if (solarSource) {
                solarSource.classList.toggle('visible', bestPhase === 5 || bestPhase === 6);
            }

            solarIframe.contentWindow.postMessage({
                mode: 'scroll', phase: bestPhase, t: bestT
            }, '*');

            // Auto-transition to next project after tilt completes
            if (bestPhase === 6 && bestT >= 0.95 && !solarAutoTransitioned) {
                solarAutoTransitioned = true;
                const nextSection = document.getElementById('rs-linkedin');
                if (nextSection && panel) {
                    setTimeout(() => {
                        nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 600);
                }
            }
            if (bestPhase < 6) solarAutoTransitioned = false;
        }

        if (panel) {
            panel.addEventListener('scroll', updateSolarScroll, { passive: true });
        }
        window.addEventListener('scroll', updateSolarScroll, { passive: true });

        // Fire once after iframe loads
        solarIframe.addEventListener('load', () => {
            setTimeout(updateSolarScroll, 100);
        });
    }
});
