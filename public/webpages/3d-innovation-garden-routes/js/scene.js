// scene.js - Three.js 3D Background Setup
let scene, camera, renderer, particles, routeLines, nodes, trees;

// Config colors matching CSS Tech Organic theme
const colors = {
    bg: 0x020617,
    primary: 0x10B981,
    secondary: 0x0EA5E9,
    accent: 0xF59E0B
};

function init3D() {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(colors.bg);
    scene.fog = new THREE.FogExp2(colors.bg, 0.003);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 20);
    // Add initial rotation to look down the "path"
    camera.rotation.x = -0.15;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Add elements
    createParticles();
    createRoute();
    createNodes();
    createDataTrees();
    addLighting();

    // Event listeners
    window.addEventListener('resize', onWindowResize);

    // Start loop
    animate();
}

function createParticles() {
    const particleCount = 3000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colorsArr = new Float32Array(particleCount * 3);
    
    const colorPrimary = new THREE.Color(colors.primary);
    const colorSecondary = new THREE.Color(colors.secondary);
    const colorAccent = new THREE.Color(colors.accent);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 120;     // x
        positions[i + 1] = (Math.random() - 0.5) * 50 - 10; // y
        positions[i + 2] = (Math.random() - 0.5) * 300; // z (depth)

        const rand = Math.random();
        let mixedColor;
        if (rand > 0.6) mixedColor = colorPrimary;
        else if (rand > 0.3) mixedColor = colorSecondary;
        else mixedColor = colorAccent;
        
        colorsArr[i] = mixedColor.r;
        colorsArr[i + 1] = mixedColor.g;
        colorsArr[i + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colorsArr, 3));

    const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function createRoute() {
    const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -2, 20),
        new THREE.Vector3(3, -2, 0),
        new THREE.Vector3(-4, -2, -30),
        new THREE.Vector3(6, -2, -70),
        new THREE.Vector3(0, -2, -110),
        new THREE.Vector3(-5, -2, -150),
        new THREE.Vector3(2, -2, -190)
    ]);

    const points = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    const material = new THREE.LineBasicMaterial({ 
        color: colors.primary,
        linewidth: 3,
        transparent: true,
        opacity: 0.7
    });

    routeLines = new THREE.Line(geometry, material);
    scene.add(routeLines);

    // Add glowing trail
    const tubeGeometry = new THREE.TubeGeometry(curve, 100, 0.4, 8, false);
    const tubeMaterial = new THREE.MeshBasicMaterial({ 
        color: colors.primary, 
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });
    const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
    scene.add(tubeMesh);
}

function createNodes() {
    nodes = new THREE.Group();
    
    const geometries = [
        new THREE.IcosahedronGeometry(1.5, 0),
        new THREE.OctahedronGeometry(2, 0),
        new THREE.TetrahedronGeometry(1.8, 0)
    ];

    const material = new THREE.MeshPhysicalMaterial({
        color: colors.secondary,
        metalness: 0.8,
        roughness: 0.2,
        transparent: true,
        opacity: 0.7,
        wireframe: true
    });

    const nodePositions = [
        { x: 4, y: 0, z: -15 },
        { x: -7, y: 2, z: -45 },
        { x: 5, y: -1, z: -85 },
        { x: -4, y: 3, z: -125 },
        { x: 6, y: 0, z: -160 }
    ];

    nodePositions.forEach((pos, index) => {
        const geo = geometries[index % geometries.length];
        const mesh = new THREE.Mesh(geo, material);
        mesh.position.set(pos.x, pos.y, pos.z);
        
        const light = new THREE.PointLight(colors.secondary, 2, 25);
        mesh.add(light);
        
        nodes.add(mesh);
    });

    scene.add(nodes);
}

function createDataTrees() {
    trees = new THREE.Group();
    
    const treePositions = [
        { x: -8, y: -5, z: -25 },
        { x: 9, y: -5, z: -55 },
        { x: -10, y: -5, z: -95 },
        { x: 8, y: -5, z: -135 }
    ];

    treePositions.forEach(pos => {
        // Simple abstract tree (cylinder trunk + icosahedron top)
        const trunkGeo = new THREE.CylinderGeometry(0.2, 0.4, 5, 5);
        const trunkMat = new THREE.MeshBasicMaterial({ color: colors.accent, wireframe: true, transparent: true, opacity: 0.3 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.set(pos.x, pos.y + 2.5, pos.z);

        const crownGeo = new THREE.IcosahedronGeometry(2.5, 1);
        const crownMat = new THREE.MeshBasicMaterial({ color: colors.primary, wireframe: true, transparent: true, opacity: 0.2 });
        const crown = new THREE.Mesh(crownGeo, crownMat);
        crown.position.set(pos.x, pos.y + 6, pos.z);

        trees.add(trunk);
        trees.add(crown);
    });

    scene.add(trees);
}

function addLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(colors.primary, 1.5);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

let clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    if (particles) {
        particles.rotation.y = time * 0.015;
    }

    if (nodes) {
        nodes.children.forEach((node, i) => {
            node.rotation.x += 0.005;
            node.rotation.y += 0.01;
            node.position.y += Math.sin(time * 2 + i) * 0.005;
        });
    }

    if (trees) {
        trees.children.forEach((mesh, i) => {
            if (i % 2 !== 0) { // Rotate crowns
                mesh.rotation.y += 0.002;
            }
        });
    }

    renderer.render(scene, camera);
}

window.threeScene = {
    init: init3D,
    getCamera: () => camera,
    getScene: () => scene
};

document.addEventListener('DOMContentLoaded', init3D);
