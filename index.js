import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Set background to black

const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 2000);
camera.position.set(0, 0, 5);
camera.lookAt(scene.position);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Handle Window Resize
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

// Central Glowing Cube
const cubeGeometry = new THREE.BoxGeometry();
const cubeMaterial = new THREE.ShaderMaterial({
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    void main() {
      // Emit white light based on the normal direction
      float intensity = dot(vNormal, vec3(0.0, 0.0, 1.0));
      intensity = clamp(intensity, 0.0, 1.0);
      gl_FragColor = vec4(vec3(intensity), 1.0);
    }
  `,
  blending: THREE.AdditiveBlending,
  transparent: true,
  depthWrite: false,
});
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0, 0, 0); // Center of the scene
scene.add(cube);
console.log('Cube Added:', cube);

// Load Font and Create Text Meshes
const loader = new FontLoader();
loader.load('node_modules/three/examples/fonts/helvetiker_bold.typeface.json', function(font) {
  const textGeometry = new TextGeometry('y', {
    font: font,
    size: 1,
    height: 0.2,
  });
  const textMaterial = new THREE.ShaderMaterial({
    // Shader code for alphabet
  });
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.x = -2;
  scene.add(textMesh);

  const digitGeometry = new TextGeometry('9', {
    font: font,
    size: 1,
    height: 0.2,
  });
  const digitMaterial = new THREE.ShaderMaterial({
    // Shader code for digit
  });
  const digitMesh = new THREE.Mesh(digitGeometry, digitMaterial);
  digitMesh.position.x = 2;
  scene.add(digitMesh);
});

// Optional: Add Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

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
    case 'q':
      camera.position.z -= 0.1;
      break;
    case 'e':
      camera.position.z += 0.1;
      break;
  }
});

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

    // Optional: Rotate the cube for better visibility
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}
animate();