import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js";
import { createComputerExperience } from "./computer.js";

const pedals = [
  {
    name: "Blob Tracker",
    description:
      "Live motion-based video editor that detects shapes and movement in footage. Turn visuals into reactive blobs, VHS artifacts, and experimental motion graphics.",
    color: "#ff3dc8",
    ledColor: "#ff3dc8",
    url: "https://anthonyasc5.github.io/blobbertrack/",
    status: "live",
    size: "large",
  },
  {
    name: "Depth Engine",
    description:
      "Experimental LiDAR depth visualizer. Convert images into layered 3D particle fields and scan-line depth maps.",
    color: "#ffd400",
    ledColor: "#ffd400",
    url: "https://anthonyasc5.github.io/depthenginebyall/",
    status: "live",
    size: "xlarge",
  },
  {
    name: "Portfolio",
    description:
      "Projects, experiments, and design work by Anthony Lall. Interactive prototypes, creative coding, and visual tools.",
    color: "#3f7dff",
    ledColor: "#3f7dff",
    url: "https://anthonyasc5.github.io/anthonys-project/",
    status: "live",
    size: "large",
  },
  {
    name: "Slowed + Reverb",
    description:
      "Instant audio transformer. Drag in music and generate slowed, atmospheric edits with reverb and pitch control.",
    color: "#cfd3d8",
    ledColor: "#6b2cff",
    url: "",
    status: "coming-soon",
    size: "xsmall",
  },
  {
    name: "Kinect Engine",
    description:
      "Real-time body tracking experiments using depth sensors. Motion-driven visuals and interactive environments.",
    color: "#cfd3d8",
    ledColor: "#39ff68",
    url: "",
    status: "coming-soon",
    size: "xsmall",
  },
  {
    name: "Vibe Sync",
    description:
      "Audio reactive visualizer engine. Sync music to generative visuals and animated depth effects.",
    color: "#cfd3d8",
    ledColor: "#25dfff",
    url: "https://anthonyasc5.github.io/vibesync/",
    status: "live",
    size: "xsmall",
  },
];

const sceneRoot = document.querySelector("#scene-root");
const tooltip = document.querySelector("#tooltip");
const peopleToggle = document.querySelector("#people-toggle");

// Global Variables - add scene, camera, renderer, and world light
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.physicallyCorrectLights = false;
sceneRoot.appendChild(renderer.domElement);

const worldLight = new THREE.HemisphereLight("#FFFFFF", "#202020", 1.7);
const keyLight = new THREE.DirectionalLight("#ffffff", 1.4);
const fillLight = new THREE.PointLight("#ffffff", 0.65, 30);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(2, 2);
const pedalObjects = [];
const clickableMeshes = [];
const hoverOnlyMeshes = [];
const walkers = [];
let walkersEnabled = true;
let depthEnginePedal = null;
let computerExperience = null;

let hoveredPedal = null;
let hoveredInfo = null;
let manualNow = performance.now();

function createPedalEnvMap() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.15, "#d8ecff");
  gradient.addColorStop(0.35, "#7a9cc0");
  gradient.addColorStop(0.55, "#1a2430");
  gradient.addColorStop(0.78, "#8a673f");
  gradient.addColorStop(1, "#f7f3ea");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "rgba(255,255,255,0.6)";
  context.fillRect(0, canvas.height * 0.08, canvas.width, canvas.height * 0.09);
  context.fillStyle = "rgba(255,255,255,0.22)";
  context.fillRect(0, canvas.height * 0.2, canvas.width, canvas.height * 0.05);
  context.fillStyle = "rgba(0,0,0,0.22)";
  context.fillRect(0, canvas.height * 0.56, canvas.width, canvas.height * 0.16);

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.SphericalReflectionMapping;
  texture.encoding = THREE.sRGBEncoding;
  return texture;
}

