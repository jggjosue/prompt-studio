// scene.js

class InsightLabScene {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x0a0a0f, 0.002);
        
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        this.particlesCount = 3000;
        this.particles = null;
        this.geometry = null;
        
        // Colors corresponding to CSS variables
        this.colorNeutral = new THREE.Color(0x9ba1b0);
        this.colorPositive = new THREE.Color(0x10b981);
        this.colorNegative = new THREE.Color(0xef4444);
        this.colorPrimary = new THREE.Color(0x7c3aed);
        
        this.init();
    }
    
    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);
        
        // Initial Camera Position
        this.camera.position.z = 150;
        
        this.createParticles();
        this.addLights();
        
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        this.animate();
    }
    
    createParticles() {
        this.geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particlesCount * 3);
        const colors = new Float32Array(this.particlesCount * 3);
        const sizes = new Float32Array(this.particlesCount);
        
        // Original chaotic positions
        this.originalPositions = new Float32Array(this.particlesCount * 3);
        // Target structured positions
        this.targetPositions = new Float32Array(this.particlesCount * 3);
        
        for (let i = 0; i < this.particlesCount; i++) {
            // Chaotic sphere
            const r = 200 * Math.cbrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);
            
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);
            
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            
            this.originalPositions[i * 3] = x;
            this.originalPositions[i * 3 + 1] = y;
            this.originalPositions[i * 3 + 2] = z;
            
            // Structured clusters (3 clusters)
            const clusterIndex = i % 3;
            const cx = (clusterIndex === 0) ? -80 : (clusterIndex === 1) ? 0 : 80;
            const cy = (clusterIndex === 0) ? -20 : (clusterIndex === 1) ? 30 : -20;
            
            const tr = 30 * Math.cbrt(Math.random());
            this.targetPositions[i * 3] = cx + tr * Math.sin(phi) * Math.cos(theta);
            this.targetPositions[i * 3 + 1] = cy + tr * Math.sin(phi) * Math.sin(theta);
            this.targetPositions[i * 3 + 2] = -50 + tr * Math.cos(phi);
            
            // Neutral color initially
            colors[i * 3] = this.colorNeutral.r;
            colors[i * 3 + 1] = this.colorNeutral.g;
            colors[i * 3 + 2] = this.colorNeutral.b;
            
            sizes[i] = Math.random() * 2;
        }
        
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });
        
        this.particles = new THREE.Points(this.geometry, material);
        this.scene.add(this.particles);
    }
    
    addLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0x7c3aed, 2, 300);
        pointLight.position.set(0, 0, 50);
        this.scene.add(pointLight);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Gentle rotation
        if (this.particles) {
            this.particles.rotation.y += 0.001;
            this.particles.rotation.x += 0.0005;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    // API for GSAP to control the scene
    updateStructure(progress) {
        // progress: 0 (chaotic) -> 1 (structured)
        const positions = this.geometry.attributes.position.array;
        
        for (let i = 0; i < this.particlesCount; i++) {
            const ix = i * 3;
            const iy = i * 3 + 1;
            const iz = i * 3 + 2;
            
            positions[ix] = THREE.MathUtils.lerp(this.originalPositions[ix], this.targetPositions[ix], progress);
            positions[iy] = THREE.MathUtils.lerp(this.originalPositions[iy], this.targetPositions[iy], progress);
            positions[iz] = THREE.MathUtils.lerp(this.originalPositions[iz], this.targetPositions[iz], progress);
        }
        
        this.geometry.attributes.position.needsUpdate = true;
    }
    
    updateColors(progress) {
        // progress: 0 (neutral) -> 1 (sentiment colors)
        const colors = this.geometry.attributes.color.array;
        
        for (let i = 0; i < this.particlesCount; i++) {
            const ix = i * 3;
            const clusterIndex = i % 3;
            
            let targetColor;
            if (clusterIndex === 0) targetColor = this.colorPositive; // Positive
            else if (clusterIndex === 1) targetColor = this.colorPrimary; // Neutral/Core
            else targetColor = this.colorNegative; // Negative
            
            colors[ix] = THREE.MathUtils.lerp(this.colorNeutral.r, targetColor.r, progress);
            colors[ix+1] = THREE.MathUtils.lerp(this.colorNeutral.g, targetColor.g, progress);
            colors[ix+2] = THREE.MathUtils.lerp(this.colorNeutral.b, targetColor.b, progress);
        }
        
        this.geometry.attributes.color.needsUpdate = true;
    }
    
    setCameraPosition(z, y) {
        this.camera.position.z = z;
        this.camera.position.y = y;
        this.camera.lookAt(0, 0, 0);
    }
}

// Initialize and export to window
window.sceneController = new InsightLabScene();
