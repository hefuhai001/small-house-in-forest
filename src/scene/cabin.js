/* ------------------------------------------------------------------
   The little cottage: timber frame, mossy terracotta roof, glowing
   windows, a lantern by the arched door and a thin ribbon of smoke.
------------------------------------------------------------------- */

import * as THREE from "three";
import {
  TAU,
  between,
  mergePainted,
  mulberry32,
  paintGeometry,
  roofTexture,
  signTexture,
  softTexture,
} from "../utils.js";

function box(group, width, height, depth, material, x, y, z, rotation = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rotation.x ?? 0, rotation.y ?? 0, rotation.z ?? 0);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function createWindow({ windowMaterial, glowMaterial, withBox, woodMaterial, stoneMaterial }) {
  const group = new THREE.Group();
  const frameMaterial = woodMaterial;

  box(group, 1.34, 1.28, 0.12, frameMaterial, 0, 0, 0);
  const pane = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.9, 0.08), windowMaterial);
  pane.position.z = 0.055;
  group.add(pane);

  box(group, 0.07, 0.92, 0.11, frameMaterial, 0, 0, 0.11);
  box(group, 1.0, 0.07, 0.11, frameMaterial, 0, 0.02, 0.11);
  box(group, 1.5, 0.12, 0.24, frameMaterial, 0, -0.69, 0.02);

  const glow = new THREE.Sprite(glowMaterial);
  glow.scale.set(2.9, 2.9, 1);
  glow.position.z = 0.36;
  group.add(glow);

  if (withBox) {
    box(group, 1.36, 0.26, 0.32, frameMaterial, 0, -0.86, 0.16);
    const soil = box(group, 1.24, 0.06, 0.24, stoneMaterial, 0, -0.72, 0.16);
    soil.castShadow = false;

    const flowerColors = [0xe7a154, 0xf2d089, 0xd96a58, 0xf6ede0];
    for (let i = 0; i < 7; i += 1) {
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.016, 0.22, 4),
        new THREE.MeshStandardMaterial({ color: 0x4d6d3d, roughness: 1 }),
      );
      stem.position.set(-0.5 + i * 0.165, -0.58, 0.24);
      group.add(stem);

      const bloom = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 6, 4),
        new THREE.MeshStandardMaterial({
          color: flowerColors[i % flowerColors.length],
          roughness: 0.9,
          flatShading: true,
        }),
      );
      bloom.position.set(stem.position.x, -0.46, 0.25);
      bloom.scale.set(1, 0.8, 1);
      group.add(bloom);
    }
  }

  return { group, glow };
}

function createStoneBase(group, random, stoneMaterial) {
  const geometries = [];
  const colors = ["#8d8475", "#9b9180", "#7f786b", "#a89a84"];

  for (let i = 0; i < 16; i += 1) {
    const geometry = new THREE.BoxGeometry(between(random, 0.3, 0.44), between(random, 0.26, 0.36), 0.2);
    geometry.rotateY(between(random, -0.12, 0.12));
    geometry.translate(-2.55 + i * 0.34, between(random, 0.12, 0.2), 2.35);
    paintGeometry(geometry, colors[i % colors.length]);
    geometries.push(geometry);
  }

  for (let side = 0; side < 2; side += 1) {
    for (let i = 0; i < 8; i += 1) {
      const geometry = new THREE.BoxGeometry(0.2, between(random, 0.24, 0.34), between(random, 0.3, 0.42));
      geometry.rotateY(between(random, -0.12, 0.12));
      geometry.translate(side === 0 ? -2.65 : 2.65, between(random, 0.1, 0.18), -1.5 + i * 0.42);
      paintGeometry(geometry, colors[(i + side) % colors.length]);
      geometries.push(geometry);
    }
  }

  const base = new THREE.Mesh(
    mergePainted(geometries),
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true }),
  );
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);
}