function createPedalRoughnessMap() {
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  const context = canvas.getContext("2d");

  for (let y = 0; y < 16; y += 1) {
    for (let x = 0; x < 16; x += 1) {
      const tone = Math.floor(90 + Math.random() * 110);
      context.fillStyle = `rgb(${tone}, ${tone}, ${tone})`;
      context.fillRect(x, y, 1, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

const pedalEnvMap = createPedalEnvMap();
const pedalRoughnessMap = createPedalRoughnessMap();

function createBoardTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext("2d");

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#7b4d26");
  gradient.addColorStop(0.45, "#9a6634");
  gradient.addColorStop(1, "#5c381c");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 54; index += 1) {
    const y = (index / 54) * canvas.height;
    context.strokeStyle = `rgba(255,255,255,${0.04 + Math.random() * 0.05})`;
    context.lineWidth = 1 + Math.random() * 3;
    context.beginPath();
    context.moveTo(0, y + Math.random() * 12);
    context.bezierCurveTo(
      canvas.width * 0.25,
      y - 14 + Math.random() * 24,
      canvas.width * 0.72,
      y - 14 + Math.random() * 24,
      canvas.width,
      y + Math.random() * 12
    );
    context.stroke();
  }

  for (let index = 0; index < 18; index += 1) {
    context.fillStyle = `rgba(70, 38, 14, ${0.12 + Math.random() * 0.08})`;
    context.beginPath();
    context.ellipse(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      12 + Math.random() * 24,
      4 + Math.random() * 9,
      Math.random() * Math.PI,
      0,
      Math.PI * 2
    );
    context.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.2, 1);
  return texture;
}

function createGrassTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const context = canvas.getContext("2d");

  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#274c1f");
  gradient.addColorStop(0.55, "#1d3f18");
  gradient.addColorStop(1, "#12290e");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 5000; index += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const length = 8 + Math.random() * 18;
    const bend = -4 + Math.random() * 8;
    context.strokeStyle = `rgba(${40 + Math.random() * 70}, ${110 + Math.random() * 90}, ${30 + Math.random() * 45}, ${0.18 + Math.random() * 0.24})`;
    context.lineWidth = 1 + Math.random() * 1.4;
    context.beginPath();
    context.moveTo(x, y);
    context.quadraticCurveTo(x + bend, y - length * 0.45, x + bend * 0.4, y - length);
    context.stroke();
  }

  for (let index = 0; index < 1600; index += 1) {
    context.fillStyle = `rgba(${90 + Math.random() * 80}, ${110 + Math.random() * 90}, ${35 + Math.random() * 45}, ${0.05 + Math.random() * 0.1})`;
    context.beginPath();
    context.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1 + Math.random() * 2.5, 0, Math.PI * 2);
    context.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

function createFaceTexture(skin) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");

  context.fillStyle = skin;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#141414";
  context.beginPath();
  context.arc(42, 48, 6, 0, Math.PI * 2);
  context.arc(86, 48, 6, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "rgba(25,25,25,0.8)";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(50, 88);
  context.quadraticCurveTo(64, 98, 78, 88);
  context.stroke();

  return new THREE.CanvasTexture(canvas);
}

function createLabelTexture(name) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext("2d");

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(255,255,255,0.02)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#0d0d0f";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = "700 40px Orbitron, sans-serif";

  const lines = name.split(" ");
  if (lines.length > 1) {
    context.fillText(lines.slice(0, -1).join(" "), canvas.width / 2, canvas.height / 2 - 24);
    context.fillText(lines[lines.length - 1], canvas.width / 2, canvas.height / 2 + 28);
  } else {
    context.fillText(name, canvas.width / 2, canvas.height / 2);
  }

  return new THREE.CanvasTexture(canvas);
}

function createScreenTexture(text, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext("2d");

  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#11161a");
  gradient.addColorStop(1, "#030405");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 50; index += 1) {
    context.fillStyle = index % 2 === 0 ? "rgba(255,255,255,0.018)" : "rgba(255,255,255,0.008)";
    context.fillRect(0, index * 5, canvas.width, 2);
  }

  context.fillStyle = color;
  context.shadowColor = color;
  context.shadowBlur = 18;
  context.font = '28px "Press Start 2P", monospace';
  context.textAlign = "center";
  context.textBaseline = "middle";

  const lines = text.split("\n");
  lines.forEach((line, index) => {
    const y = canvas.height / 2 + (index - (lines.length - 1) / 2) * 38;
    context.fillText(line, canvas.width / 2, y);
  });

  return new THREE.CanvasTexture(canvas);
}

function createGritTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");

  context.fillStyle = "#1b1b1d";
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 2200; index += 1) {
    const tone = 20 + Math.floor(Math.random() * 70);
    const alpha = 0.04 + Math.random() * 0.18;
    context.fillStyle = `rgba(${tone}, ${tone}, ${tone}, ${alpha})`;
    const size = 1 + Math.random() * 3;
    context.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, size, size);
  }

  for (let index = 0; index < 180; index += 1) {
    context.strokeStyle = `rgba(255,255,255,${0.015 + Math.random() * 0.03})`;
    context.lineWidth = 1;
    context.beginPath();
    const y = Math.random() * canvas.height;
    context.moveTo(0, y);
    context.lineTo(canvas.width, y + (Math.random() - 0.5) * 6);
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.4, 1.4);
  return texture;
}

const gritTexture = createGritTexture();

function createGraffitiTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const context = canvas.getContext("2d");

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.translate(60, 170);
  context.rotate(-0.06);
  context.font = '900 120px "Arial Black", Impact, sans-serif';
  context.textBaseline = "middle";

  context.strokeStyle = "rgba(40, 0, 0, 0.34)";
  context.lineWidth = 18;
  context.setLineDash([18, 10]);
  context.strokeText("COMING SOON", 0, 0);
  context.setLineDash([]);

  context.shadowColor = "rgba(255, 0, 0, 0.45)";
  context.shadowBlur = 16;
  context.fillStyle = "#d11f1f";
  context.fillText("COMING SOON", 0, 0);

  context.shadowBlur = 0;
  context.strokeStyle = "rgba(255, 180, 180, 0.18)";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(10, 28);
  context.bezierCurveTo(180, -20, 340, -10, 520, 18);
  context.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  return texture;
}

function createComingSoonGraffiti(position) {
  const graffiti = new THREE.Mesh(
    new THREE.PlaneGeometry(3.9, 1.05),
    new THREE.MeshBasicMaterial({
      map: createGraffitiTexture(),
      transparent: true,
      depthWrite: false,
    })
  );
  graffiti.rotation.x = -Math.PI / 2;
  graffiti.rotation.z = -0.02;
  graffiti.position.copy(position);
  scene.add(graffiti);
}

