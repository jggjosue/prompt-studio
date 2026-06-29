// Initialize Three.js Scene
const initThreeJS = () => {
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050508, 0.002);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;
    camera.position.y = 20;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create Global Network Nodes
    const particleCount = 400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const colorPrimary = new THREE.Color(0x633cff);
    const colorSecondary = new THREE.Color(0x00e5ff);

    for (let i = 0; i < particleCount; i++) {
        const x = (Math.random() - 0.5) * 400;
        const y = (Math.random() - 0.5) * 200 - 50;
        const z = (Math.random() - 0.5) * 400;
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        const mixRatio = Math.random();
        const mixedColor = colorPrimary.clone().lerp(colorSecondary, mixRatio);
        
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom shader for glowing dots
    const material = new THREE.PointsMaterial({
        size: 1.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Connect nodes with lines (simulate data paths)
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.05,
        blending: THREE.AdditiveBlending
    });

    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = [];

    // Simple nearest neighbor connection
    for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
            const dx = positions[i * 3] - positions[j * 3];
            const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
            const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

            if (dist < 40) {
                linePositions.push(
                    positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
                    positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
                );
            }
        }
    }

    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // Add some floating data packets (spheres)
    const packetGroup = new THREE.Group();
    scene.add(packetGroup);

    for(let i=0; i<20; i++) {
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(1, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0x00e5ff })
        );
        mesh.position.set(
            (Math.random() - 0.5) * 300,
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 300
        );
        mesh.userData = {
            speed: Math.random() * 0.5 + 0.1,
            angle: Math.random() * Math.PI * 2
        };
        packetGroup.add(mesh);
    }

    // Animation Loop
    let time = 0;
    const animate = () => {
        requestAnimationFrame(animate);
        time += 0.002;

        particles.rotation.y = time * 0.5;
        lines.rotation.y = time * 0.5;
        packetGroup.rotation.y = time * 0.5;

        // Animate packets
        packetGroup.children.forEach(p => {
            p.position.y += Math.sin(time * 10 + p.userData.angle) * p.userData.speed;
        });

        renderer.render(scene, camera);
    };
    animate();

    // Window Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, particles, lines };
};

// Setup GSAP Scroll Animations
const setupScrollAnimations = (threeObjects) => {
    gsap.registerPlugin(ScrollTrigger);
    
    const { camera } = threeObjects;

    // Timeline for camera movement based on scroll
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "main",
            start: "top top",
            end: "bottom bottom",
            scrub: 1
        }
    });

    // Animate camera through the network
    tl.to(camera.position, {
        z: 20,
        y: 0,
        x: 50,
        ease: "none"
    }, 0)
    .to(camera.position, {
        z: -50,
        x: -30,
        ease: "none"
    }, 0.3)
    .to(camera.position, {
        z: -100,
        y: -20,
        ease: "none"
    }, 0.6)
    .to(camera.position, {
        z: -150,
        x: 0,
        ease: "none"
    }, 0.9);

    // Fade in sections
    gsap.utils.toArray('.glass-panel').forEach(panel => {
        gsap.fromTo(panel, 
            { opacity: 0, y: 50 },
            {
                opacity: 1, 
                y: 0,
                duration: 1,
                scrollTrigger: {
                    trigger: panel,
                    start: "top 80%",
                    end: "top 50%",
                    scrub: 0.5
                }
            }
        );
    });
};

// UI Interactions
const setupUIInteractions = () => {
    // 1. Chat Demo
    const chatInput = document.getElementById('demo-msg-input');
    const sendBtn = document.getElementById('demo-send-btn');
    const chatContainer = document.getElementById('demo-chat');

    const addMessage = (text, type) => {
        const msg = document.createElement('div');
        msg.className = `msg ${type}`;
        msg.textContent = text;
        chatContainer.appendChild(msg);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    };

    const handleSend = () => {
        const text = chatInput.value.trim();
        if (text) {
            addMessage(text, 'sent');
            chatInput.value = '';
            
            // Log to terminal
            logToTerminal(`POST /v1/Messages - To: +1... Body: "${text}"`, 'info');
            
            // Simulate auto-reply
            setTimeout(() => {
                logToTerminal(`201 Created - Message SID: SM${Math.random().toString(36).substr(2, 9)}`, 'success');
                setTimeout(() => {
                    addMessage('Reply via SignalBridge 🚀', 'received');
                    logToTerminal(`Webhook Received: message_status=delivered`, 'info');
                }, 1000);
            }, 500);
        }
    };

    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    // 2. OTP Demo
    const triggerOtpBtn = document.getElementById('trigger-otp-btn');
    const otpInputs = document.querySelectorAll('.otp-input');
    const otpStatus = document.getElementById('otp-status-msg');

    triggerOtpBtn.addEventListener('click', () => {
        triggerOtpBtn.disabled = true;
        triggerOtpBtn.textContent = 'Sending...';
        otpInputs.forEach(i => { i.value = ''; i.classList.remove('active'); });
        otpStatus.textContent = 'Verification initiated...';
        
        logToTerminal(`POST /v2/Services/VA.../Verifications - Channel: sms`, 'info');

        setTimeout(() => {
            triggerOtpBtn.textContent = 'Code Sent';
            otpStatus.textContent = 'Waiting for user input...';
            logToTerminal(`201 Created - Verification SID: VE${Math.random().toString(36).substr(2, 9)}`, 'success');
            
            // Simulate user receiving code and typing
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            let i = 0;
            const typeInterval = setInterval(() => {
                if (i < 6) {
                    otpInputs[i].value = code[i];
                    otpInputs[i].classList.add('active');
                    i++;
                } else {
                    clearInterval(typeInterval);
                    otpStatus.textContent = 'Verified successfully!';
                    otpStatus.classList.add('success');
                    logToTerminal(`POST /v2/Services/VA.../VerificationCheck - Code: ${code}`, 'info');
                    setTimeout(() => logToTerminal('200 OK - Status: approved', 'success'), 300);
                    
                    setTimeout(() => {
                        triggerOtpBtn.disabled = false;
                        triggerOtpBtn.textContent = 'Simulate Verification';
                        otpStatus.classList.remove('success');
                    }, 3000);
                }
            }, 200);

        }, 1000);
    });

    // 3. Terminal Logger
    const terminal = document.getElementById('api-logs');
    window.logToTerminal = (message, type) => {
        const div = document.createElement('div');
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        let typeSpan = '';
        if (type === 'info') typeSpan = '<span class="info">INFO</span>';
        if (type === 'success') typeSpan = '<span class="success">SUCCESS</span>';
        if (type === 'error') typeSpan = '<span style="color:#ff1744">ERROR</span>';

        div.innerHTML = `<span class="time">[${timeStr}]</span> ${typeSpan} ${message}`;
        terminal.appendChild(div);
        terminal.scrollTop = terminal.scrollHeight;
    };
    
    // Random background logs
    setInterval(() => {
        if(Math.random() > 0.7) {
            const msgs = [
                "GET /v1/Accounts - 200 OK",
                "Heartbeat check from Edge node US-East - 20ms",
                "Routing table updated",
                "Connecting to carrier network..."
            ];
            logToTerminal(msgs[Math.floor(Math.random() * msgs.length)], 'info');
        }
    }, 4000);
};

// Init
window.addEventListener('DOMContentLoaded', () => {
    const threeObjects = initThreeJS();
    setupScrollAnimations(threeObjects);
    setupUIInteractions();
});