function createSmoke(scene, origin) {
  const texture = softTexture(128, "rgba(226,225,216,0.9)");
  const particles = [];

  for (let i = 0; i < 18; i += 1) {
    const material = new THREE.SpriteMaterial({
      map: texture,
      color: 0xc8c9c1,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      fog: true,
    });
    const sprite = new THREE.Sprite(material);
    sprite.renderOrder = 2;
    scene.add(sprite);
    particles.push({
      sprite,
      age: Math.random() * 6,
      life: 5.5 + Math.random() * 3,
      speed: 0.42 + Math.random() * 0.36,
      drift: 0.15 + Math.random() * 0.35,
      phase: Math.random() * TAU,
      baseScale: 0.5 + Math.random() * 0.4,
    });
  }

  return function updateSmoke(delta) {
    particles.forEach((particle) => {
      particle.age += delta;
      if (particle.age > particle.life) {
        particle.age = 0;
        particle.speed = 0.42 + Math.random() * 0.36;
        particle.phase = Math.random() * TAU;
      }
      const progress = particle.age / particle.life;
      const { sprite } = particle;
      sprite.position.set(
        origin.x + Math.sin(particle.phase + particle.age * 1.2) * particle.drift * progress,
        origin.y + particle.age * particle.speed,
        origin.z + Math.cos(particle.phase + particle.age * 0.8) * particle.drift * progress,
      );
      const size = particle.baseScale * (1 + progress * 3.2);
      sprite.scale.set(size, size, 1);
      sprite.material.opacity = Math.sin(progress * Math.PI) * 0.24;
    });
  };
}

