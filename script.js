import * as THREE from 'three';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let grammophoneModel;

// Corrected Loader and Scroll-based Section Reveals
// Use Intersection Observer for all sections to handle reveal animations
const sectionsToReveal = document.querySelectorAll('.reveal');

const sectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Optional: Stops observing after the first time
        }
    });
}, { threshold: 0.2 });

sectionsToReveal.forEach(section => {
    sectionObserver.observe(section);
});

// Remove redundant `aboutSection` scroll listener, as it's now handled by the observer
// Remove the `cube` and `featuresSection` scroll listener, as they refer to non-existent elements and were causing errors.

window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 1000); // Shorter, more natural transition time
    }
});

// This function initializes the Intersection Observer
function initializeScrollObserver() {
    // Select all elements with the class 'reveal'
    const revealElements = document.querySelectorAll('.reveal');

    // Create a new Intersection Observer instance
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // Check if the element is currently in the viewport
            if (entry.isIntersecting) {
                // If it is, add the 'visible' class to trigger the animation
                entry.target.classList.add('visible');
                
                // Stop observing the element once it has been revealed
                observer.unobserve(entry.target);
            }
        });
    }, {
        // Options for the observer
        // The root is the viewport by default (null)
        // rootMargin allows you to expand or shrink the viewport area
        // threshold defines the percentage of the target's visibility at which the observer's callback should be executed.
        // A value of 0.1 means the callback fires when 10% of the element is visible.
        threshold: 0.1
    });

    // Loop through all the 'reveal' elements and observe them
    revealElements.forEach(element => {
        observer.observe(element);
    });
}

// Run the initialization function once the window has loaded
window.onload = initializeScrollObserver;



//--- THREE.js Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);
scene.fog = new THREE.Fog(0x1a001a, 10, 50);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 8);

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#webgl'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Lighting
const ambientLight = new THREE.AmbientLight(0xff0088, 0.1);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xff0000, 2);
spotLight.position.set(5, 10, 5);
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.5;
spotLight.decay = 2;
spotLight.distance = 50;
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.bias = -0.0005;
scene.add(spotLight);
const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
rimLight.position.set(-5, 5, -5);
scene.add(rimLight);

const gridHelper = new THREE.GridHelper(100, 100, 0xff0044, 0xff0044);
gridHelper.position.y = -1;
gridHelper.material.opacity = 0.4;
gridHelper.material.transparent = true;
scene.add(gridHelper);

// Load Grammophone model
const gltfLoader = new GLTFLoader(); // Renamed to avoid conflict
gltfLoader.load('./models/scene.gltf', (gltf) => {
    grammophoneModel = gltf.scene;
    grammophoneModel.scale.set(5, 5, 5);
    grammophoneModel.position.set(0, -1, 0);
    grammophoneModel.traverse((child) => {
        if (child.isMesh) {
            child.material.color.setHex(0xff0000);
        }
    });
    scene.add(grammophoneModel);
});


// Mouse Parallax & Custom Cursor
const cursor = document.getElementById('cursor');

document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;

    if (grammophoneModel) {
        grammophoneModel.rotation.x = y * 0.5;
        grammophoneModel.rotation.y = x * 0.5;
    }

    if (cursor) {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    }
});

// Click to change color
document.addEventListener('click', () => {
    const colors = [0xff0000, 0xffffff, 0xff5555, 0xffaaaa];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    if (grammophoneModel) {
        grammophoneModel.traverse((child) => {
            if (child.isMesh) {
                child.material.color.setHex(randomColor);
            }
        });
    }
});

// Custom cursor hover states
const hoverTargets = document.querySelectorAll('a, button, .floating-text, .feature-card');
hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
        if (cursor) cursor.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
        if (cursor) cursor.classList.remove('cursor-hover');
    });
});

// Scroll-triggered camera move
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    camera.position.z = 8 - scrollY * 0.005;
    camera.position.y = 1 + scrollY * 0.002;
});

// Overlay visibility on scroll
const overlay = document.getElementById('overlay');
window.addEventListener('scroll', () => {
    if (overlay) {
        if (window.scrollY > 100) {
            overlay.classList.add('hidden');
        } else {
            overlay.classList.remove('hidden');
        }
    }
});


// Pricing Card Interactions
document.querySelector('.starter-card').addEventListener('click', function () {
    this.classList.toggle('expanded');
});
document.querySelector('.premium-card').addEventListener('click', function () {
    this.classList.toggle('expanded');
});


// --- Animation and Responsiveness ---
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    gridHelper.rotation.z = Math.sin(Date.now() * 0.0005) * 0.01;
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});