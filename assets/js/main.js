/**
 * THEA PORTFOLIO - CORE ENGINE
 * Handles Interactivity, Animations, and Gallery Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initCursor();
    initScrollEffects();
    initGallery();
    initLightbox();
});

// ─── 1. CUSTOM CURSOR ───
function initCursor() {
    const cursor = document.getElementById('cursor');
    if (!cursor) return;

    window.addEventListener('mousemove', e => {
        // Use requestAnimationFrame for smoother performance
        requestAnimationFrame(() => {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        });
    });

    // Elements that trigger cursor expansion
    const interactiveElements = 'a, button, .masonry-item, .filter-btn, .form-input, .form-textarea, .form-select';
    document.querySelectorAll(interactiveElements).forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('expand'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('expand'));
    });
}

// ─── 2. SCROLL EFFECTS & REVEALS ───
function initScrollEffects() {
    const nav = document.getElementById('nav');
    
    // Sticky Nav Logic
    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Intersection Observer for Reveal Animations
    const reveals = document.querySelectorAll('.reveal');
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Stop observing once visible to save resources
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealOptions);

    reveals.forEach(el => revealObserver.observe(el));
}

// ─── 3. GALLERY STAGGER & FILTERING ───
function initGallery() {
    const items = document.querySelectorAll('.masonry-item');
    
    // Initial Staggered Animation for the Gallery
    items.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            el.style.transition = 'opacity 0.8s cubic-bezier(0.2, 0, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0, 0.2, 1)';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 400 + (i * 80));
    });

    // Filter Button UI Toggle
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// ─── 4. LIGHTBOX SYSTEM ───
function initLightbox() {
    const lb = document.getElementById('lightbox');
    if (!lb) return;

    const lbCounter = document.getElementById('lbCounter');
    const masonryItems = document.querySelectorAll('.masonry-item');
    const prevBtn = document.getElementById('lb-prev');
    const nextBtn = document.getElementById('lb-next');
    const closeBtn = document.getElementById('lbClose');
    
    let currentIndex = 0;

    const updateLightbox = (index) => {
        currentIndex = index;
        if (lbCounter) {
            lbCounter.textContent = `${currentIndex + 1} / ${masonryItems.length}`;
        }
    };

    const openLightbox = (index) => {
        updateLightbox(index);
        lb.classList.add('open');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    };

    const closeLightbox = () => {
        lb.classList.remove('open');
        document.body.style.overflow = '';
    };

    // Event Listeners
    masonryItems.forEach((item, i) => {
        item.addEventListener('click', () => openLightbox(i));
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex - 1 + masonryItems.length) % masonryItems.length;
            updateLightbox(currentIndex);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex + 1) % masonryItems.length;
            updateLightbox(currentIndex);
        });
    }

    // Close on backdrop click
    lb.addEventListener('click', (e) => {
        if (e.target === lb) closeLightbox();
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (!lb.classList.contains('open')) return;
        
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft' && prevBtn) prevBtn.click();
        if (e.key === 'ArrowRight' && nextBtn) nextBtn.click();
    });
}