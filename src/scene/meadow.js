/* ------------------------------------------------------------------
   The sunflower clearing: instanced grass, sunflowers, daisies and
   lavender, all swaying gently with a shared wind uniform.
------------------------------------------------------------------- */

import * as THREE from "three";
import { distanceToPath } from "./terrain.js";
import {
  TAU,
  addWind,
  between,
  choose,
  mergePainted,
  mulberry32,
  paintGeometry,
} from "../utils.js";

const CABIN_CENTER = new THREE.Vector2(-3.35, -2.25);

function leafGeometry(x, y, z, rotationY, length, color) {
  const geometry = new THREE.SphereGeometry(1, 6, 4);
  geometry.scale(0.11, 0.026, length);
  geometry.rotateY(rotationY);
  geometry.translate(x, y, z);
  return paintGeometry(geometry, color);
}

function createSunflowerGeometry() {
  const random = mulberry32(3312);
  const geometries = [];
  const stemColor = "#4f7038";
  const leafColors = ["#54763d", "#5d8042", "#486a34"];
  const petalColors = ["#f2b83f", "#f6c84f", "#e9a92f", "#f8d264"];
  const innerPetalColors = ["#e29b2b", "#d98f25", "#eea934"];

  const stem = new THREE.CylinderGeometry(0.02, 0.03, 1.42, 6);
  stem.translate(0, 0.71, 0);
  geometries.push(paintGeometry(stem, stemColor));

  [
    [0.14, 0.43, 0.03, 1.1, 0.28],
    [-0.14, 0.65, -0.02, 2.4, 0.32],
    [0.12, 0.94, -0.03, 0.4, 0.25],
    [-0.1, 1.12, 0.04, 2.9, 0.22],
  ].forEach(([x, y, z, rotation, length], index) => {
    geometries.push(leafGeometry(x, y, z, rotation, length, leafColors[index % leafColors.length]));
  });

  const headY = 1.52;
  const headZ = 0.04;

  for (let i = 0; i < 14; i += 1) {
    const angle = (i / 14) * TAU;
    const petal = new THREE.CircleGeometry(0.095, 6);
    petal.scale(0.58, 1.85, 1);
    petal.translate(0, 0.22, 0);
    petal.rotateZ(angle);
    petal.translate(0, headY, headZ);
    geometries.push(paintGeometry(petal, choose(random, petalColors)));
  }

  for (let i = 0; i < 11; i += 1) {
    const angle = ((i + 0.5) / 11) * TAU;
    const petal = new THREE.CircleGeometry(0.07, 6);
    petal.scale(0.55, 1.55, 1);
    petal.translate(0, 0.15, 0);
    petal.rotateZ(angle);
    petal.translate(0, headY, headZ + 0.012);
    geometries.push(paintGeometry(petal, choose(random, innerPetalColors)));
  }

  const center = new THREE.CircleGeometry(0.165, 14);
  center.translate(0, headY, headZ + 0.035);
  geometries.push(paintGeometry(center, "#5b381c"));

  for (let i = 0; i < 14; i += 1) {
    const angle = (i / 14) * TAU;
    const radius = 0.025 + (i % 4) * 0.026;
    const seed = new THREE.CircleGeometry(0.014, 5);
    seed.translate(
      Math.cos(angle) * radius,
      headY + Math.sin(angle) * radius,
      headZ + 0.045,
    );
    geometries.push(paintGeometry(seed, i % 2 === 0 ? "#3f2813" : "#714a24"));
  }

  return mergePainted(geometries);
}

