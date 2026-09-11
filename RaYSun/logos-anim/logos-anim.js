// Logos animés CityWatt / SamenWatt / WalloWatt : un bloc .wl dans la colonne de gauche,
// une copie dans le panneau RaYSun. Chaque bloc a ses flèches et sa marque affichée.
(() => {
    const roots = document.querySelectorAll('.wl');
    if (!roots.length) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Avancement de chaque section épinglée, de 0 à 1, transmis au CSS dans --p.
    const scrubs = document.querySelectorAll('.wl [data-scrub]');
    let ticking = false;
    function update() {
        ticking = false;
        for (const el of scrubs) {
            const r = el.getBoundingClientRect();
            const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
            el.style.setProperty('--p', p.toFixed(4));
        }
    }
    if (!reduce) {
        // En capture : sur desktop ce sont la colonne de gauche et le panneau RaYSun qui défilent, pas la fenêtre.
        document.addEventListener('scroll', () => {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { capture: true, passive: true });
        addEventListener('resize', update);
        update();
    }

    roots.forEach(root => {
        // Flèches affichées seulement quand le bloc passe au milieu de l'écran (là où elles sont).
        let inView = false;
        new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            root.classList.toggle('in-view', inView);
        }, { rootMargin: '-50% 0px -50% 0px' }).observe(root);

        // Les flèches font tourner les marques en boucle, dans l'ordre du HTML.
        const brands = [...root.querySelectorAll('.brand')];
        const [prevBtn, nextBtn] = root.querySelectorAll('.arrow');
        let current = 0;

        function show(i, dir) {
            // Pendant la construction, on reste à la même étape ; ailleurs, on repart du début du bloc.
            const build = brands[current].querySelector('.build').getBoundingClientRect();
            const inBuild = build.top <= 0 && build.bottom >= innerHeight;
            brands[current].hidden = true;
            current = (i + brands.length) % brands.length;
            const b = brands[current];
            b.hidden = false;
            if (!inBuild) root.scrollIntoView({ behavior: 'instant' });

            const name = k => brands[(k + brands.length) % brands.length].dataset.name;
            prevBtn.querySelector('span').textContent = name(current - 1);
            nextBtn.querySelector('span').textContent = name(current + 1);
            prevBtn.setAttribute('aria-label', 'Voir ' + name(current - 1));
            nextBtn.setAttribute('aria-label', 'Voir ' + name(current + 1));
            if (reduce) return;
            update();
            b.querySelector('.build-stage').animate(
                [{ opacity: 0, transform: `translateX(${dir * 48}px)` }, { opacity: 1, transform: 'none' }],
                { duration: 450, easing: 'cubic-bezier(.2, .8, .2, 1)' });
        }

        // Versions : une fois au bout de la bande horizontale, remonter ramène directement
        // à la typo au lieu de refaire défiler toutes les versions à l'envers.
        if (!reduce) {
            let lockUntil = 0, touchY = null;
            const stripAtEnd = () => {
                const r = brands[current].querySelector('.strip').getBoundingClientRect();
                return r.bottom <= innerHeight + 2 && r.bottom > innerHeight / 2;
            };
            const backToType = () => {
                brands[current].querySelector('.type').scrollIntoView({ behavior: 'instant' });
                lockUntil = Date.now() + 600; // absorbe l'inertie du trackpad après le saut
            };
            root.addEventListener('wheel', (e) => {
                if (Date.now() < lockUntil) { e.preventDefault(); return; }
                if (e.deltaY < 0 && stripAtEnd()) { e.preventDefault(); backToType(); }
            }, { passive: false });
            root.addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
            root.addEventListener('touchmove', (e) => {
                if (touchY !== null && e.touches[0].clientY - touchY > 40 && stripAtEnd()) {
                    e.preventDefault();
                    touchY = null;
                    backToType();
                }
            }, { passive: false });
        }

        prevBtn.addEventListener('click', (e) => { e.stopPropagation(); show(current - 1, -1); });
        nextBtn.addEventListener('click', (e) => { e.stopPropagation(); show(current + 1, 1); });
        addEventListener('keydown', (e) => {
            if (!inView || !root.offsetParent) return; // bloc masqué (autre écran ouvert)
            if (e.key === 'ArrowLeft') show(current - 1, -1);
            if (e.key === 'ArrowRight') show(current + 1, 1);
        });
        prevBtn.setAttribute('aria-label', 'Voir ' + brands.at(-1).dataset.name);
        nextBtn.setAttribute('aria-label', 'Voir ' + brands[1].dataset.name);
    });

    // Flèche ↓ de l'écran d'intro : descend aux logos sans ajouter d'ancre dans l'historique.
    const hint = document.querySelector('.wl-intro-hint');
    const leftRoot = document.querySelector('.left-col .wl');
    if (hint && leftRoot) hint.addEventListener('click', (e) => {
        e.preventDefault();
        leftRoot.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth' });
    });
})();
