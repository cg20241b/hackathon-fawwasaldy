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
renderer.shadowMap.enabled = true; // Enable shadow maps
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: Smooth shadows
document.body.appendChild(renderer.domElement);

// Handle Window Resize
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

// Cube with glowing effect
const glowingCubeMaterial = new THREE.ShaderMaterial({
  uniforms: {
    glowColor: { value: new THREE.Color(0xffffff) },
    intensity: { value: 2.0 }, // Adjust intensity for visual effect
  },
  vertexShader: `
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 glowColor;
    uniform float intensity;
    varying vec3 vPosition;

    void main() {
      float distanceFromCenter = length(vPosition);
      float glowFactor = intensity / (distanceFromCenter * distanceFromCenter + 1.0);
      vec3 color = glowColor * glowFactor;
      gl_FragColor = vec4(color, 1.0);
    }
  `,
  transparent: true,
  side: THREE.FrontSide, // Ensure only front faces are rendered for glow
});

// Cube geometry and mesh
const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const glowingCube = new THREE.Mesh(cubeGeometry, glowingCubeMaterial);
glowingCube.position.set(0, 0, 0);
scene.add(glowingCube);

// Point Light to emit actual light
const cubeLight = new THREE.PointLight(0xffffff, 1, 1); // Adjust intensity and range
cubeLight.position.copy(glowingCube.position);
scene.add(cubeLight);

// Constants
const lastThreeDigits = 179; // Replace with your last three digits
const abc = lastThreeDigits + 200; // Adjust based on your ID
const ambientIntensity = abc / 1000; // e.g., 0.656

// Cube position uniform
const cubeLightPosition = new THREE.Vector3(0, 0, 0); // Will be updated dynamically

// Background Plane ShaderMaterial
const planeMaterial = new THREE.ShaderMaterial({
  uniforms: {
    lightPosition: { value: cubeLightPosition }, // Cube position uniform
    ambientIntensity: { value: 0.2 }, // Adjust as needed
    lightColor: { value: new THREE.Color(0xffffff) },
    planeColor: { value: new THREE.Color(0x012345) }, // Concrete-like base color
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = vec3(modelViewMatrix * vec4(position, 1.0));
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 lightPosition;
    uniform vec3 lightColor;
    uniform vec3 planeColor;
    uniform float ambientIntensity;

    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      // Ambient lighting
      vec3 ambient = ambientIntensity * planeColor;

      // Diffuse lighting
      vec3 lightDir = normalize(lightPosition - vPosition);
      float diff = max(dot(vNormal, lightDir), 0.0);
      vec3 diffuse = diff * planeColor;

      // Specular lighting (subtle, for a concrete effect)
      vec3 viewDir = normalize(-vPosition);
      vec3 reflectDir = reflect(-lightDir, vNormal);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), 16.0); // Adjust shininess for concrete
      vec3 specular = spec * lightColor * 0.1; // Concrete isn't very shiny, so scale it down

      // Final color
      vec3 color = ambient + diffuse + specular;
      gl_FragColor = vec4(color, 1.0);
    }
  `,
  side: THREE.DoubleSide, // Allow visibility from both sides
});

// Background Plane
const planeGeometry = new THREE.PlaneGeometry(40, 20);
const backgroundPlane = new THREE.Mesh(planeGeometry, planeMaterial);
backgroundPlane.position.set(0, 0, -5); // Position it behind other objects
scene.add(backgroundPlane);

// Alphabet ShaderMaterial
const alphabetMaterial = new THREE.ShaderMaterial({
  uniforms: {
    lightPosition: { value: cubeLightPosition },
    baseColor: { value: new THREE.Color(0x40e0d0) }, // Replace with your favorite color
    ambientIntensity: { value: ambientIntensity },
    shininess: { value: 50.0 }, // Plastic-like shininess
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = vec3(modelViewMatrix * vec4(position, 1.0));
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 lightPosition;
    uniform vec3 baseColor;
    uniform float ambientIntensity;
    uniform float shininess;

    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vec3 lightDir = normalize(lightPosition - vPosition);
      vec3 ambient = ambientIntensity * baseColor;

      float diff = max(dot(vNormal, lightDir), 0.0);
      vec3 diffuse = diff * baseColor;

      vec3 viewDir = normalize(-vPosition);
      vec3 reflectDir = reflect(-lightDir, vNormal);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
      vec3 specular = spec * vec3(1.0);

      vec3 color = ambient + diffuse + specular;
      gl_FragColor = vec4(color, 1.0);
    }
  `,
});

// Digit ShaderMaterial
const digitMaterial = new THREE.ShaderMaterial({
  uniforms: {
    lightPosition: { value: cubeLightPosition },
    baseColor: { value: new THREE.Color(0xcf1f2f) }, // Complementary color of alphabet
    ambientIntensity: { value: ambientIntensity },
    shininess: { value: 500.0 }, // Metallic shininess
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = vec3(modelViewMatrix * vec4(position, 1.0));
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 lightPosition;
    uniform vec3 baseColor;
    uniform float ambientIntensity;
    uniform float shininess;

    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vec3 lightDir = normalize(lightPosition - vPosition);
      vec3 ambient = ambientIntensity * baseColor;

      float diff = max(dot(vNormal, lightDir), 0.0);
      vec3 diffuse = diff * baseColor;

      vec3 viewDir = normalize(-vPosition);
      vec3 reflectDir = reflect(-lightDir, vNormal);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
      vec3 specular = spec * baseColor; // Specular matches base color for metallic look

      vec3 color = ambient + diffuse + specular;
      gl_FragColor = vec4(color, 1.0);
    }
  `,
});

// Alphabet Mesh
const loader = new FontLoader();
loader.load('node_modules/three/examples/fonts/helvetiker_bold.typeface.json', (font) => {
  const alphabetGeometry = new TextGeometry('y', {
    font: font,
    size: 1,
    height: 0.2,
  });
  const alphabetMesh = new THREE.Mesh(alphabetGeometry, alphabetMaterial);
  alphabetMesh.position.set(-2, 0, 0);
  scene.add(alphabetMesh);

  const digitGeometry = new TextGeometry('9', {
    font: font,
    size: 1,
    height: 0.2,
  });
  const digitMesh = new THREE.Mesh(digitGeometry, digitMaterial);
  digitMesh.position.set(2, 0, 0);
  scene.add(digitMesh);
});

// Cube Light Synchronization
function syncLightPosition() {
  cubeLight.position.copy(glowingCube.position);
  alphabetMaterial.uniforms.lightPosition.value.copy(glowingCube.position);
  digitMaterial.uniforms.lightPosition.value.copy(glowingCube.position);
}


// Interactivity
window.addEventListener('keydown', (event) => {
  switch(event.key) {
    case 'w':
      glowingCube.position.y += 0.1;
      break;
    case 's':
      glowingCube.position.y -= 0.1;
      break;
    case 'a':
      glowingCube.position.x -= 0.1;
      break;
    case 'd':
      glowingCube.position.x += 0.1;
      break;
    case 'q':
      glowingCube.position.z -= 0.1;
      break;
    case 'e':
      glowingCube.position.z += 0.1;
      break;
  }
});

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  syncLightPosition();
  renderer.render(scene, camera);
}
animate();