/* ------------------------------------------------------------------
   Low-poly woodland: broadleaf and pine trees, a mossy understory,
   and two feature trees that carry the cabin's tiny animal neighbours.
------------------------------------------------------------------- */

import * as THREE from "three";
import {
  TAU,
  between,
  choose,
  cylinderBetween,
  mergePainted,
  mulberry32,
  paintGeometry,
} from "../utils.js";

const TRUNK_COLORS = ["#5a4431", "#624b35", "#523d2c", "#6b5137"];
const LEAF_COLORS = ["#3f5f34", "#4c6c39", "#5b7c40", "#6d8a46", "#7c974d"];
const PINE_COLORS = ["#2f4a33", "#38563a", "#426342", "#4e7047"];

const barkMaterial = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: 1,
  metalness: 0,
  flatShading: true,
});

const leafMaterial = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: 1,
  metalness: 0,
  flatShading: true,
});

function createBroadleaf(random, options = {}) {
  const height = options.height ?? 8;
  const spread = options.spread ?? 2.8;
  const trunkRadius = options.trunkRadius ?? 0.42;
  const group = new THREE.Group();
  const trunkGeometries = [];

  const leanX = between(random, -0.28, 0.28);
  const leanZ = between(random, -0.28, 0.28);
  const lower = new THREE.Vector3(0, 0, 0);
  const middle = new THREE.Vector3(leanX * 0.8, height * 0.43, leanZ * 0.8);
  const upper = new THREE.Vector3(leanX * 1.55, height * 0.73, leanZ * 1.55);

  trunkGeometries.push(
    paintGeometry(
      cylinderBetween(lower, middle, trunkRadius, trunkRadius * 0.75, 7),
      choose(random, TRUNK_COLORS),
    ),
  );
  trunkGeometries.push(
    paintGeometry(
      cylinderBetween(middle, upper, trunkRadius * 0.73, trunkRadius * 0.48, 7),
      choose(random, TRUNK_COLORS),
    ),
  );

  const branchCount = 3 + Math.floor(random() * 2);
  for (let i = 0; i < branchCount; i += 1) {
    const t = between(random, 0.48, 0.74);
    const start = new THREE.Vector3(leanX * t * 1.3, height * t, leanZ * t * 1.3);
    const angle = (i / branchCount) * TAU + between(random, -0.6, 0.6);
    const reach = spread * between(random, 0.48, 0.9);
    const end = new THREE.Vector3(
      start.x + Math.cos(angle) * reach,
      start.y + between(random, 0.6, 1.7),
      start.z + Math.sin(angle) * reach,
    );
    trunkGeometries.push(
      paintGeometry(
        cylinderBetween(start, end, trunkRadius * 0.32, trunkRadius * 0.11, 5),
        choose(random, TRUNK_COLORS),
      ),
    );
  }

  const trunk = new THREE.Mesh(mergePainted(trunkGeometries), barkMaterial);
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  group.add(trunk);

  const canopyGeometries = [];
  const clusterCount = 7 + Math.floor(random() * 4);
  const canopyCenter = new THREE.Vector3(leanX * 1.8, height * 0.86, leanZ * 1.8);

  for (let i = 0; i < clusterCount; i += 1) {
    const radius = between(random, 0.8, 1.55) * (spread / 2.8);
    const geometry = new THREE.IcosahedronGeometry(radius, 1);
    const angle = between(random, 0, TAU);
    const distance = between(random, 0, spread * 0.72);
    geometry.scale(
      between(random, 0.9, 1.3),
      between(random, 0.66, 0.95),
      between(random, 0.9, 1.3),
    );
    geometry.rotateY(between(random, 0, TAU));
    geometry.rotateX(between(random, -0.2, 0.2));
    geometry.translate(
      canopyCenter.x + Math.cos(angle) * distance,
      canopyCenter.y + between(random, -0.8, 1.15),
      canopyCenter.z + Math.sin(angle) * distance,
    );
    paintGeometry(geometry, choose(random, LEAF_COLORS));
    canopyGeometries.push(geometry);
  }

  const canopy = new THREE.Mesh(mergePainted(canopyGeometries), leafMaterial);
  canopy.castShadow = true;
  canopy.receiveShadow = true;
  group.add(canopy);

  return { group, canopy, height, trunkRadius };
}

