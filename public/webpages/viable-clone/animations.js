// animations.js

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", (event) => {
    
    // Initial Hero Animation
    gsap.to(".hero-content", {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "power3.out",
        delay: 0.5
    });
    
    // Virtual timeline to control 3D scene progress based on total scroll
    ScrollTrigger.create({
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
            const progress = self.progress;
            
            // 0 -> 0.33: Camera moves into the cloud, particles start organizing
            if (progress <= 0.33) {
                const normalized = progress / 0.33;
                window.sceneController.setCameraPosition(150 - (normalized * 80), 0);
                window.sceneController.updateStructure(normalized * 0.5);
                window.sceneController.updateColors(0);
            }
            // 0.33 -> 0.66: Particles fully organize, colors change based on sentiment
            else if (progress > 0.33 && progress <= 0.66) {
                const normalized = (progress - 0.33) / 0.33;
                window.sceneController.setCameraPosition(70 - (normalized * 30), normalized * 20);
                window.sceneController.updateStructure(0.5 + (normalized * 0.5));
                window.sceneController.updateColors(normalized);
            }
            // 0.66 -> 1.0: Final camera push for the CTA
            else {
                const normalized = (progress - 0.66) / 0.34;
                window.sceneController.setCameraPosition(40 + (normalized * 60), 20 - (normalized * 20));
            }
        }
    });

    // UI Animations triggered when sections come into view
    
    // Section 2: Features
    gsap.to("#features .glass-card", {
        scrollTrigger: {
            trigger: "#features",
            start: "top center",
            end: "center center",
            scrub: 1
        },
        opacity: 1,
        x: 0
    });
    
    // Section 3: Dashboards
    gsap.to("#dashboards .glass-card", {
        scrollTrigger: {
            trigger: "#dashboards",
            start: "top center",
            end: "center center",
            scrub: 1
        },
        opacity: 1,
        x: 0
    });
    
    // Metrics counter animation
    const valueEl = document.querySelector('.dash-metric .value');
    if(valueEl) {
        ScrollTrigger.create({
            trigger: "#dashboards",
            start: "top center",
            once: true,
            onEnter: () => {
                let obj = { val: 0 };
                gsap.to(obj, {
                    val: 124592,
                    duration: 2,
                    ease: "power2.out",
                    onUpdate: () => {
                        valueEl.innerText = Math.floor(obj.val).toLocaleString();
                    }
                });
            }
        });
    }
});
