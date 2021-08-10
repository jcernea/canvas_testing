import * as THREE from "three";
import "./style.css";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
import Stats from "three/examples/jsm/libs/stats.module";
let canvas, renderer;

/* Tex stuff */
const loadingManager = new THREE.LoadingManager();

loadingManager.onLoad = function () {
  console.log("loaded");
};

loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
  console.log(
    "Started loading file: " +
      url +
      ".\nLoaded " +
      itemsLoaded +
      " of " +
      itemsTotal +
      " files."
  );
};
const textureLoader = new THREE.TextureLoader(loadingManager);

const colorTexture = new textureLoader.load("/tex/Facade003_4K_Color.jpg");
const normalTexture = new textureLoader.load("/tex/Facade003_4K_Normal.jpg");
const displacementTexture = new textureLoader.load(
  "/tex/Facade003_4K_Displacement.jpg"
);
const roughnessTexture = new textureLoader.load(
  "/tex/Facade003_4K_Roughness.jpg"
);

const starParticleTexture = new textureLoader.load(
  "/tex/particles/star_07.png"
);
const muzzleParticleTexture = new textureLoader.load(
  "/tex/particles/muzzle_04.png"
);
const scorchParticleTexture = new textureLoader.load(
  "/tex/particles/scorch_01.png"
);
const heartParticleTexture = new textureLoader.load(
  "/tex/particles/symbol_01.png"
);
const windowParticleTexture = new textureLoader.load(
  "/tex/particles/window_04.png"
);

const PARTICLE_TEXTURES = {
  "Star": 1,
  "Scorch": 2,
  "Muzzle": 3,
  "Heart": 4,
  "Window": 5,
}


/* Tex stuff end */

/* GUI Stuff */
const GUI = new dat.GUI({ width: 400 });
let config = {
  SCENE_COUNT: 100,
  TEXTURE_ENABLE: false,
  PARTICLE_ENABLE: false,
  PARTICLE_COUNT: 100,
  PARTICLE_TEX: '1', 
  ANIM_X: 10,
  ANIM_Y: 20,
};
/* Annoying :/ */
let mainTex = starParticleTexture

function texSwitch(id){
  switch(id){
    case '1':
      mainTex = starParticleTexture
      break;
    case '2':
      mainTex = scorchParticleTexture
      break;
    case '3':
      mainTex = muzzleParticleTexture
      break;
    case '4':
      mainTex = heartParticleTexture
      break;
    case '5':
      mainTex = windowParticleTexture
      break;
    default:
      mainTex = starParticleTexture
  }
}

console.log(config)
GUI.add(config, "SCENE_COUNT", 1, 300, 1)
  .onFinishChange(() => init())
  .name("Scene Count");
GUI.add(config, "TEXTURE_ENABLE", 1, 300, 1)
  .onFinishChange(() => init())
  .name("Enable 4K Texture");
GUI.add(config, "PARTICLE_ENABLE", 1, 300, 1)
  .onFinishChange(() => addParticles())
  .name("Enable Particles");
GUI.add(config, "PARTICLE_COUNT", 1, 10000, 1)
  .name("Particle Count")
  .onFinishChange(() => addParticles(true));
GUI.add(config, "ANIM_X", 1, 300, 1).name("X Axis Animation Speed");
GUI.add(config, "ANIM_Y", 1, 300, 1).name("Y Axis Animation Speed");
GUI.add(config, "PARTICLE_TEX", PARTICLE_TEXTURES)
  .name("Particle Texture").onFinishChange(() => {texSwitch(config.PARTICLE_TEX); addParticles(true)} )

var guiContainer = document.getElementById("guicontainer");
guiContainer.appendChild(GUI.domElement);
/* Gui End */

/* Stats stuff */
const stats = new Stats();
stats.dom.id = "stats";
document.body.appendChild(stats.dom);
/* Stats end */

let scenes = [];

init();
animate();