function createPine(random, options = {}) {
  const height = options.height ?? 8.5;
  const group = new THREE.Group();

  const trunkGeometry = paintGeometry(
    cylinderBetween(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, height * 0.72, 0),
      height * 0.043,
      height * 0.021,
      7,
    ),
    choose(random, TRUNK_COLORS),
  );
  const trunk = new THREE.Mesh(trunkGeometry, barkMaterial);
  trunk.castShadow = true;
  group.add(trunk);

  const layers = 4 + Math.floor(random() * 2);
  const canopyGeometries = [];
  for (let i = 0; i < layers; i += 1) {
    const t = i / layers;
    const coneHeight = height * between(random, 0.29, 0.36);
    const radius = height * between(random, 0.17, 0.23) * (1 - t * 0.58);
    const geometry = new THREE.ConeGeometry(radius, coneHeight, 8, 1);
    geometry.rotateY(between(random, 0, TAU));
    geometry.translate(
      between(random, -0.08, 0.08),
      height * 0.35 + t * height * 0.46 + coneHeight * 0.18,
      between(random, -0.08, 0.08),
    );
    paintGeometry(geometry, PINE_COLORS[Math.min(i, PINE_COLORS.length - 1)]);
    canopyGeometries.push(geometry);
  }

  const canopy = new THREE.Mesh(mergePainted(canopyGeometries), leafMaterial);
  canopy.castShadow = true;
  canopy.receiveShadow = true;
  group.add(canopy);

  return { group, canopy, height };
}

function createUnderstory(random) {
  const geometries = [];
  const positions = [
    [-11.8, 3.9, 1.2],
    [-10.9, 7.1, 0.9],
    [-8.1, 8.9, 1.3],
    [-5.8, 10.4, 0.8],
    [-12.0, -1.2, 1.1],
    [-10.4, -6.4, 1.3],
    [-6.9, -8.5, 0.9],
    [-2.8, -9.0, 1.2],
    [1.2, -8.8, 1.0],
    [5.3, -8.0, 1.3],
    [8.6, -6.0, 1.0],
    [11.2, -2.8, 1.2],
    [11.8, 2.1, 0.9],
    [10.1, 5.9, 1.1],
    [7.0, 9.5, 0.8],
    [-3.9, 8.1, 0.9],
    [-1.8, -5.9, 0.8],
    [5.0, 3.9, 0.65],
  ];

  positions.forEach(([x, z, scale]) => {
    const bush = new THREE.IcosahedronGeometry(0.9, 0);
    bush.scale(
      scale * between(random, 1.3, 1.8),
      scale * between(random, 0.65, 1.05),
      scale * between(random, 1.2, 1.7),
    );
    bush.rotateY(between(random, 0, TAU));
    bush.translate(x, scale * 0.45, z);
    paintGeometry(bush, choose(random, LEAF_COLORS));
    geometries.push(bush);

    if (random() > 0.4) {
      const companion = new THREE.IcosahedronGeometry(0.65, 0);
      companion.scale(
        scale * between(random, 1.1, 1.6),
        scale * between(random, 0.55, 0.85),
        scale * between(random, 1.1, 1.6),
      );
      companion.translate(x + between(random, -1, 1), scale * 0.32, z + between(random, -1, 1));
      paintGeometry(companion, choose(random, LEAF_COLORS));
      geometries.push(companion);
    }
  });

  const mesh = new THREE.Mesh(mergePainted(geometries), leafMaterial);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createFallenLog(random) {
  const group = new THREE.Group();
  const logMaterial = new THREE.MeshStandardMaterial({
    color: 0x5b4430,
    roughness: 1,
    flatShading: true,
  });
  const cutMaterial = new THREE.MeshStandardMaterial({
    color: 0xa88256,
    roughness: 1,
    flatShading: true,
  });
  const mossMaterial = new THREE.MeshStandardMaterial({
    color: 0x668347,
    roughness: 1,
    flatShading: true,
  });

  const log = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.43, 2.7, 8), logMaterial);
  log.rotation.z = Math.PI / 2;
  log.rotation.y = -0.42;
  log.position.y = 0.38;
  log.castShadow = true;
  log.receiveShadow = true;
  group.add(log);

  const cut = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.04, 8), cutMaterial);
  cut.rotation.z = Math.PI / 2;
  cut.rotation.y = -0.42;
  cut.position.set(-1.27, 0.38, 0.52);
  group.add(cut);

  const moss = new THREE.Mesh(new THREE.IcosahedronGeometry(0.58, 0), mossMaterial);
  moss.scale.set(1.4, 0.25, 0.9);
  moss.position.set(0.1, 0.76, 0);
  moss.castShadow = true;
  group.add(moss);

  group.position.set(-7.4, 0, 7.3);
  group.rotation.y = 0.6;
  return group;
}

