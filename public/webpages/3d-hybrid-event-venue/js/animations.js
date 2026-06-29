// animations.js - GSAP and ScrollTrigger animations

document.addEventListener('DOMContentLoaded', () => {
    // Wait for Three.js camera to be available (slight delay to ensure init3D ran)
    setTimeout(initAnimations, 100);
});

function initAnimations() {
    // Register GSAP Plugin
    gsap.registerPlugin(ScrollTrigger);

    const camera = window.app3D.camera;
    
    if (!camera) {
        console.error("Three.js camera not found, skipping 3D animations");
        return;
    }

    // 1. 3D Camera Scroll Animation Path
    // We create a timeline tied to the whole page scroll
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1, // Smooth scrubbing
        }
    });

    // Move camera forward and down through the sections
    // Venue Section
    tl.to(camera.position, {
        z: 0,
        y: 3,
        ease: "power1.inOut"
    }, 0);
    
    // Stage Section (moving closer to the abstract stage we built)
    tl.to(camera.position, {
        z: -20,
        y: 2,
        ease: "power1.inOut"
    }, 0.25);
    
    // Streaming Section (pan slightly)
    tl.to(camera.position, {
        x: 10,
        z: -25,
        ease: "power1.inOut"
    }, 0.5);
    
    // Agenda/Tickets (pull back and up for overview)
    tl.to(camera.position, {
        x: 0,
        y: 15,
        z: -10,
        ease: "power1.inOut"
    }, 0.75);
    
    // Camera rotation adjustments along the path
    tl.to(camera.rotation, {
        x: -0.2,
        ease: "power1.inOut"
    }, 0.25);
    
    tl.to(camera.rotation, {
        y: 0.2,
        ease: "power1.inOut"
    }, 0.5);
    
    tl.to(camera.rotation, {
        x: -0.5,
        y: 0,
        ease: "power1.inOut"
    }, 0.75);


    // 2. HTML Elements Parallax Effects
    // Select elements with data-speed attribute
    const parallaxElements = document.querySelectorAll('[data-speed]');
    
    parallaxElements.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-speed')) || 0.5;
        
        gsap.to(el, {
            y: (i, target) => -ScrollTrigger.maxScroll(window) * speed * 0.1, // Move up relative to scroll
            ease: "none",
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                scrub: 0, // Direct link to scrollbar
                invalidateOnRefresh: true
            }
        });
    });

    // 3. Fade-in animations for section content
    const sections = document.querySelectorAll('.panel');
    
    sections.forEach(section => {
        const content = section.querySelector('.section-content');
        if (content) {
            gsap.fromTo(content, 
                { opacity: 0, y: 50 },
                {
                    opacity: 1, 
                    y: 0,
                    duration: 1,
                    scrollTrigger: {
                        trigger: section,
                        start: "top 70%", // Trigger when section is 70% from top
                        toggleActions: "play none none reverse" // Play forward, reverse on scroll up
                    }
                }
            );
        }
    });
}