function sizeConfig(size) {
  if (size === "xlarge") {
    return { width: 2.42, height: 0.9, depth: 2.76, switchScale: 1.14 };
  }

  if (size === "small") {
    return { width: 1.32, height: 0.64, depth: 1.88, switchScale: 0.72 };
  }
  
  if (size === "xsmall") {
    return { width: .7, height: .5, depth: 1.88, switchScale: 0.72 };
  }

  if (size === "large") {
    return { width: 1.84, height: 0.76, depth: 2.18, switchScale: 0.88 };
  }

  return { width: 1.78, height: 0.78, depth: 2.22, switchScale: 0.92 };
}

function layoutConfig(name, config) {
  const presets = {
    "Blob Tracker": {
      screen: { x: -config.width * 0.06, z: -config.depth * 0.22, w: config.width * 0.62, h: config.depth * 0.2 },
      label: { x: 0.02, z: config.depth * 0.03, w: config.width * 0.82, h: config.depth * 0.24 },
      status: { x: 0, z: config.depth * 0.38, w: config.width * 0.52, h: config.depth * 0.09 },
      footswitch: { x: -config.width * 0.04, z: config.depth * 0.29 },
      led: { x: config.width * 0.31, z: -config.depth * 0.34 },
      knobs: [],
    },
    "Depth Engine": {
      screen: { x: 0, z: -config.depth * 0.2, w: config.width * 0.58, h: config.depth * 0.18 },
      label: { x: 0, z: config.depth * 0.03, w: config.width * 0.9, h: config.depth * 0.2 },
      status: { x: 0, z: config.depth * 0.36, w: config.width * 0.42, h: config.depth * 0.08 },
      footswitch: { x: config.width * 0.18, z: config.depth * 0.29 },
      led: { x: config.width * 0.33, z: -config.depth * 0.33 },
      knobs: [
        { x: -config.width * 0.3, z: config.depth * 0.31, r: 0.07 },
        { x: -config.width * 0.04, z: config.depth * 0.37, r: 0.065 },
      ],
    },
    Portfolio: {
      screen: { x: 0, z: -config.depth * 0.21, w: config.width * 0.52, h: config.depth * 0.16 },
      label: { x: 0, z: config.depth * 0.05, w: config.width * 0.86, h: config.depth * 0.22 },
      status: { x: 0, z: config.depth * 0.34, w: config.width * 0.46, h: config.depth * 0.08 },
      footswitch: { x: 0, z: config.depth * 0.25 },
      led: { x: -config.width * 0.29, z: -config.depth * 0.33 },
      knobs: [
        { x: config.width * 0.2, z: config.depth * 0.14, r: 0.058 },
        { x: config.width * 0.34, z: config.depth * 0.28, r: 0.052 },
      ],
    },
    "Slowed + Reverb": {
      screen: { x: -config.width * 0.05, z: -config.depth * 0.18, w: config.width * 0.56, h: config.depth * 0.17 },
      label: { x: 0, z: config.depth * 0.02, w: config.width * 0.84, h: config.depth * 0.22 },
      status: { x: 0, z: config.depth * 0.37, w: config.width * 0.68, h: config.depth * 0.08 },
      footswitch: { x: -config.width * 0.08, z: config.depth * 0.23 },
      led: { x: config.width * 0.27, z: -config.depth * 0.31 },
      knobs: [
        { x: config.width * 0.26, z: config.depth * 0.14, r: 0.055 },
      ],
    },
    "Kinect Engine": {
      screen: { x: 0, z: -config.depth * 0.19, w: config.width * 0.62, h: config.depth * 0.18 },
      label: { x: 0, z: config.depth * 0.05, w: config.width * 0.92, h: config.depth * 0.18 },
      status: { x: 0, z: config.depth * 0.38, w: config.width * 0.74, h: config.depth * 0.08 },
      footswitch: { x: 0, z: config.depth * 0.24 },
      led: { x: config.width * 0.25, z: -config.depth * 0.31 },
      knobs: [
        { x: -config.width * 0.31, z: config.depth * 0.18, r: 0.055 },
        { x: config.width * 0.31, z: config.depth * 0.18, r: 0.055 },
      ],
    },
    "Vibe Sync": {
      screen: { x: 0, z: -config.depth * 0.16, w: config.width * 0.5, h: config.depth * 0.15 },
      label: { x: 0, z: config.depth * 0.06, w: config.width * 0.82, h: config.depth * 0.2 },
      status: { x: 0, z: config.depth * 0.34, w: config.width * 0.44, h: config.depth * 0.08 },
      footswitch: { x: 0.02, z: config.depth * 0.27 },
      led: { x: config.width * 0.29, z: -config.depth * 0.29 },
      knobs: [
        { x: -config.width * 0.24, z: config.depth * 0.19, r: 0.05 },
      ],
    },
  };

  return presets[name];
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function updateScreen(pedalObject, text, color) {
  const material = pedalObject.screen.material;
  if (material.map) {
    material.map.dispose();
  }
  material.map = createScreenTexture(text, color);
  material.needsUpdate = true;
}

function createGuitarProp(position) {
  const guitar = new THREE.Group();
  guitar.position.copy(position);
  guitar.rotation.z = -0.36;
  guitar.rotation.x = 0.08;
  guitar.rotation.y = 0.18;

  const redMetal = new THREE.MeshStandardMaterial({
    color: 0xff2020,
    roughness: 0.2,
    metalness: 0.55,
    emissive: 0x220000,
    envMap: pedalEnvMap,
    envMapIntensity: 0.9,
  });
  const whitePlastic = new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.72, metalness: 0.06 });
  const darkMetal = createMetalMaterial(0x2c2f34, 0.22, 0.92);
  const neckWood = new THREE.MeshStandardMaterial({ color: 0xd3b48b, roughness: 0.78, metalness: 0.08 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.16, 2.05), redMetal);
  body.castShadow = true;
  body.receiveShadow = true;
  guitar.add(body);

  const wingLeft = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.9, 4), redMetal);
  wingLeft.rotation.z = 0.82;
  wingLeft.rotation.x = Math.PI / 2;
  wingLeft.position.set(-0.48, 0, -0.42);
  wingLeft.castShadow = true;
  guitar.add(wingLeft);

  const wingRight = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.82, 4), redMetal);
  wingRight.rotation.z = -0.78;
  wingRight.rotation.x = Math.PI / 2;
  wingRight.position.set(0.44, 0, -0.38);
  wingRight.castShadow = true;
  guitar.add(wingRight);

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.78, 4), redMetal);
  tail.rotation.z = Math.PI;
  tail.rotation.x = Math.PI / 2;
  tail.position.set(-0.18, 0, 0.9);
  tail.castShadow = true;
  guitar.add(tail);

  const pickguard = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.05, 0.94), whitePlastic);
  pickguard.position.set(0.2, 0.09, 0.1);
  pickguard.rotation.y = 0.16;
  pickguard.castShadow = true;
  guitar.add(pickguard);

  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 2.7), neckWood);
  neck.position.set(0.02, 0.06, -2.25);
  neck.castShadow = true;
  guitar.add(neck);

  const fretboard = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 2.65), new THREE.MeshStandardMaterial({ color: 0xa27d59, roughness: 0.8, metalness: 0.04 }));
  fretboard.position.set(0.02, 0.105, -2.25);
  guitar.add(fretboard);

  const headstock = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.45), neckWood);
  headstock.position.set(0.02, 0.06, -3.72);
  headstock.castShadow = true;
  guitar.add(headstock);

  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.08, 0.18), darkMetal);
  bridge.position.set(0, 0.095, 0.32);
  guitar.add(bridge);

  const pickup1 = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.07, 0.2), darkMetal);
  pickup1.position.set(0.02, 0.105, -0.2);
  guitar.add(pickup1);
  const pickup2 = pickup1.clone();
  pickup2.position.set(0.02, 0.105, 0.44);
  guitar.add(pickup2);

  for (let index = 0; index < 6; index += 1) {
    const stringMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.003, 0.003, 4.2, 6),
      new THREE.MeshStandardMaterial({ color: 0xc5cbd3, roughness: 0.2, metalness: 1, envMap: pedalEnvMap })
    );
    stringMesh.rotation.x = Math.PI / 2;
    stringMesh.position.set(-0.07 + index * 0.028, 0.12, -1.62);
    guitar.add(stringMesh);
  }

  const knobMaterial = createMetalMaterial(0x1f2023, 0.28, 0.88);
  [
    [0.45, 0.55],
    [0.68, 0.62],
    [0.43, 0.9],
    [0.66, 0.98],
  ].forEach(([x, z]) => {
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.11, 18), knobMaterial);
    knob.position.set(x, 0.11, z);
    guitar.add(knob);
  });

  const stand = new THREE.Mesh(
    new THREE.TorusGeometry(0.35, 0.025, 10, 20, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1c, roughness: 0.85, metalness: 0.2 })
  );
  stand.rotation.x = Math.PI / 2;
  stand.position.set(0.05, -0.08, 0.72);
  guitar.add(stand);

  guitar.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.userData.hoverTarget = guitar;
      hoverOnlyMeshes.push(child);
    }
  });

  guitar.userData = {
    title: "808er Midi Plugin",
    description: "on the way -> juce & c++",
    hoverMaterial: redMetal,
  };

  scene.add(guitar);
}