function createDaisyGeometry() {
  const geometries = [];
  const stem = new THREE.CylinderGeometry(0.009, 0.012, 0.34, 5);
  stem.translate(0, 0.17, 0);
  geometries.push(paintGeometry(stem, "#5f7d43"));

  geometries.push(leafGeometry(0.06, 0.13, 0.01, 0.7, 0.11, "#668a49"));

  for (let i = 0; i < 11; i += 1) {
    const angle = (i / 11) * TAU;
    const petal = new THREE.CircleGeometry(0.032, 5);
    petal.scale(0.55, 1.95, 1);
    petal.translate(0, 0.055, 0);
    petal.rotateZ(angle);
    petal.translate(0, 0.37, 0.01);
    geometries.push(paintGeometry(petal, i % 3 === 0 ? "#f3ead4" : "#fffaf0"));
  }

  const center = new THREE.CircleGeometry(0.043, 9);
  center.translate(0, 0.37, 0.022);
  geometries.push(paintGeometry(center, "#e7b343"));

  return mergePainted(geometries);
}

function createLavenderGeometry() {
  const geometries = [];
  const stem = new THREE.CylinderGeometry(0.008, 0.012, 0.7, 5);
  stem.translate(0, 0.35, 0);
  geometries.push(paintGeometry(stem, "#617b45"));

  for (let i = 0; i < 3; i += 1) {
    const angle = (i / 3) * TAU;
    geometries.push(
      leafGeometry(
        Math.cos(angle) * 0.06,
        0.18 + i * 0.09,
        Math.sin(angle) * 0.06,
        angle,
        0.1,
        "#6d8a4d",
      ),
    );
  }

  for (let i = 0; i < 9; i += 1) {
    const t = i / 9;
    const bloom = new THREE.SphereGeometry(0.035 - t * 0.012, 5, 4);
    bloom.scale(0.8, 1.5, 0.8);
    bloom.translate(
      Math.sin(t * 7) * 0.025,
      0.7 + t * 0.2,
      Math.cos(t * 5) * 0.02,
    );
    geometries.push(paintGeometry(bloom, i % 2 === 0 ? "#8c7bb0" : "#a08fc4"));
  }

  return mergePainted(geometries);
}

