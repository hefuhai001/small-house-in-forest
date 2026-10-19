/* ------------------------------------------------------------------
   Entry point for Moss & Meadow. Builds the diorama, wires the weather
   controls and runs the render loop.
------------------------------------------------------------------- */

import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createTerrain } from "./scene/terrain.js";
import { createCabin } from "./scene/cabin.js";
import { createForest } from "./scene/forest.js";
import { createMeadow } from "./scene/meadow.js";
import { createCreatures } from "./scene/creatures.js";
import { createWeather } from "./scene/weather.js";

const canvas = document.querySelector("#scene");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  38,
  window.innerWidth / window.innerHeight,
  0.1,
  400,
);
camera.position.set(21, 14.5, 25);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 3.1, 0.8);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enablePan = false;
controls.minDistance = 16;
controls.maxDistance = 40;
controls.minPolarAngle = 0.56;
controls.maxPolarAngle = 1.37;
controls.rotateSpeed = 0.55;
controls.zoomSpeed = 0.7;
controls.autoRotateSpeed = 0.5;
controls.update();

const terrain = createTerrain(scene);
const cabin = createCabin(scene);
const forest = createForest(scene);
const meadow = createMeadow(scene, terrain.pathSamples);

cabin.group.updateMatrixWorld(true);
const birdAnchor = new THREE.Vector3(0.55, 5.64, 1.45).applyMatrix4(cabin.group.matrixWorld);

const creatures = createCreatures(scene, {
  owlAnchor: forest.owlAnchor,
  squirrelAnchor: forest.squirrelAnchor,
  birdAnchor,
  flowers: meadow.sunflowers,
});

const weather = createWeather({ scene, camera, renderer, cabin });

const statuses = {
  sunny: "阳光正穿过树冠",
  misty: "雾气从林间漫上来",
  dusk: "屋檐的灯刚刚点亮",
  rainy: "雨点敲在蘑菇伞上",
};

const weatherButtons = [...document.querySelectorAll(".weather-btn")];
const readout = document.querySelector("#weather-readout");
const statusPill = document.querySelector(".status-pill");
const orbitButton = document.querySelector("#orbit-toggle");

function updateReadout(name) {
  readout.textContent = statuses[name];
  statusPill.classList.remove("is-changing");
  void statusPill.offsetWidth;
  statusPill.classList.add("is-changing");
}

function selectWeather(name) {
  const changed = weather.set(name);
  if (!changed && document.body.dataset.weather === name) return;

  document.body.dataset.weather = name;
  weatherButtons.forEach((button) => {
    const active = button.dataset.weather === name;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  updateReadout(name);
}

weatherButtons.forEach((button) => {
  button.addEventListener("click", () => selectWeather(button.dataset.weather));
});

const keyMap = {
  1: "sunny",
  2: "misty",
  3: "dusk",
  4: "rainy",
};

window.addEventListener("keydown", (event) => {
  const weatherName = keyMap[event.key];
  if (!weatherName) return;
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    return;
  }
  selectWeather(weatherName);
});

orbitButton.addEventListener("click", () => {
  controls.autoRotate = !controls.autoRotate;
  orbitButton.setAttribute("aria-pressed", String(controls.autoRotate));
});

canvas.addEventListener("pointerdown", () => {
  canvas.classList.add("is-dragging");
});

window.addEventListener("pointerup", () => {
  canvas.classList.remove("is-dragging");
});

window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
});

const clock = new THREE.Clock();
let elapsed = 0;

function animate() {
  const delta = Math.min(clock.getDelta(), 0.05);
  elapsed += delta;

  controls.update();
  forest.update(elapsed);
  meadow.update(elapsed);
  creatures.update(elapsed, delta);
  cabin.updateSmoke(delta);
  weather.update(delta, elapsed);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

requestAnimationFrame(() => {
  setTimeout(() => {
    document.body.classList.add("is-ready");
  }, 650);
});
