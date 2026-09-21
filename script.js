/* ==========================================================================
   Phung Nguyen - Portfolio Main JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Three.js 3D Background Interactive Financial Particles & Cubes
    initThreeBackground();

    // Interactive Profile Picture Tilt (3D parallax + glare on hover/move)
    initProfileTilt();
});

/* ==========================================================================
   Three.js 3D Background Animation
   ========================================================================== */
function initThreeBackground() {
    const container = document.getElementById('canvas-container');
    if (!container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create floating financial data cubes and ledger nodes
    const geometries = [
        new THREE.BoxGeometry(1.2, 1.2, 1.2),
        new THREE.OctahedronGeometry(1),
        new THREE.TetrahedronGeometry(1)
    ];

    const material = new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        wireframe: true,
        roughness: 0.3,
        metalness: 0.8
    });

    const meshGroup = new THREE.Group();
    const meshCount = 22;
    const meshes = [];

    for (let i = 0; i < meshCount; i++) {
        const geom = geometries[Math.floor(Math.random() * geometries.length)];
        const mesh = new THREE.Mesh(geom, material);

        mesh.position.set(
            (Math.random() - 0.5) * 35,
            (Math.random() - 0.5) * 35,
            (Math.random() - 0.5) * 25
        );

        mesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            0
        );

        mesh.userData = {
            rotSpeedX: (Math.random() - 0.5) * 0.01,
            rotSpeedY: (Math.random() - 0.5) * 0.01,
            floatSpeed: Math.random() * 0.02 + 0.01,
            initialY: mesh.position.y
        };

        meshGroup.add(mesh);
        meshes.push(mesh);
    }
    scene.add(meshGroup);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x0ea5e9, 3, 50);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    camera.position.z = 18;

    // Mouse interaction for parallax tilt
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
        mouseY = (event.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    });

    // Animation loop
    let clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        targetX = mouseX * 0.5;
        targetY = mouseY * 0.5;

        meshGroup.rotation.y += 0.001 + (targetX - meshGroup.rotation.y) * 0.05;
        meshGroup.rotation.x += 0.001 + (targetY - meshGroup.rotation.x) * 0.05;

        meshes.forEach((mesh, index) => {
            mesh.rotation.x += mesh.userData.rotSpeedX;
            mesh.rotation.y += mesh.userData.rotSpeedY;
            mesh.position.y = mesh.userData.initialY + Math.sin(elapsedTime + index) * 0.8;
        });

        renderer.render(scene, camera);
    }
    animate();

    // Handle Window Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

/* ==========================================================================
   Interactive Profile Picture Tilt (3D Parallax + Dynamic Glare)
   ========================================================================== */
function initProfileTilt() {
    const wrap = document.getElementById('profile-tilt-wrap');
    const card = document.getElementById('profile-tilt-card');
    const glare = document.getElementById('profile-glare');
    if (!wrap || !card) return;

    const maxTilt = 10; // degrees

    function handleMove(clientX, clientY) {
        const rect = wrap.getBoundingClientRect();
        const px = (clientX - rect.left) / rect.width;  // 0 to 1
        const py = (clientY - rect.top) / rect.height;  // 0 to 1

        const rotateY = (px - 0.5) * (maxTilt * 2);
        const rotateX = (0.5 - py) * (maxTilt * 2);

        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        if (glare) {
            glare.style.setProperty('--gx', `${px * 100}%`);
            glare.style.setProperty('--gy', `${py * 100}%`);
        }
    }

    function resetTilt() {
        card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    }

    wrap.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
    wrap.addEventListener('mouseleave', resetTilt);

    // Touch support
    wrap.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
            handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });
    wrap.addEventListener('touchend', resetTilt);
}

/* ==========================================================================
   Project Filter Functionality
   ========================================================================== */
function filterProjects(category) {
    const cards = document.querySelectorAll('.project-card');
    const btnAll = document.getElementById('btn-all');
    const btnCycle = document.getElementById('btn-cycle');
    const btnAnalysis = document.getElementById('btn-analysis');

    // Reset tab styles
    [btnAll, btnCycle, btnAnalysis].forEach(btn => {
        if (btn) {
            btn.className = "px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all text-navy-800 hover:text-glacier-600";
        }
    });

    if (category === 'all') {
        if (btnAll) btnAll.className = "px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all bg-navy-900 text-white shadow-md";
        cards.forEach(card => card.style.display = 'flex');
    } else if (category === 'cycle') {
        if (btnCycle) btnCycle.className = "px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all bg-navy-900 text-white shadow-md";
        cards.forEach(card => {
            if (card.getAttribute('data-category') === 'cycle') {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    } else if (category === 'analysis') {
        if (btnAnalysis) btnAnalysis.className = "px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all bg-navy-900 text-white shadow-md";
        cards.forEach(card => {
            if (card.getAttribute('data-category') === 'analysis') {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

/* ==========================================================================
   Project Details Modal
   ========================================================================== */
function openProjectModal(title, description, category, framework) {
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalCategory = document.getElementById('modal-category');
    const modalFramework = document.getElementById('modal-framework');
    const modal = document.getElementById('project-modal');

    if (modalTitle) modalTitle.innerText = title;
    if (modalDesc) modalDesc.innerText = description;
    if (modalCategory) modalCategory.innerText = category;
    if (modalFramework) modalFramework.innerText = framework;
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
}

/* ==========================================================================
   Resume Download Simulation
   ========================================================================== */
function downloadResume() {
    showToast('Resume Downloaded', 'Ngan_Phung_Nguyen_Resume.pdf has been downloaded successfully.');
}

/* ==========================================================================
   Contact Form Submission Handler
   ========================================================================== */
function handleFormSubmit(event) {
    event.preventDefault();
    const nameInput = document.getElementById('form-name');
    const name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Guest';
    showToast('Message Sent!', `Thank you ${name}! Your inquiry has been transmitted to Phung Nguyen.`);
    const form = document.getElementById('contact-form');
    if (form) form.reset();
}

/* ==========================================================================
   Toast Notification System
   ========================================================================== */
let toastTimeout;
function showToast(title, message) {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toast-title');
    const toastMessage = document.getElementById('toast-message');

    if (!toast) return;

    if (toastTitle) toastTitle.innerText = title;
    if (toastMessage) toastMessage.innerText = message;

    clearTimeout(toastTimeout);
    toast.classList.remove('hidden', 'translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    toastTimeout = setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-20', 'opacity-0');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, 4000);
}

// Attach globally for inline HTML events
window.filterProjects = filterProjects;
window.openProjectModal = openProjectModal;
window.closeProjectModal = closeProjectModal;
window.downloadResume = downloadResume;
window.handleFormSubmit = handleFormSubmit;
window.showToast = showToast;
