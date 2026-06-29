document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            // Very simple toggle for now. In a full implementation, 
            // you'd add a class to slide in the menu.
            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'rgba(5, 5, 8, 0.95)';
                navLinks.style.padding = '2rem';
            }
        });
    }

    // GSAP DOM Animations (Parallax on text elements)
    gsap.registerPlugin(ScrollTrigger);

    // Parallax effect for specific elements
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    parallaxElements.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-parallax'));
        
        gsap.to(el, {
            y: () => (ScrollTrigger.maxScroll(window) * speed),
            ease: "none",
            scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            }
        });
    });

    // Fade in sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        const content = section.querySelector('.content-wrapper');
        if(content) {
            gsap.fromTo(content, 
                { opacity: 0, y: 50 },
                { 
                    opacity: 1, 
                    y: 0,
                    duration: 1,
                    scrollTrigger: {
                        trigger: section,
                        start: "top 75%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        }
    });
});
