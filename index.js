import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Central Glowing Cube
const cubeGeometry = new THREE.BoxGeometry();
const cubeMaterial = new THREE.ShaderMaterial({
  // Shader code for glowing effect
});
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);

// Load Font and Create Text Meshes
const loader = new FontLoader();
loader.load('path/to/font.json', function(font) {
  const textGeometry = new TextGeometry('i', {
    font: font,
    size: 1,
    height: 0.2,
  });
  const textMaterial = new THREE.ShaderMaterial({
    // Shader code for alphabet
  });
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.x = -5;
  scene.add(textMesh);

  const digitGeometry = new TextGeometry('6', {
    font: font,
    size: 1,
    height: 0.2,
  });
  const digitMaterial = new THREE.ShaderMaterial({
    // Shader code for digit
  });
  const digitMesh = new THREE.Mesh(digitGeometry, digitMaterial);
  digitMesh.position.x = 5;
  scene.add(digitMesh);
});

// Interactivity
window.addEventListener('keydown', (event) => {
  switch(event.key) {
    case 'w':
      cube.position.y += 0.1;
      break;
    case 's':
      cube.position.y -= 0.1;
      break;
    case 'a':
      camera.position.x -= 0.1;
      break;
    case 'd':
      camera.position.x += 0.1;
      break;
  }
});

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();