function createMetalMaterial(color, roughness = 0.55, metalness = 0.92) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness,
    envMap: pedalEnvMap,
    roughnessMap: pedalRoughnessMap,
    envMapIntensity: 1.1,
  });
}

function createPedal(pedal, position, tilt) {
  const config = { ...sizeConfig(pedal.size) };
  if (pedal.name === "Depth Engine") {
    config.width *= 0.96;
  }
  const layout = layoutConfig(pedal.name, config);
  const group = new THREE.Group();
  group.position.copy(position);
  group.rotation.x = 0.17;
  group.rotation.z = tilt;

  const bodyGeometry = new THREE.BoxGeometry(config.width, config.height, config.depth);
  const bodyMaterial = createMetalMaterial(pedal.color, 0.3, 0.82);
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const topPlate = new THREE.Mesh(
    new THREE.BoxGeometry(config.width * 0.94, 0.04, config.depth * 0.9),
    pedal.name === "Depth Engine"
      ? new THREE.MeshStandardMaterial({
          color: 0x1f1f1f,
          map: gritTexture,
          roughness: 0.88,
          metalness: 0.16,
          envMap: pedalEnvMap,
          envMapIntensity: 0.35,
        })
      : createMetalMaterial(new THREE.Color(pedal.color).offsetHSL(0, 0, 0.08), 0.24, 0.76)
  );
  topPlate.position.y = config.height / 2 + 0.01;
  topPlate.castShadow = true;
  group.add(topPlate);

  const screenFrame = new THREE.Mesh(
    new THREE.BoxGeometry(layout.screen.w * 1.1, 0.08, layout.screen.h * 1.25),
    new THREE.MeshStandardMaterial({ color: 0x141416, metalness: 0.7, roughness: 0.48, envMap: pedalEnvMap })
  );
  screenFrame.position.set(layout.screen.x, config.height / 2 + 0.02, layout.screen.z);
  screenFrame.castShadow = true;
  group.add(screenFrame);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(layout.screen.w, layout.screen.h),
    new THREE.MeshBasicMaterial({
      map: createScreenTexture("READY", "#86f6ff"),
      transparent: false,
    })
  );
  screen.rotation.x = -Math.PI / 2;
  screen.position.set(layout.screen.x, config.height / 2 + 0.061, layout.screen.z);
  group.add(screen);

  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(layout.label.w, layout.label.h),
    new THREE.MeshBasicMaterial({
      map: createLabelTexture(pedal.name),
      transparent: true,
    })
  );
  label.rotation.x = -Math.PI / 2;
  label.position.set(layout.label.x, config.height / 2 + 0.062, layout.label.z);
  group.add(label);

  const status = new THREE.Mesh(
    new THREE.PlaneGeometry(layout.status.w, layout.status.h),
    new THREE.MeshBasicMaterial({
      map: createScreenTexture(pedal.status === "live" ? "LIVE" : "COMING SOON", "#1a1a1a"),
      transparent: true,
    })
  );
  status.rotation.x = -Math.PI / 2;
  status.position.set(layout.status.x, config.height / 2 + 0.062, layout.status.z);
  group.add(status);

  const footswitchBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24 * config.switchScale, 0.24 * config.switchScale, 0.1, 28),
    createMetalMaterial(0x88919a, 0.22, 0.92)
  );
  footswitchBase.position.set(layout.footswitch.x, config.height / 2 + 0.055, layout.footswitch.z);
  footswitchBase.castShadow = true;
  group.add(footswitchBase);

  const footswitch = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18 * config.switchScale, 0.18 * config.switchScale, 0.14, 28),
    createMetalMaterial(0xe5ebf2, 0.14, 0.95)
  );
  footswitch.position.set(layout.footswitch.x, config.height / 2 + 0.14, layout.footswitch.z);
  footswitch.castShadow = true;
  group.add(footswitch);

  const led = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 18, 18),
    new THREE.MeshStandardMaterial({
      color: pedal.ledColor,
      emissive: pedal.ledColor,
      emissiveIntensity: 0.45,
      metalness: 0.15,
      roughness: 0.18,
      envMap: pedalEnvMap,
    })
  );
  led.position.set(layout.led.x, config.height / 2 + 0.08, layout.led.z);
  group.add(led);

  layout.knobs.forEach((knob) => {
    const knobBase = new THREE.Mesh(
      new THREE.CylinderGeometry(knob.r * 1.18, knob.r * 1.18, 0.045, 18),
      createMetalMaterial(0x2b2d31, 0.38, 0.72)
    );
    knobBase.position.set(knob.x, config.height / 2 + 0.04, knob.z);
    group.add(knobBase);

    const knobCap = new THREE.Mesh(
      new THREE.CylinderGeometry(knob.r, knob.r, 0.07, 18),
      createMetalMaterial(0xd6dae0, 0.18, 0.9)
    );
    knobCap.position.set(knob.x, config.height / 2 + 0.085, knob.z);
    group.add(knobCap);
  });

  const screwGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.03, 18);
  const screwMaterial = createMetalMaterial(0xbfc4cb, 0.18, 0.92);
  const screwPositions = [
    [-config.width * 0.36, config.height / 2 + 0.04, -config.depth * 0.38],
    [config.width * 0.18, config.height / 2 + 0.04, -config.depth * 0.38],
    [-config.width * 0.36, config.height / 2 + 0.04, config.depth * 0.38],
    [config.width * 0.36, config.height / 2 + 0.04, config.depth * 0.38],
  ];

  screwPositions.forEach(([x, y, z]) => {
    const screw = new THREE.Mesh(screwGeometry, screwMaterial);
    screw.rotation.x = Math.PI / 2;
    screw.position.set(x, y, z);
    group.add(screw);
  });

  group.userData = {
    pedal,
    config,
    body,
    led,
    footswitch,
    screen,
    status,
    baseY: position.y,
    hover: 0,
    press: 0,
    clickCooldown: 0,
  };

  if (pedal.name === "Depth Engine") {
    depthEnginePedal = group;
  }

  pedalObjects.push(group);
  clickableMeshes.push(body, footswitch);
  scene.add(group);
}

