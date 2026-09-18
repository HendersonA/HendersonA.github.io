document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        window.lucide.createIcons();
    }

    const navBar = document.querySelector('.nav-bar');
    if (navBar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) navBar.classList.add('scrolled');
            else navBar.classList.remove('scrolled');
        });
    }

    const revealElements = document.querySelectorAll('.glass, .project-card, .exp-item, .kicker, footer, .more-link');
    // Cascata: itens que entram juntos na viewport revelam um a um (90ms),
    // uma unica vez. O estado oculto ja vale no CSS via .js — aqui so revelamos.
    const revealOnScroll = new IntersectionObserver((entries, obs) => {
        entries.filter(e => e.isIntersecting).forEach((entry, i) => {
            const el = entry.target;
            obs.unobserve(el);
            setTimeout(() => el.classList.add('reveal-active'), i * 90);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    document.querySelectorAll('.project-card').forEach(card => {
        const video = card.querySelector('video');
        if (video) {
            card.addEventListener('mouseenter', () => video.play().catch(() => {}));
            card.addEventListener('mouseleave', () => { video.pause(); video.load(); });
        }
    });

    // Provador de paletas — preview local, nao eh identidade final
    const THEMES = ['hbytes', 'musgo', 'ember', 'original', 'salvia', 'joeb', 'custom'];
    let saved = null;
    try { saved = localStorage.getItem('hbytes-theme'); } catch (e) {}
    if (saved && THEMES.includes(saved)) {
        document.body.setAttribute('data-theme', saved);
    } else {
        document.body.setAttribute('data-theme', 'hbytes');
    }
    const buttons = document.querySelectorAll('.theme-btn');
    const syncActive = () => {
        const cur = document.body.getAttribute('data-theme');
        buttons.forEach(b => b.classList.toggle('active', b.dataset.theme === cur));
    };
    syncActive();
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.body.setAttribute('data-theme', btn.dataset.theme);
            document.body.style.removeProperty('--bg');
            document.body.style.removeProperty('--signal');
            document.body.style.removeProperty('--ink');
            try { localStorage.setItem('hbytes-theme', btn.dataset.theme); localStorage.removeItem('hbytes-custom'); } catch (e) {}
            syncActive();
            syncCustomInputs();
        });
    });

    // Cores livres: fundo, destaque e texto
    const cBg = document.querySelector('#cBg');
    const cSignal = document.querySelector('#cSignal');
    const cInk = document.querySelector('#cInk');
    const cReset = document.querySelector('#cReset');
    const toHex = (v) => {
        v = (v || '').trim();
        const m = v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!m) return v.length === 7 ? v : '#000000';
        const h = (n) => Number(n).toString(16).padStart(2, '0');
        return ('#' + h(m[1]) + h(m[2]) + h(m[3])).toUpperCase();
    };
    const syncCustomInputs = () => {
        if (!cBg) return;
        const cs = getComputedStyle(document.body);
        if (document.body.getAttribute('data-theme') !== 'custom') {
            cBg.value = toHex(cs.getPropertyValue('--bg'));
            cSignal.value = toHex(cs.getPropertyValue('--signal'));
            cInk.value = toHex(cs.getPropertyValue('--ink'));
        }
    };
    try {
        const custom = JSON.parse(localStorage.getItem('hbytes-custom') || 'null');
        if (custom && custom.bg && saved === 'custom') {
            document.body.style.setProperty('--bg', custom.bg);
            document.body.style.setProperty('--signal', custom.signal);
            document.body.style.setProperty('--ink', custom.ink);
            if (cBg) { cBg.value = custom.bg; cSignal.value = custom.signal; cInk.value = custom.ink; }
        } else {
            syncCustomInputs();
        }
    } catch (e) { syncCustomInputs(); }
    const onCustom = () => {
        if (!cBg) return;
        document.body.setAttribute('data-theme', 'custom');
        document.body.style.setProperty('--bg', cBg.value);
        document.body.style.setProperty('--signal', cSignal.value);
        document.body.style.setProperty('--ink', cInk.value);
        try {
            localStorage.setItem('hbytes-theme', 'custom');
            localStorage.setItem('hbytes-custom', JSON.stringify({ bg: cBg.value, signal: cSignal.value, ink: cInk.value }));
        } catch (e) {}
        syncActive();
    };
    if (cBg) {
        [cBg, cSignal, cInk].forEach(el => el.addEventListener('input', onCustom));
    }
    if (cReset) {
        cReset.addEventListener('click', () => {
            document.body.setAttribute('data-theme', 'hbytes');
            document.body.style.removeProperty('--bg');
            document.body.style.removeProperty('--signal');
            document.body.style.removeProperty('--ink');
            try { localStorage.setItem('hbytes-theme', 'hbytes'); localStorage.removeItem('hbytes-custom'); } catch (e) {}
            syncActive();
            syncCustomInputs();
        });
    }

    // Toggle numeros 01. 02.
    const numBtns = document.querySelectorAll('[data-nums]');
    let nums = null;
    try { nums = localStorage.getItem('hbytes-nums'); } catch (e) {}
    if (nums === 'off') document.body.classList.add('hide-numbers');
    const syncNums = () => {
        const off = document.body.classList.contains('hide-numbers');
        numBtns.forEach(b => b.classList.toggle('active', (b.dataset.nums === 'off') === off));
    };
    syncNums();
    numBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const off = btn.dataset.nums === 'off';
            document.body.classList.toggle('hide-numbers', off);
            try { localStorage.setItem('hbytes-nums', off ? 'off' : 'on'); } catch (e) {}
            syncNums();
        });
    });

    // Toggle skills: boxes vs lista Joeb
    if (!document.body.getAttribute('data-skills')) document.body.setAttribute('data-skills', 'boxes');
    let sSaved = null;
    try { sSaved = localStorage.getItem('hbytes-skills'); } catch (e) {}
    if (sSaved === 'list' || sSaved === 'boxes') document.body.setAttribute('data-skills', sSaved);
    const skillBtns = document.querySelectorAll('[data-skills-btn]');
    const syncSkills = () => {
        const cur = document.body.getAttribute('data-skills');
        skillBtns.forEach(b => b.classList.toggle('active', b.dataset.skillsBtn === cur));
    };
    syncSkills();
    skillBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.body.setAttribute('data-skills', btn.dataset.skillsBtn);
            try { localStorage.setItem('hbytes-skills', btn.dataset.skillsBtn); } catch (e) {}
            syncSkills();
        });
    });

    // Toggle layout: comfort vs brittany (nome em 1 linha, coluna direita)
    if (!document.body.getAttribute('data-layout')) document.body.setAttribute('data-layout', 'comfort');
    let lSaved = null;
    try { lSaved = localStorage.getItem('hbytes-layout'); } catch (e) {}
    if (lSaved === 'brittany' || lSaved === 'comfort') document.body.setAttribute('data-layout', lSaved);
    const layoutBtns = document.querySelectorAll('[data-layout-btn]');
    const syncLayout = () => {
        const cur = document.body.getAttribute('data-layout');
        layoutBtns.forEach(b => b.classList.toggle('active', b.dataset.layoutBtn === cur));
    };
    syncLayout();
    layoutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.body.setAttribute('data-layout', btn.dataset.layoutBtn);
            try { localStorage.setItem('hbytes-layout', btn.dataset.layoutBtn); } catch (e) {}
            syncLayout();
        });
    });

    // Toggle tamanho dos icones da sidebar
    if (!document.body.getAttribute('data-icons')) document.body.setAttribute('data-icons', 'md');
    let iSaved = null;
    try { iSaved = localStorage.getItem('hbytes-icons'); } catch (e) {}
    if (['sm', 'md', 'lg'].includes(iSaved)) document.body.setAttribute('data-icons', iSaved);
    const iconBtns = document.querySelectorAll('[data-icons-btn]');
    const syncIcons = () => {
        const cur = document.body.getAttribute('data-icons');
        iconBtns.forEach(b => b.classList.toggle('active', b.dataset.iconsBtn === cur));
    };
    syncIcons();
    iconBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.body.setAttribute('data-icons', btn.dataset.iconsBtn);
            try { localStorage.setItem('hbytes-icons', btn.dataset.iconsBtn); } catch (e) {}
            syncIcons();
        });
    });

    // Toggle estilo dos cards de projetos (5 estilos)
    const CARD_STYLES = ['padrao', 'linhas', 'minimal', 'overlay', 'editorial'];
    if (!document.body.getAttribute('data-cards')) document.body.setAttribute('data-cards', 'padrao');
    let cSaved = null;
    try { cSaved = localStorage.getItem('hbytes-cards'); } catch (e) {}
    if (CARD_STYLES.includes(cSaved)) document.body.setAttribute('data-cards', cSaved);
    const cardBtns = document.querySelectorAll('[data-cards-btn]');
    const syncCards = () => {
        const cur = document.body.getAttribute('data-cards');
        cardBtns.forEach(b => b.classList.toggle('active', b.dataset.cardsBtn === cur));
    };
    syncCards();
    cardBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.body.setAttribute('data-cards', btn.dataset.cardsBtn);
            try { localStorage.setItem('hbytes-cards', btn.dataset.cardsBtn); } catch (e) {}
            syncCards();
        });
    });

    // Dock retratil
    const dock = document.querySelector('.theme-dock');
    const dockToggle = document.querySelector('.dock-toggle');
    if (dockToggle && dock) {
        dockToggle.addEventListener('click', () => {
            dock.classList.toggle('collapsed');
            dockToggle.textContent = dock.classList.contains('collapsed') ? '◀' : '▶';
        });
    }

    // Toggle titulos das sessoes da direita (kickers)
    const headerBtns = document.querySelectorAll('[data-headers]');
    let hSaved = null;
    try { hSaved = localStorage.getItem('hbytes-headers'); } catch (e) {}
    if (hSaved === 'off') document.body.classList.add('hide-kickers');
    const syncHeaders = () => {
        const off = document.body.classList.contains('hide-kickers');
        headerBtns.forEach(b => b.classList.toggle('active', (b.dataset.headers === 'off') === off));
    };
    syncHeaders();
    headerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const off = btn.dataset.headers === 'off';
            document.body.classList.toggle('hide-kickers', off);
            try { localStorage.setItem('hbytes-headers', off ? 'off' : 'on'); } catch (e) {}
            syncHeaders();
        });
    });

    // Scrollspy: highlight do sumario conforme a sessao visivel
    const spyLinks = document.querySelectorAll('.side-nav a[href^="#"]');
    if (spyLinks.length) {
        const spyMap = {};
        spyLinks.forEach(a => { spyMap[a.getAttribute('href').slice(1)] = a; });
        const spyObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    spyLinks.forEach(a => a.classList.remove('active'));
                    const link = spyMap[entry.target.id];
                    if (link) link.classList.add('active');
                }
            });
        }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
        Object.keys(spyMap).forEach(id => {
            const sec = document.getElementById(id);
            if (sec) spyObs.observe(sec);
        });
    }

    // Efeito maquina de escrever: UMA vez por load + botao replay no dock.
    // Trava typed impede qualquer re-disparo (cliques, toggles, observers).
    const nameEl = document.querySelector('.sidebar h1');
    const nameTextNode = nameEl ? Array.from(nameEl.childNodes).find(n => n.nodeType === 3) : null;
    const fullName = nameTextNode ? nameTextNode.textContent : '';
    let typingTimer = null;
    let typed = false;
    const runTyping = (replay) => {
        if (!nameTextNode || !fullName || (typed && !replay)) return;
        if (!replay && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { typed = true; return; }
        typed = true;
        clearTimeout(typingTimer);
        nameTextNode.textContent = '';
        if (nameEl) nameEl.classList.add('typing');
        let i = 0;
        const step = () => {
            i++;
            nameTextNode.textContent = fullName.slice(0, i);
            if (i < fullName.length) {
                typingTimer = setTimeout(step, 65);
            } else if (nameEl) {
                nameEl.classList.remove('typing');
            }
        };
        typingTimer = setTimeout(step, replay ? 0 : 400);
    };
    document.querySelectorAll('[data-typing-replay]').forEach(btn => {
        btn.addEventListener('click', () => runTyping(true));
    });
    runTyping(false);

    // Painel de teste: alterna o vertical classico no mobile (imagem sobre o texto)
    const orientBtn = document.querySelector('#thumbToggle');
    const applyOrient = (stacked) => {
        document.body.classList.toggle('mobile-stack', stacked);
        if (orientBtn) {
            orientBtn.textContent = stacked ? 'ON' : 'OFF';
            orientBtn.classList.toggle('active', stacked);
        }
        try { localStorage.setItem('hbytes-mobilestack', stacked ? '1' : '0'); } catch (e) {}
    };
    let orientSaved = null;
    try { orientSaved = localStorage.getItem('hbytes-mobilestack'); } catch (e) {}
    if (orientBtn) {
        if (orientSaved === '1') applyOrient(true);
        orientBtn.addEventListener('click', () => {
            applyOrient(!document.body.classList.contains('mobile-stack'));
        });
    } else if (orientSaved === '1') {
        document.body.classList.add('mobile-stack');
    }
    // Posters responsivos: thumbnail_old no mobile (<=900px), padrao no desktop.
    // Troca so quando cruza o breakpoint ou no load, sem reprocessar video a toa.
    const THUMB_SWAP = [
        ['Kain_Kobra', 'assets/projects/Kain_Kobra/thumbnail.jpg', 'assets/projects/Kain_Kobra/thumbnail_old.png'],
        ['Elves_Clan', 'assets/projects/Elves_Clan/thumbnail.jpg', 'assets/projects/Elves_Clan/thumbnail_old.jpg'],
        ['My_Zombie_World', 'assets/projects/My_Zombie_World/thumbnail.jpg', 'assets/projects/My_Zombie_World/thumbnail_old.jpg'],
        ['Dungeon_Chess', 'assets/projects/Dungeon_Chess/thumbnail.png', 'assets/projects/Dungeon_Chess/thumbnail_old.png']
    ];
    const mqMobile = window.matchMedia('(max-width: 900px)');
    const applyThumbSwap = () => {
        const mobile = mqMobile.matches;
        document.querySelectorAll('.project-visual').forEach(box => {
            const media = box.querySelector('video, img');
            if (!media) return;
            const entry = THUMB_SWAP.find(([k]) => (media.getAttribute('poster') || media.getAttribute('src') || '').includes(k));
            if (!entry) return;
            const want = mobile ? entry[2] : entry[1];
            if (media.getAttribute('poster') !== want) {
                media.setAttribute('poster', want);
                if (media.tagName === 'VIDEO') media.load();
            }
        });
    };
    if (mqMobile.addEventListener) mqMobile.addEventListener('change', applyThumbSwap);
    else if (mqMobile.addListener) mqMobile.addListener(applyThumbSwap);
    applyThumbSwap();
    const cursorSlider = document.querySelector('#cCursor');
    const cursorOut = document.querySelector('#cCursorVal');
    const applyCursor = (v) => {
        const s = Number(v);
        document.documentElement.style.setProperty('--cursor-speed', s + 's');
        if (cursorOut) cursorOut.textContent = s.toFixed(1) + 's';
        try { localStorage.setItem('hbytes-cursor', String(s)); } catch (e) {}
    };
    let curSaved = null;
    try { curSaved = localStorage.getItem('hbytes-cursor'); } catch (e) {}
    if (cursorSlider) {
        if (curSaved !== null && !isNaN(Number(curSaved))) {
            cursorSlider.value = curSaved;
            applyCursor(curSaved);
        } else if (cursorOut) {
            cursorOut.textContent = Number(cursorSlider.value).toFixed(1) + 's';
        }
        cursorSlider.addEventListener('input', () => applyCursor(cursorSlider.value));
    } else if (curSaved !== null && !isNaN(Number(curSaved))) {
        document.documentElement.style.setProperty('--cursor-speed', Number(curSaved) + 's');
    }
    const FONTS = ['atual', 'brittany', 'joeb', 'pixel'];
    if (!document.body.getAttribute('data-font')) document.body.setAttribute('data-font', 'atual');
    let fSaved = null;
    try { fSaved = localStorage.getItem('hbytes-font'); } catch (e) {}
    if (FONTS.includes(fSaved)) document.body.setAttribute('data-font', fSaved);
    const fontBtns = document.querySelectorAll('[data-font-btn]');
    const syncFonts = () => {
        const cur = document.body.getAttribute('data-font');
        fontBtns.forEach(b => b.classList.toggle('active', b.dataset.fontBtn === cur));
    };
    syncFonts();
    fontBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.body.setAttribute('data-font', btn.dataset.fontBtn);
            try { localStorage.setItem('hbytes-font', btn.dataset.fontBtn); } catch (e) {}
            syncFonts();
        });
    });
});
