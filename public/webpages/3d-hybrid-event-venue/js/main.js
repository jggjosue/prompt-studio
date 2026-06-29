// main.js - UI and general interactions

document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-links a, .btn-outline');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Mobile menu toggle (basic implementation)
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinksContainer = document.querySelector('.nav-links');
    
    if (mobileBtn && navLinksContainer) {
        mobileBtn.addEventListener('click', () => {
            // For a complete implementation, we'd toggle a class to show/hide the menu
            // and animate the hamburger icon. Keeping it simple for now.
            alert('Mobile menu toggled');
        });
    }

    // Header scroll effect
    const header = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(10, 10, 15, 0.9)';
            header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.5)';
        } else {
            header.style.background = 'rgba(10, 10, 15, 0.6)';
            header.style.boxShadow = 'none';
        }
    });
});
