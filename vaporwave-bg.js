// vaporwave-bg.js
import * as THREE from './three.module.js';

let scene, camera, renderer, cube, grid;
let container = document.getElementById("about-section");

scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x300022, 10, 100); // vaporwave fog

camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Red light
const redLight = new THREE.PointLight(0xff0055, 2, 50);
redLight.position.set(0, 5, 5);
scene.add(redLight);

// Grid floor
grid = new THREE.GridHelper(100, 40, 0xff0044, 0xff0044);
grid.material.opacity = 0.2;
grid.material.transparent = true;
scene.add(grid);

// Wireframe Cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0xff0044, wireframe: true });
cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Animate
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.y += 0.01;
  camera.position.x = Math.sin(Date.now() * 0.001) * 2;
  camera.lookAt(scene.position);
  renderer.render(scene, camera);
}
animate();

// Handle resize
window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});