function createGrassGeometry() {
  const positions = [];
  const colors = [];
  const bottom = new THREE.Color("#486330");
  const top = new THREE.Color("#8ea957");
  const blades = 5;

  for (let i = 0; i < blades; i += 1) {
    const angle = (i / blades) * TAU + 0.2;
    const height = 0.34 + (i % 3) * 0.1;
    const width = 0.035;
    const lean = 0.07;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const sideX = -sin * width;
    const sideZ = cos * width;
    const baseX = cos * 0.03;
    const baseZ = sin * 0.03;

    positions.push(
      baseX - sideX,
      0,
      baseZ - sideZ,
      baseX + sideX,
      0,
      baseZ + sideZ,
      baseX + cos * lean,
      height,
      baseZ + sin * lean,
    );

    colors.push(
      bottom.r,
      bottom.g,
      bottom.b,
      bottom.r,
      bottom.g,
      bottom.b,
      top.r,
      top.g,
      top.b,
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function canPlant(x, z, pathSamples, options = {}) {
  const radius = Math.hypot(x, z);
  if (radius > (options.maxRadius ?? 13.4) || radius < (options.minRadius ?? 0)) {
    return false;
  }
  if (Math.hypot(x - CABIN_CENTER.x, z - CABIN_CENTER.y) < (options.cabinClearance ?? 4.0)) {
    return false;
  }
  if (distanceToPath(x, z, pathSamples) < (options.pathClearance ?? 0.7)) {
    return false;
  }
  return true;
}

function samplePoints(random, count, pathSamples, region, options) {
  const points = [];
  let attempts = 0;
  while (points.length < count && attempts < count * 80) {
    attempts += 1;
    let x;
    let z;
    if (region === "front") {
      x = between(random, -9.6, 12.2);
      z = between(random, 1.0, 11.2);
    } else if (region === "edge") {
      const angle = between(random, 0, TAU);
      const radius = between(random, 8.2, 13.2);
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
    } else {
      x = between(random, -12.6, 12.6);
      z = between(random, -11.8, 12.4);
    }

    if (!canPlant(x, z, pathSamples, options)) continue;

    const minDistance = options.minDistance ?? 0;
    if (
      minDistance > 0 &&
      points.some((point) => Math.hypot(point.x - x, point.z - z) < minDistance)
    ) {
      continue;
    }

    points.push({ x, z });
  }
  return points;
}

function instancePlants(scene, geometry, material, points, random, options = {}) {
  const mesh = new THREE.InstancedMesh(geometry, material, points.length);
  mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  mesh.castShadow = options.castShadow ?? false;
  mesh.receiveShadow = options.receiveShadow ?? true;

  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();

  points.forEach((point, index) => {
    const size = between(random, options.minScale ?? 0.8, options.maxScale ?? 1.2);
    const tilt = options.tilt ?? 0.05;
    euler.set(
      between(random, -tilt, tilt),
      between(random, 0, TAU),
      between(random, -tilt, tilt),
      "YXZ",
    );
    quaternion.setFromEuler(euler);
    position.set(point.x, 0.02, point.z);
    scale.set(size * between(random, 0.92, 1.08), size, size * between(random, 0.92, 1.08));
    matrix.compose(position, quaternion, scale);
    mesh.setMatrixAt(index, matrix);
  });

  mesh.instanceMatrix.needsUpdate = true;
  scene.add(mesh);
  return mesh;
}

export function createMeadow(scene, pathSamples) {
  const random = mulberry32(19603);
  const windTime = { value: 0 };

  const grassGeometry = createGrassGeometry();
  const grassMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    roughness: 1,
    metalness: 0,
  });
  addWind(grassMaterial, windTime, 0.075);

  const grassPoints = samplePoints(random, 2100, pathSamples, "all", {
    minRadius: 3.9,
    maxRadius: 13.5,
    cabinClearance: 3.7,
    pathClearance: 0.68,
  });
  instancePlants(scene, grassGeometry, grassMaterial, grassPoints, random, {
    minScale: 0.7,
    maxScale: 1.35,
    tilt: 0.04,
    receiveShadow: true,
  });

  const sunflowerGeometry = createSunflowerGeometry();
  const sunflowerMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    roughness: 0.88,
    metalness: 0,
  });
  addWind(sunflowerMaterial, windTime, 0.045);

  const sunflowerPoints = [
    ...samplePoints(random, 104, pathSamples, "front", {
      minRadius: 4.6,
      maxRadius: 13.2,
      cabinClearance: 4.7,
      pathClearance: 1.05,
      minDistance: 0.58,
    }),
    ...samplePoints(random, 22, pathSamples, "edge", {
      minRadius: 7.4,
      maxRadius: 13.1,
      cabinClearance: 4.7,
      pathClearance: 0.9,
      minDistance: 0.65,
    }),
  ];
  instancePlants(scene, sunflowerGeometry, sunflowerMaterial, sunflowerPoints, random, {
    minScale: 0.68,
    maxScale: 1.18,
    tilt: 0.075,
    castShadow: false,
    receiveShadow: true,
  });

  const daisyGeometry = createDaisyGeometry();
  const daisyMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    roughness: 0.95,
  });
  addWind(daisyMaterial, windTime, 0.06);

  const daisyPoints = samplePoints(random, 110, pathSamples, "all", {
    minRadius: 3.8,
    maxRadius: 13.2,
    cabinClearance: 4.0,
    pathClearance: 0.7,
    minDistance: 0.35,
  });
  instancePlants(scene, daisyGeometry, daisyMaterial, daisyPoints, random, {
    minScale: 0.7,
    maxScale: 1.35,
    tilt: 0.08,
  });

  const lavenderGeometry = createLavenderGeometry();
  const lavenderMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.95,
  });
  addWind(lavenderMaterial, windTime, 0.065);

  const lavenderPoints = samplePoints(random, 46, pathSamples, "edge", {
    minRadius: 7.2,
    maxRadius: 13.1,
    cabinClearance: 4.2,
    pathClearance: 0.9,
    minDistance: 0.4,
  });
  instancePlants(scene, lavenderGeometry, lavenderMaterial, lavenderPoints, random, {
    minScale: 0.7,
    maxScale: 1.15,
    tilt: 0.06,
  });

  return {
    sunflowers: sunflowerPoints,
    update(time) {
      windTime.value = time;
    },
  };
}