export function createCabin(scene) {
  const random = mulberry32(7813);
  const group = new THREE.Group();
  group.name = "cabin";
  group.position.set(-3.35, 0, -2.25);
  group.rotation.y = 0.16;

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0xdcc8a3,
    roughness: 0.96,
    metalness: 0,
  });
  const woodMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a3424,
    roughness: 0.92,
    metalness: 0,
    flatShading: true,
  });
  const roofMaterial = new THREE.MeshStandardMaterial({
    map: roofTexture(),
    color: 0xffffff,
    roughness: 0.92,
    metalness: 0,
  });
  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b8374,
    roughness: 1,
    metalness: 0,
    flatShading: true,
  });
  const mossMaterial = new THREE.MeshStandardMaterial({
    color: 0x688042,
    roughness: 1,
    flatShading: true,
  });
  const doorMaterial = new THREE.MeshStandardMaterial({
    color: 0x425e43,
    roughness: 0.88,
    flatShading: true,
  });
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0xffc46d,
    emissive: 0xff9d43,
    emissiveIntensity: 1.5,
    roughness: 0.65,
  });
  const windowGlowMaterial = new THREE.SpriteMaterial({
    map: softTexture(128),
    color: 0xffc36e,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
  });
  const brassMaterial = new THREE.MeshStandardMaterial({
    color: 0xc39b56,
    roughness: 0.36,
    metalness: 0.65,
  });

  box(group, 5.7, 0.55, 4.7, stoneMaterial, 0, 0.275, 0);
  box(group, 5.2, 3.2, 4.2, wallMaterial, 0, 2.1, 0);

  // Exposed timber frame.
  [-2.58, 2.58].forEach((x) => {
    [-2.08, 2.08].forEach((z) => {
      box(group, 0.18, 3.32, 0.18, woodMaterial, x, 2.1, z);
    });
  });
  [0.61, 3.55].forEach((y) => {
    box(group, 5.34, 0.15, 0.13, woodMaterial, 0, y, 2.12);
    box(group, 5.34, 0.15, 0.13, woodMaterial, 0, y, -2.12);
  });
  [-0.6, 0.6].forEach((z) => {
    box(group, 0.13, 3.3, 0.15, woodMaterial, 2.62, 2.1, z);
  });

  // Gable triangles and roof trim.
  const gableShape = new THREE.Shape();
  gableShape.moveTo(-2.6, 0);
  gableShape.lineTo(2.6, 0);
  gableShape.lineTo(0, 1.82);
  gableShape.closePath();
  const gableGeometry = new THREE.ShapeGeometry(gableShape);

  const frontGable = new THREE.Mesh(gableGeometry, wallMaterial);
  frontGable.position.set(0, 3.7, 2.09);
  frontGable.castShadow = true;
  group.add(frontGable);

  const backGable = new THREE.Mesh(gableGeometry, wallMaterial);
  backGable.position.set(0, 3.7, -2.09);
  backGable.rotation.y = Math.PI;
  backGable.castShadow = true;
  group.add(backGable);

  const roofAngle = 0.605;
  [-1, 1].forEach((side) => {
    const panel = box(
      group,
      3.5,
      0.17,
      4.95,
      roofMaterial,
      side * 1.32,
      4.52,
      0,
      { z: -side * roofAngle },
    );
    panel.castShadow = true;

    const trim = box(
      group,
      3.28,
      0.12,
      0.16,
      woodMaterial,
      side * 1.35,
      4.42,
      2.47,
      { z: -side * roofAngle },
    );
    trim.castShadow = true;
  });

  box(group, 0.28, 0.2, 5.05, woodMaterial, 0, 5.53, 0);
  box(group, 6.42, 0.12, 0.18, woodMaterial, 0, 3.58, 2.48);
  box(group, 6.42, 0.12, 0.18, woodMaterial, 0, 3.58, -2.48);

  [-1, 1].forEach((side) => {
    const length = 3.22;
    const brace = box(
      group,
      0.13,
      length,
      0.14,
      woodMaterial,
      side * 1.31,
      4.57,
      2.16,
      { z: -side * Math.atan(1.82 / 2.6) },
    );
    brace.castShadow = true;
  });

  // Chimney.
  box(group, 0.84, 2.25, 0.84, stoneMaterial, -1.45, 5.55, -0.95);
  box(group, 1.02, 0.18, 1.02, stoneMaterial, -1.45, 6.72, -0.95);
  box(group, 0.4, 0.18, 0.4, woodMaterial, -1.45, 6.84, -0.95);

  // Moss growing along the roof.
  const mossPatches = [
    [-1.95, 3.98, 1.3, 0.52, 0.7],
    [-2.2, 4.15, -0.8, 0.4, 0.55],
    [1.8, 4.05, -1.5, 0.5, 0.65],
    [2.18, 3.88, 0.85, 0.4, 0.55],
    [-1.55, 4.6, -1.8, 0.32, 0.42],
    [1.2, 4.85, 1.9, 0.3, 0.38],
  ];
  mossPatches.forEach(([x, y, z, sx, sy]) => {
    const moss = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), mossMaterial);
    moss.scale.set(sx, 0.13, sy);
    moss.position.set(x, y, z);
    moss.rotation.y = random() * TAU;
    moss.castShadow = true;
    group.add(moss);
  });

  // Arched timber frame and green door.
  const doorOutline = new THREE.Shape();
  doorOutline.moveTo(-0.68, 0);
  doorOutline.lineTo(-0.68, 1.28);
  doorOutline.quadraticCurveTo(-0.68, 1.82, 0, 1.94);
  doorOutline.quadraticCurveTo(0.68, 1.82, 0.68, 1.28);
  doorOutline.lineTo(0.68, 0);
  doorOutline.closePath();

  const frameGeometry = new THREE.ExtrudeGeometry(doorOutline, {
    depth: 0.1,
    bevelEnabled: false,
  });
  const doorFrame = new THREE.Mesh(frameGeometry, woodMaterial);
  doorFrame.position.set(-1.02, 0.55, 2.07);
  doorFrame.castShadow = true;
  group.add(doorFrame);

  const doorShape = new THREE.Shape();
  doorShape.moveTo(-0.56, 0);
  doorShape.lineTo(-0.56, 1.26);
  doorShape.quadraticCurveTo(-0.56, 1.7, 0, 1.81);
  doorShape.quadraticCurveTo(0.56, 1.7, 0.56, 1.26);
  doorShape.lineTo(0.56, 0);
  doorShape.closePath();

  const doorGeometry = new THREE.ExtrudeGeometry(doorShape, {
    depth: 0.08,
    bevelEnabled: false,
  });
  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(-1.02, 0.58, 2.17);
  door.castShadow = true;
  group.add(door);

  [-0.36, -0.12, 0.12, 0.36].forEach((x) => {
    box(group, 0.022, 1.16, 0.025, woodMaterial, -1.02 + x, 1.27, 2.27);
  });

  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), brassMaterial);
  knob.position.set(-0.57, 1.35, 2.3);
  group.add(knob);

  const wreath = new THREE.Mesh(
    new THREE.TorusGeometry(0.2, 0.042, 6, 16),
    new THREE.MeshStandardMaterial({ color: 0x48683c, roughness: 1 }),
  );
  wreath.position.set(-1.02, 1.96, 2.31);
  wreath.castShadow = true;
  group.add(wreath);

  [0, 2.1, 4.2].forEach((angle, index) => {
    const berry = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 6, 4),
      new THREE.MeshStandardMaterial({ color: 0xa84d3e, roughness: 0.9 }),
    );
    berry.position.set(
      -1.02 + Math.cos(angle) * 0.2,
      1.96 + Math.sin(angle) * 0.2,
      2.35,
    );
    berry.scale.setScalar(index === 1 ? 0.9 : 1);
    group.add(berry);
  });

  // Little sign above the door.
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(1.34, 0.42),
    new THREE.MeshStandardMaterial({
      map: signTexture(),
      transparent: true,
      roughness: 0.9,
      alphaTest: 0.02,
    }),
  );
  sign.position.set(-1.02, 3.1, 2.2);
  group.add(sign);

  // Round attic window.
  const atticRing = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.065, 6, 24), woodMaterial);
  atticRing.position.set(-0.25, 4.45, 2.13);
  group.add(atticRing);

  const atticPane = new THREE.Mesh(new THREE.CircleGeometry(0.3, 24), windowMaterial);
  atticPane.position.set(-0.25, 4.45, 2.12);
  group.add(atticPane);

  const atticBar = box(group, 0.04, 0.58, 0.05, woodMaterial, -0.25, 4.45, 2.15);
  atticBar.castShadow = false;

  // Front and side windows with overflowing flower boxes.
  const frontWindow = createWindow({
    windowMaterial,
    glowMaterial: windowGlowMaterial,
    woodMaterial,
    stoneMaterial,
    withBox: true,
  });
  frontWindow.group.position.set(1.35, 2.3, 2.13);
  group.add(frontWindow.group);

  const sideWindow = createWindow({
    windowMaterial,
    glowMaterial: windowGlowMaterial,
    woodMaterial,
    stoneMaterial,
    withBox: true,
  });
  sideWindow.group.position.set(2.63, 2.3, 0.25);
  sideWindow.group.rotation.y = Math.PI / 2;
  group.add(sideWindow.group);

  // Porch.
  box(group, 0.16, 2.95, 0.16, woodMaterial, -2.33, 1.48, 3.15);
  box(group, 0.16, 2.95, 0.16, woodMaterial, 0.22, 1.48, 3.15);
  box(group, 3.0, 0.15, 0.18, woodMaterial, -1.05, 2.94, 3.15);
  box(group, 3.2, 0.14, 1.85, roofMaterial, -1.05, 3.02, 2.9, { x: 0.15 });
  box(group, 0.13, 0.13, 1.6, woodMaterial, -2.26, 2.62, 2.78, { x: 0.8 });
  box(group, 0.13, 0.13, 1.6, woodMaterial, 0.15, 2.62, 2.78, { x: 0.8 });

  // Door steps.
  box(group, 1.55, 0.18, 0.62, stoneMaterial, -1.02, 0.12, 2.53);
  box(group, 1.75, 0.15, 0.46, stoneMaterial, -1.02, 0.075, 2.92);

  // Hanging lantern.
  const lantern = new THREE.Group();
  lantern.position.set(-1.94, 2.68, 3.03);
  group.add(lantern);

  const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.42, 5), woodMaterial);
  chain.position.y = 0.3;
  lantern.add(chain);

  const lanternTop = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.11, 0.1, 6), woodMaterial);
  lanternTop.position.y = 0.06;
  lantern.add(lanternTop);

  const lanternMaterial = new THREE.MeshStandardMaterial({
    color: 0xffcf87,
    emissive: 0xff9b3f,
    emissiveIntensity: 2.2,
    transparent: true,
    opacity: 0.9,
    roughness: 0.5,
  });
  const lanternGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.3, 6), lanternMaterial);
  lanternGlass.position.y = -0.11;
  lantern.add(lanternGlass);

  const lanternBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.08, 6), woodMaterial);
  lanternBase.position.y = -0.29;
  lantern.add(lanternBase);

  const lanternGlowMaterial = new THREE.SpriteMaterial({
    map: softTexture(128),
    color: 0xffb35e,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
  });
  const lanternGlow = new THREE.Sprite(lanternGlowMaterial);
  lanternGlow.scale.set(1.6, 1.6, 1);
  lanternGlow.position.y = -0.1;
  lantern.add(lanternGlow);

  const porchLight = new THREE.PointLight(0xffb15b, 2.4, 7.5, 2);
  porchLight.position.set(-1.9, 2.45, 3.1);
  group.add(porchLight);

  const windowLight = new THREE.PointLight(0xffb96a, 2.2, 8, 2);
  windowLight.position.set(1.0, 2.35, 2.4);
  group.add(windowLight);

  createStoneBase(group, random, stoneMaterial);

  scene.add(group);
  group.updateMatrixWorld(true);
  const chimneyTop = new THREE.Vector3(-1.45, 6.95, -0.95).applyMatrix4(group.matrixWorld);
  const updateSmoke = createSmoke(scene, chimneyTop);

  return {
    group,
    windowMaterial,
    windowGlowMaterial,
    lanternMaterial,
    lanternGlowMaterial,
    porchLight,
    windowLight,
    updateSmoke,
  };
}
