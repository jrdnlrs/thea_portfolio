document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.getElementById('cursor');
    const nav = document.getElementById('nav');

    // ─── CURSOR ENGINE ───
    document.addEventListener('mousemove', e => {
        requestAnimationFrame(() => {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        });
    });

    document.querySelectorAll('a, button, .masonry-item').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('expand'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('expand'));
    });

    // ─── SCROLL REVEAL ENGINE ───
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // ─── NAV SCROLL ───
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 80);
    });
});