// main.js - DOM interactions and GSAP Animations

document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    initNavigation();
    initScrollAnimations();
});

function initNavigation() {
    const hamburger = document.querySelector('.hamburger-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');
    const links = document.querySelectorAll('.mobile-nav a');
    const header = document.querySelector('.glass-header');

    // Toggle Mobile Menu
    hamburger.addEventListener('click', () => {
        const isActive = overlay.classList.toggle('active');
        // Simple animation for hamburger bars
        const bars = hamburger.querySelectorAll('.bar');
        if (isActive) {
            bars[0].style.transform = 'translateY(8px) rotate(45deg)';
            bars[1].style.opacity = '0';
            bars[2].style.transform = 'translateY(-8px) rotate(-45deg)';
        } else {
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
        }
    });

    // Close menu on link click
    links.forEach(link => {
        link.addEventListener('click', () => {
            overlay.classList.remove('active');
            const bars = hamburger.querySelectorAll('.bar');
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
        });
    });

    // Header background on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(2, 6, 23, 0.8)';
            header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.5)';
        } else {
            header.style.background = 'rgba(15, 23, 42, 0.4)';
            header.style.boxShadow = 'none';
        }
    });
}

function initScrollAnimations() {
    // 1. HTML Parallax Effects
    
    // Hero Section Parallax
    gsap.to('.hero-title', {
        y: -100,
        opacity: 0,
        scrollTrigger: {
            trigger: '#home',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        }
    });

    gsap.to('.hero-subtitle, .hero-actions', {
        y: -50,
        opacity: 0,
        scrollTrigger: {
            trigger: '#home',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5
        }
    });

    // Fade-in Panels
    const panels = document.querySelectorAll('.panel:not(#home)');
    
    panels.forEach((panel) => {
        const content = panel.querySelector('.content-wrapper');
        
        gsap.set(content, { y: 80, opacity: 0 });

        gsap.to(content, {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: panel,
                start: 'top 75%',
                end: 'top 25%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // Bento Grid staggered animation
    const bentoItems = document.querySelectorAll('.bento-item');
    if (bentoItems.length > 0) {
        gsap.set(bentoItems, { y: 50, opacity: 0 });
        ScrollTrigger.create({
            trigger: '#stations',
            start: 'top 65%',
            onEnter: () => {
                gsap.to(bentoItems, {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: 'back.out(1.5)'
                });
            }
        });
    }

    // Schedule list items staggered animation
    const scheduleItems = document.querySelectorAll('.schedule-item');
    if (scheduleItems.length > 0) {
        gsap.set(scheduleItems, { x: -50, opacity: 0 });
        ScrollTrigger.create({
            trigger: '#schedule',
            start: 'top 70%',
            onEnter: () => {
                gsap.to(scheduleItems, {
                    x: 0,
                    opacity: 1,
                    duration: 0.7,
                    stagger: 0.15,
                    ease: 'power2.out'
                });
            }
        });
    }

    // 2. 3D Camera Path Animation (connected to scroll)
    setTimeout(() => {
        if (window.threeScene) {
            const camera = window.threeScene.getCamera();
            const targetZ = -150; // Deeper path for more sections
            
            gsap.to(camera.position, {
                z: targetZ,
                y: -10, // slight descent
                x: 10,  // slight horizontal drift
                ease: 'power1.inOut',
                scrollTrigger: {
                    trigger: '.scroll-container',
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 1.5
                }
            });

            gsap.to(camera.rotation, {
                z: 0.1, // tilt
                x: -0.1, // look slightly up
                y: -0.1,
                ease: 'power1.inOut',
                scrollTrigger: {
                    trigger: '.scroll-container',
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 2
                }
            });
        }
    }, 500);
}
