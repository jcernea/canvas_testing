import * as THREE from 'three'
import "./style.css"
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import * as dat from 'dat.gui'
let canvas, renderer;

/* Tex stuff */
const loadingManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loadingManager);

loadingManager.onStart = (tex) => {
  console.log(tex)
}

const colorTexture = new textureLoader.load('/tex/Facade003_4K_Color.jpg')
const normalTexture = new textureLoader.load('/tex/Facade003_4K_Normal.jpg')
const displacementTexture = new textureLoader.load('/tex/Facade003_4K_Displacement.jpg')
const roughnessTexture = new textureLoader.load('/tex/Facade003_4K_Roughness.jpg')

/* Tex stuff end */

const GUI = new dat.GUI()
let config = {SCENE_COUNT: 100, TEXTURE_ENABLE: false, ANIM_X: 100, ANIM_Y: 100}

GUI.add(config, "SCENE_COUNT", 1, 300, 1).onFinishChange(() => init()).name("Scene Count")
GUI.add(config, "TEXTURE_ENABLE", 1, 300, 1).onFinishChange(() => init()).name("Enable 4K Texture")
GUI.add(config, "ANIM_X", 1, 300, 1).name("X Axis Animation Speed")
GUI.add(config, "ANIM_Y", 1, 300, 1).name("Y Axis Animation Speed")

var guiContainer = document.getElementById("guicontainer")
guiContainer.appendChild(GUI.domElement)


let scenes = [];

init();
animate();

function init() {
  canvas = document.getElementById("multicanvas");
  scenes = [] // Clear scenes
  const geometries = [
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.SphereGeometry(0.5, 100, 100),
    new THREE.DodecahedronGeometry(0.5),
    new THREE.CylinderGeometry(0.5, 0.5, 1, 12),
  ];

  const content = document.getElementById("content");
  content.innerHTML = ''

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

    if(config.TEXTURE_ENABLE){
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

function updateSize() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  if (canvas.width !== width || canvas.height !== height) {
    renderer.setSize(width, height, false);
  }
}

function animate() {
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