function init() {
  canvas = document.getElementById("multicanvas");
  scenes = []; // Clear scenes
  const points = [];
  for (let i = 0; i < 2; i++) {
    points.push(
      new THREE.Vector2(
        Math.sin(i * 0.02) * Math.sin(i * 0.05) * 1 + 0.2,
        (i - 0.5) * 2
      )
    );
  }
  const geometries = [
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.SphereGeometry(0.5, 100, 100),
    new THREE.DodecahedronGeometry(0.5),
    new THREE.CylinderGeometry(0.5, 0.5, 1, 12),
    new THREE.IcosahedronGeometry(0.5, 1),
    new THREE.LatheGeometry(points, 20),
    new THREE.TorusGeometry(0.5, 0.2, 20, 20),
    new THREE.TorusKnotGeometry(0.5, 0.1, 50, 20),
  ];

  const content = document.getElementById("content");
  content.innerHTML = "";

  for (let i = 0; i < config.SCENE_COUNT; i++) {
    const scene = new THREE.Scene();

    // make a list item
    const element = document.createElement("div");
    element.className = "list-item";

    const sceneElement = document.createElement("div");
    element.appendChild(sceneElement);

    const descriptionElement = document.createElement("div");
    descriptionElement.innerText = "Scene " + (i + 1);
    element.appendChild(descriptionElement);

    // the element that represents the area we want to render the scene
    scene.userData.element = sceneElement;
    content.appendChild(element);

    const camera = new THREE.PerspectiveCamera(50, 1, 1, 10);
    camera.position.z = 2;
    scene.userData.camera = camera;

    const controls = new OrbitControls(
      scene.userData.camera,
      scene.userData.element
    );
    controls.minDistance = 2;
    controls.maxDistance = 5;
    controls.enablePan = false;
    controls.enableZoom = false;
    scene.userData.controls = controls;

    // add one random mesh to each scene
    const geometry = geometries[(geometries.length * Math.random()) | 0];

    let material = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(Math.random(), 1, 0.75),
      roughness: 0.5,
      metalness: 0,
      flatShading: true,
    });

    if (config.TEXTURE_ENABLE) {
      /* Texture Mode */
      material = new THREE.MeshStandardMaterial({
        //color: new THREE.Color().setHSL(Math.random(), 1, 0.75),
        map: colorTexture,
        normalMap: normalTexture,
        displacementMap: displacementTexture,
        displacementScale: 0.01,
        roughnessMap: roughnessTexture,
        roughness: 0.5,
        metalness: 0,
        flatShading: true,
      });
    }

    scene.add(new THREE.Mesh(geometry, material));

    scene.add(new THREE.HemisphereLight(0xaaaaaa, 0x444444));

    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(1, 1, 1);
    scene.add(light);

    scenes.push(scene);
  }

  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setClearColor(0xffffff, 1);
  renderer.setPixelRatio(window.devicePixelRatio);
}

function addParticles(isChanged) {
  scenes.forEach(function (scene) {
    /* Particle Stuff */
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = config.PARTICLE_COUNT;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      particlePositions[i] = (Math.random() - 0.5) * 3;
      particleColors[i] = Math.random();
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
    particlesGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(particleColors, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      alphaMap: mainTex,
      sizeAttenuation: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    /* Particle Stuff End */
    if (config.PARTICLE_ENABLE) {
      if (isChanged) {
        scene.remove(scene.userData.particles);
      }
      const justParticles = new THREE.Points(
        particlesGeometry,
        particlesMaterial
      );
      scene.userData.particles = justParticles;
      scene.add(scene.userData.particles);
    } else {
      scene.remove(scene.userData.particles);
    }
  });
}

function updateSize() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  if (canvas.width !== width || canvas.height !== height) {
    renderer.setSize(width, height, false);
  }
}

function animate() {
  stats.update();
  render();
  requestAnimationFrame(animate);
}

function render() {
  updateSize();

  canvas.style.transform = `translateY(${window.scrollY}px)`;

  renderer.setClearColor(0x000);
  renderer.setScissorTest(false);
  renderer.clear();

  renderer.setClearColor(0x000);
  renderer.setScissorTest(true);

  scenes.forEach(function (scene) {
    // so something moves
    scene.children[0].rotation.y = Date.now() * (0.00002 * config.ANIM_Y);
    scene.children[0].rotation.x = Date.now() * (0.00002 * config.ANIM_X);

    // get the element that is a place holder for where we want to
    // draw the scene
    const element = scene.userData.element;

    // get its position relative to the page's viewport
    const rect = element.getBoundingClientRect();

    // check if it's offscreen. If so skip it
    if (
      rect.bottom < 0 ||
      rect.top > renderer.domElement.clientHeight ||
      rect.right < 0 ||
      rect.left > renderer.domElement.clientWidth
    ) {
      return; // it's off screen
    }

    // set the viewport
    const width = rect.right - rect.left;
    const height = rect.bottom - rect.top;
    const left = rect.left;
    const bottom = renderer.domElement.clientHeight - rect.bottom;

    renderer.setViewport(left, bottom, width, height);
    renderer.setScissor(left, bottom, width, height);

    const camera = scene.userData.camera;

    //camera.aspect = width / height; // not changing in this example
    //camera.updateProjectionMatrix();

    //scene.userData.controls.update();

    renderer.render(scene, camera);
  });
}