class Walker {
  constructor(index, anchorPedal) {
    this.anchorPedal = anchorPedal;
    this.state = Math.random() > 0.35 ? "board" : "pedal";
    this.speed = randomBetween(0.18, 0.34);
    this.phase = Math.random() * Math.PI * 2;
    this.pauseUntil = 0;
    this.target = new THREE.Vector3();

    const skinTones = ["#f2c8a2", "#d79b76", "#9d6548", "#f0b890", "#7b503a"];
    const shirtColors = [0x5ba4ff, 0xf77759, 0x49c173, 0xf4cf56, 0x9a70ff, 0xff87bf, 0x53d4d4];
    const hairColors = [0x1b1613, 0x4f3625, 0x6a4828, 0x2c241f];

    const skin = skinTones[index % skinTones.length];
    const shirt = shirtColors[index % shirtColors.length];
    const hair = hairColors[index % hairColors.length];

    this.group = new THREE.Group();

    this.body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.04, 0.09, 10),
      new THREE.MeshPhongMaterial({ color: shirt, shininess: 22 })
    );
    this.body.position.y = 0.09;
    this.group.add(this.body);

    this.head = new THREE.Mesh(
      new THREE.SphereGeometry(0.042, 16, 16),
      new THREE.MeshPhongMaterial({ color: skin, shininess: 20 })
    );
    this.head.position.y = 0.165;
    this.group.add(this.head);

    this.face = new THREE.Mesh(
      new THREE.PlaneGeometry(0.065, 0.065),
      new THREE.MeshBasicMaterial({ map: createFaceTexture(skin), transparent: true })
    );
    this.face.position.set(0, 0.165, 0.041);
    this.group.add(this.face);

    this.hair = new THREE.Mesh(
      new THREE.ConeGeometry(0.045, 0.055, 6),
      new THREE.MeshPhongMaterial({ color: hair, shininess: 14 })
    );
    this.hair.position.set(0, 0.205, 0);
    this.group.add(this.hair);

    this.leftArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.07, 8),
      new THREE.MeshPhongMaterial({ color: skin, shininess: 16 })
    );
    this.rightArm = this.leftArm.clone();
    this.leftArm.position.set(-0.04, 0.09, 0);
    this.rightArm.position.set(0.04, 0.09, 0);
    this.group.add(this.leftArm, this.rightArm);

    this.leftLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.009, 0.009, 0.08, 8),
      new THREE.MeshPhongMaterial({ color: 0x222222, shininess: 10 })
    );
    this.rightLeg = this.leftLeg.clone();
    this.leftLeg.position.set(-0.015, 0.03, 0);
    this.rightLeg.position.set(0.015, 0.03, 0);
    this.group.add(this.leftLeg, this.rightLeg);

    this.group.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    this.group.scale.setScalar(randomBetween(0.9, 1.1));
    this.group.position.copy(this.randomPointNearDepth());
    this.pickTarget();
    scene.add(this.group);
  }

  pedalBounds() {
    const { config } = this.anchorPedal.userData;
    const center = this.anchorPedal.position;
    return {
      minX: center.x - config.width * 0.5,
      maxX: center.x + config.width * 0.5,
      minZ: center.z - config.depth * 0.5,
      maxZ: center.z + config.depth * 0.5,
      topY: center.y + config.height * 0.5 + 0.03,
    };
  }

  randomPointNearDepth() {
    const bounds = this.pedalBounds();
    const ring = 0.35 + Math.random() * 2;
    const angle = Math.random() * Math.PI * 2;
    return new THREE.Vector3(
      this.anchorPedal.position.x + Math.cos(angle) * ring,
      0.08,
      this.anchorPedal.position.z + Math.sin(angle) * ring
    );
  }

  randomPointOnDepth() {
    const bounds = this.pedalBounds();
    return new THREE.Vector3(
      randomBetween(bounds.minX + 0.12, bounds.maxX - 0.12),
      bounds.topY,
      randomBetween(bounds.minZ + 0.16, bounds.maxZ - 0.16)
    );
  }

  pickTarget() {
    if (this.state === "pedal") {
      this.target.copy(this.randomPointOnDepth());
    } else {
      this.target.copy(this.randomPointNearDepth());
    }
  }

  update(now, hoveredPedal) {
    if (!walkersEnabled) {
      this.group.visible = false;
      return;
    }

    this.group.visible = true;

    if (now < this.pauseUntil) {
      this.animateLimbs(now, 0);
      return;
    }

    const toTarget = this.target.clone().sub(this.group.position);
    const planar = new THREE.Vector3(toTarget.x, 0, toTarget.z);
    const distance = planar.length();

    if (distance < 0.08) {
      if (Math.random() > 0.6) {
        this.state = this.state === "pedal" ? "board" : "pedal";
      }
      this.pickTarget();
      this.pauseUntil = now + randomBetween(200, 900);
    } else {
      planar.normalize().multiplyScalar(this.speed * 0.016);
      this.group.position.x += planar.x;
      this.group.position.z += planar.z;
      this.group.rotation.y = Math.atan2(planar.x, planar.z);
    }

    const bounds = this.pedalBounds();
    const onPedal =
      this.group.position.x > bounds.minX &&
      this.group.position.x < bounds.maxX &&
      this.group.position.z > bounds.minZ &&
      this.group.position.z < bounds.maxZ;

    const targetY = onPedal || this.state === "pedal" ? bounds.topY : 0.08;
    this.group.position.y += (targetY - this.group.position.y) * 0.14;

    let lookBoost = 0;
    if (hoveredPedal === this.anchorPedal) {
      const distanceToPedal = this.group.position.distanceTo(this.anchorPedal.position);
      if (distanceToPedal < 2.8) {
        lookBoost = 1 - distanceToPedal / 2.8;
        const lookAngle =
          Math.atan2(
            this.anchorPedal.position.x - this.group.position.x,
            this.anchorPedal.position.z - this.group.position.z
          ) - this.group.rotation.y;
        this.head.rotation.y += (lookAngle - this.head.rotation.y) * 0.16;
        this.face.rotation.y = this.head.rotation.y;
      }
    }

    if (!lookBoost) {
      this.head.rotation.y *= 0.82;
      this.face.rotation.y = this.head.rotation.y;
    }

    this.animateLimbs(now, distance > 0.01 ? 1 : 0);
  }

  animateLimbs(now, motion) {
    const stride = Math.sin(now * 0.006 + this.phase) * motion;
    const bob = Math.abs(Math.sin(now * 0.006 + this.phase)) * 0.008 * motion;
    this.leftLeg.rotation.x = stride * 0.8;
    this.rightLeg.rotation.x = -stride * 0.8;
    this.leftArm.rotation.x = -stride * 0.55;
    this.rightArm.rotation.x = stride * 0.55;
    this.body.position.y = 0.09 + bob;
    this.head.position.y = 0.165 + bob * 0.35;
    this.face.position.y = this.head.position.y;
    this.hair.position.y = this.head.position.y + 0.04;
  }
}

