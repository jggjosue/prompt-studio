// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

// Sync Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Basic UI Animations
document.addEventListener("DOMContentLoaded", () => {
    // Hero entry animation
    const tl = gsap.timeline();
    tl.from(".main-header", { y: -50, opacity: 0, duration: 1, ease: "power3.out" })
      .from(".hero-title", { y: 50, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.5")
      .from(".hero-subtitle", { y: 30, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.7")
      .from(".search-bar", { y: 30, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.7");

    // Scroll Animations for Sections
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: "top 80%",
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });
    });

    gsap.utils.toArray('.category-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: ".category-grid",
                start: "top 80%",
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            delay: i * 0.1,
            ease: "power3.out"
        });
    });

    gsap.utils.toArray('.company-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: ".company-grid",
                start: "top 80%",
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            delay: i * 0.1,
            ease: "power3.out"
        });
    });
});