export function createForest(scene) {
  const random = mulberry32(48213);
  const group = new THREE.Group();
  group.name = "forest";
  const swayers = [];

  const owlTree = createBroadleaf(random, {
    height: 8.7,
    spread: 3.5,
    trunkRadius: 0.52,
  });
  owlTree.group.position.set(-8.8, 0, 1.2);
  owlTree.group.rotation.y = 0.45;
  group.add(owlTree.group);
  swayers.push({ mesh: owlTree.canopy, phase: 0.3 });

  const owlBranchStart = new THREE.Vector3(-0.1, 4.05, 0.1);
  const owlBranchEnd = new THREE.Vector3(1.78, 4.45, 1.82);
  const owlBranch = new THREE.Mesh(
    paintGeometry(cylinderBetween(owlBranchStart, owlBranchEnd, 0.15, 0.065, 6), "#5d4632"),
    barkMaterial,
  );
  owlBranch.castShadow = true;
  owlTree.group.add(owlBranch);

  owlTree.group.updateMatrixWorld(true);
  const owlAnchor = new THREE.Vector3(1.62, 4.5, 1.66).applyMatrix4(owlTree.group.matrixWorld);

  const squirrelTree = createBroadleaf(random, {
    height: 7.4,
    spread: 2.7,
    trunkRadius: 0.46,
  });
  squirrelTree.group.position.set(8.8, 0, -2.4);
  squirrelTree.group.rotation.y = -0.5;
  group.add(squirrelTree.group);
  swayers.push({ mesh: squirrelTree.canopy, phase: 2.1 });

  const squirrelAnchor = new THREE.Vector3(0.04, 2.25, 0.44);
  squirrelTree.group.updateMatrixWorld(true);
  squirrelAnchor.applyMatrix4(squirrelTree.group.matrixWorld);

  const trees = [
    [-11.6, -4.2, "pine", 9.6],
    [-9.0, -7.5, "broad", 8.8],
    [-5.7, -9.2, "pine", 10.0],
    [-1.2, -10.1, "broad", 9.4],
    [3.0, -9.4, "pine", 8.9],
    [6.1, -7.6, "broad", 8.2],
    [9.8, -4.9, "pine", 9.4],
    [11.7, 0.4, "broad", 7.4],
    [-12.2, 1.5, "pine", 8.6],
    [-10.9, 5.7, "broad", 6.6],
    [9.9, 6.5, "pine", 7.1],
    [6.0, 10.1, "broad", 5.8],
    [-5.2, 9.4, "broad", 5.4],
    [1.0, -6.7, "broad", 7.0],
  ];

  trees.forEach(([x, z, type, height], index) => {
    const tree =
      type === "pine"
        ? createPine(random, { height })
        : createBroadleaf(random, {
            height,
            spread: height * between(random, 0.3, 0.37),
            trunkRadius: height * 0.052,
          });
    tree.group.position.set(x, 0, z);
    tree.group.rotation.y = between(random, 0, TAU);
    tree.group.scale.setScalar(between(random, 0.92, 1.05));
    group.add(tree.group);
    swayers.push({ mesh: tree.canopy, phase: between(random, 0, TAU) + index * 0.4 });
  });

  group.add(createUnderstory(random));
  group.add(createFallenLog(random));

  scene.add(group);

  return {
    group,
    owlAnchor,
    squirrelAnchor,
    update(time) {
      swayers.forEach(({ mesh, phase }) => {
        mesh.rotation.z = Math.sin(time * 0.75 + phase) * 0.008;
        mesh.rotation.x = Math.cos(time * 0.54 + phase * 1.3) * 0.004;
      });
    },
  };
}
