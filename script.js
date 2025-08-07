let grammophoneModel;


window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  loader.style.opacity = '0';
  setTimeout(() => {
  loader.style.opacity = '0';
}, 2000);

setTimeout(() => {
  loader.style.display = 'none';
}, 3000);
});


import * as THREE from 'three';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';




const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 8);

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#webgl'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);

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
spotLight.shadow.bias = -0.0005;const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
rimLight.position.set(-5, 5, -5);
scene.add(rimLight);

scene.add(spotLight);

// Load Grammophone model
const loader = new GLTFLoader();
loader.load('/models/scene.gltf', (gltf) => {
  scene.add(gltf.scene);
  grammophoneModel = gltf.scene;
  grammophoneModel.scale.set(5, 5, 5);
  grammophoneModel.position.set(0, -1, 0);
  grammophoneModel.castShadow = true;
  scene.add(grammophoneModel);

  grammophoneModel.traverse((child) => {
    if (child.isMesh) {
      child.material.color.setHex(0xff0000); // Optional: Minecraft red
    }
  });
});





// Mouse parallax
document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth) * 2 - 1;
  const y = -(e.clientY / window.innerHeight) * 2 + 1;
 if (grammophoneModel) {
  grammophoneModel.rotation.x = y * 0.5;
  grammophoneModel.rotation.y = x * 0.5;
}


  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;
});

// Tap to change color
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

// Custom cursor hover
const cursor = document.getElementById('cursor');
const hoverTargets = document.querySelectorAll('a, button, .floating-text');
hoverTargets.forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
});

// Scroll-triggered camera move
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  camera.position.z = 8 - scrollY * 0.005;
  camera.position.y = 1 + scrollY * 0.002;
});

// Section reveal
const sections = document.querySelectorAll('.reveal');
window.addEventListener('scroll', () => {
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.4) {
      section.classList.add('visible');
    }
  });
})
let cubeAnimated = false;

window.addEventListener('scroll', () => {
  const rect = featuresSection.getBoundingClientRect();
  if (rect.top < window.innerHeight * 0.5 && !cubeAnimated) {
    cubeAnimated = true;

    let bounceStart = performance.now();

    function bounceSpin(time) {
      let elapsed = time - bounceStart;
      let progress = Math.min(elapsed / 1000, 1);

      cube.position.y = 1 + Math.sin(progress * Math.PI * 3) * 0.5;
      cube.rotation.y += 0.1;

      if (progress < 1) {
        requestAnimationFrame(bounceSpin);
      } else {
        cube.position.y = 1;
      }
    }

    requestAnimationFrame(bounceSpin);
  }
});
const overlay = document.getElementById('overlay');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  
  // Hide overlay when scrolling past 100px
  if (scrollY > 100) {
    overlay.classList.add('hidden');
  } else {
    overlay.classList.remove('hidden');
  }
});




const featuresSection = document.querySelector('.features-section');
const spotlight = scene.children.find(obj => obj.isSpotLight);

window.addEventListener('scroll', () => {
  const rect = featuresSection.getBoundingClientRect();
  if (rect.top < window.innerHeight * 0.5 && !featuresSection.classList.contains('blinked')) {
    featuresSection.classList.add('blinked');

    // Blink green
    const originalColor = spotlight.color.getHex();
    spotlight.color.setHex(0x00ff00); // green

    setTimeout(() => {
      spotlight.color.setHex(originalColor); // back to red
    }, 500); // blink duration
  }
});


const bloomParams = {
  strength: 1.2,     // glow intensity
  radius: 0.6,       // spread
  threshold: 0.2     // brightness cutoff
};

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  bloomParams.strength,
  bloomParams.radius,
  bloomParams.threshold
);


// Animate
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Responsive
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

document.querySelector('.starter-card').addEventListener('click', function () {
  this.classList.toggle('expanded');
});

document.querySelector('.premium-card').addEventListener('click', function () {
  this.classList.toggle('expanded');
});