function main() {
  scene.background = new THREE.Color("#a8d8ff");

  camera.position.set(0, 10, 8);
  camera.lookAt(0, 0.35, 0.45);

  worldLight.position.set(0, 10, 0);
  scene.add(worldLight);

  keyLight.position.set(-5, 8, 7);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 30;
  keyLight.shadow.camera.left = -8;
  keyLight.shadow.camera.right = 8;
  keyLight.shadow.camera.top = 8;
  keyLight.shadow.camera.bottom = -8;
  scene.add(keyLight);

  fillLight.position.set(3.5, 4.8, 5);
  scene.add(fillLight);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 24),
    new THREE.MeshPhongMaterial({
      color: 0x2a4f22,
      shininess: 4,
      specular: 0x1b2e16,
      map: createGrassTexture(),
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.48;
  floor.receiveShadow = true;
  scene.add(floor);

  const board = new THREE.Mesh(
    new THREE.BoxGeometry(8.6, 0.5, 6.2),
    new THREE.MeshPhongMaterial({
      color: 0x8e5c2f,
      shininess: 32,
      specular: 0x5e3c1d,
      map: createBoardTexture(),
    })
  );
  board.position.set(0, -0.18, 0.1);
  board.castShadow = true;
  board.receiveShadow = true;
  scene.add(board);

  const railMaterial = new THREE.MeshPhongMaterial({ color: 0x060608, shininess: 40 });
  [-2.3, 2.3].forEach((z) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.16, 0.24), railMaterial);
    rail.position.set(0, 0.16, z);
    rail.castShadow = true;
    scene.add(rail);
  });

  createGuitarProp(new THREE.Vector3(4.8, -0.42, -4.95));
  computerExperience = createComputerExperience({
    scene,
    mount: document.querySelector("#app"),
    clickableMeshes,
    hoverOnlyMeshes,
  });
  createComingSoonGraffiti(new THREE.Vector3(-7.45, .2, 0));

  const positions = [
    new THREE.Vector3(-2.25, 0.24, 0.05),
    new THREE.Vector3(0, 0.28, 0.02),
    new THREE.Vector3(2.25, 0.22, 0.06),
    new THREE.Vector3(-7.25, -0.14, 1.5),
    new THREE.Vector3(-6.25, -0.12, 1.5),
    new THREE.Vector3(-5.25, -0.14, 1.5),
  ];
  const tilts = [-0.03, 0.01, -0.02, 0.05, -0.03, 0.04];

  pedals.forEach((pedal, index) => {
    createPedal(pedal, positions[index], tilts[index]);
  });

  if (depthEnginePedal) {
    for (let index = 0; index < 28; index += 1) {
      walkers.push(new Walker(index, depthEnginePedal));
    }
  }

  renderer.render(scene, camera);
}

function findInteractiveTarget(object) {
  let current = object;
  while (current) {
    if (current.userData && (current.userData.pedal || current.userData.computer)) {
      return current;
    }
    current = current.parent;
  }
  return null;
}

function setTooltip(targetObject) {
  if (!targetObject) {
    tooltip.classList.remove("visible");
    return;
  }

  let title = "";
  let description = "";
  let position = null;

  if (targetObject.userData && targetObject.userData.pedal) {
    title = targetObject.userData.pedal.name;
    description = targetObject.userData.pedal.description;
    position = targetObject.position.clone();
  } else if (targetObject.userData) {
    title = targetObject.userData.title || "";
    description = targetObject.userData.description || "";
    position = targetObject.position.clone();
  }

  tooltip.innerHTML = `<strong>${title}</strong>${description}`;
  tooltip.classList.add("visible");

  position.y += 1.6;
  const projected = position.project(camera);
  const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

function handlePointerMove(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function activatePedal(pedalObject) {
  const { pedal } = pedalObject.userData;
  pedalObject.userData.press = 1;
  pedalObject.userData.clickCooldown = performance.now() + 140;

  if (pedal.status === "live" && pedal.url) {
    window.setTimeout(() => {
      window.open(pedal.url, "_blank", "noopener,noreferrer");
    }, 150);
    return;
  }

  updateScreen(pedalObject, "COMING\nSOON", "#ffc27f");
  window.setTimeout(() => {
    updateScreen(pedalObject, "READY", "#86f6ff");
  }, 1400);
}

function activateInteractiveTarget(targetObject) {
  if (!targetObject) {
    return;
  }

  if (targetObject.userData && targetObject.userData.pedal) {
    activatePedal(targetObject);
    return;
  }

  if (targetObject.userData && targetObject.userData.computer) {
    targetObject.userData.activate();
  }
}

renderer.domElement.addEventListener("pointermove", handlePointerMove);
renderer.domElement.addEventListener("pointerleave", () => {
  pointer.set(2, 2);
  hoveredPedal = null;
  hoveredInfo = null;
  setTooltip(null);
});

renderer.domElement.addEventListener("click", (event) => {
  handlePointerMove(event);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(clickableMeshes, false)[0];
  if (!hit) {
    return;
  }

  activateInteractiveTarget(findInteractiveTarget(hit.object));
});

peopleToggle.addEventListener("change", () => {
  walkersEnabled = peopleToggle.checked;
  walkers.forEach((walker) => {
    walker.group.visible = walkersEnabled;
  });
});

function renderFrame(frameTime = performance.now()) {
  manualNow = frameTime;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(clickableMeshes, false)[0];
  const hoverHit = raycaster.intersectObjects([...clickableMeshes, ...hoverOnlyMeshes], false)[0];
  const hoveredTarget = hit ? findInteractiveTarget(hit.object) : null;
  hoveredPedal = hoveredTarget && hoveredTarget.userData.pedal ? hoveredTarget : null;
  hoveredInfo = null;

  if (hoverHit) {
    if (hoverHit.object.userData.hoverTarget) {
      hoveredInfo = hoverHit.object.userData.hoverTarget;
    } else {
      hoveredInfo = findInteractiveTarget(hoverHit.object);
    }
  }

  if (hoveredInfo) {
    document.body.style.cursor = "pointer";
    setTooltip(hoveredInfo);
  } else {
    document.body.style.cursor = "default";
    setTooltip(null);
  }

  const time = frameTime * 0.001;

  pedalObjects.forEach((pedalObject, index) => {
    const isHovered = hoveredPedal === pedalObject;
    const data = pedalObject.userData;
    const hoverTarget = isHovered ? 1 : 0;

    data.hover += (hoverTarget - data.hover) * 0.12;
    data.press += (0 - data.press) * 0.18;

    pedalObject.position.y = data.baseY + data.hover * 0.12 - data.press * 0.05;
    data.footswitch.position.y = 0.14 + sizeConfig(data.pedal.size).height / 2 - data.press * 0.06;
    data.led.material.emissiveIntensity = 0.55 + Math.sin(time * 2.2 + index) * 0.12 + data.hover * 0.9;
    data.body.material.shininess = isHovered ? 120 : 90;

    if (frameTime < data.clickCooldown) {
      data.press = 0.65;
    }
  });

  walkers.forEach((walker) => {
    walker.update(frameTime, hoveredPedal);
  });

  if (computerExperience) {
    const computerHovered =
      hoveredTarget === computerExperience.group || hoveredInfo === computerExperience.group;
    computerExperience.update(frameTime, computerHovered);
  }

  hoverOnlyMeshes.forEach((mesh) => {
    if (mesh.userData.hoverTarget && mesh.userData.hoverTarget.userData.hoverMaterial) {
      const isHovered = hoveredInfo === mesh.userData.hoverTarget;
      mesh.userData.hoverTarget.userData.hoverMaterial.emissive.setHex(isHovered ? 0x551111 : 0x220000);
    }
  });

  renderer.render(scene, camera);
}

function animate(now) {
  requestAnimationFrame(animate);
  renderFrame(now);
}

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  setTooltip(hoveredInfo);
}

window.addEventListener("resize", resize);

window.render_game_to_text = () =>
  JSON.stringify({
    coordinateSystem: "origin at scene center, +x right, +y up, +z toward the camera",
    hovered: hoveredInfo?.userData?.pedal?.name || hoveredInfo?.userData?.title || null,
    walkersEnabled,
    retroWindowOpen: computerExperience ? computerExperience.isOpen() : false,
    computer: computerExperience ? computerExperience.getState() : null,
    guitar: { x: 4.8, y: -0.42, z: -4.95 },
    pedals: pedalObjects.map((pedalObject) => ({
      name: pedalObject.userData.pedal.name,
      x: Number(pedalObject.position.x.toFixed(2)),
      y: Number(pedalObject.position.y.toFixed(2)),
      z: Number(pedalObject.position.z.toFixed(2)),
    })),
  });

window.advanceTime = (ms) => {
  manualNow += ms;
  renderFrame(manualNow);
};

main();
animate();
