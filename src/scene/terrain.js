/* ------------------------------------------------------------------
   The floating forest floor: mossy top, earthen underside, a winding
   path, scattered stones, low hills and tiny mushrooms.
------------------------------------------------------------------- */

import * as THREE from "three";
import { TAU, between, groundTexture, mulberry32 } from "../utils.js";

function buildUnderside(group, random) {
  const soilMaterial = new THREE.MeshStandardMaterial({
    color: 0x71513a,
    roughness: 1,
    metalness: 0,
    flatShading: true,
  });
  const rockMaterial = new THREE.MeshStandardMaterial({
    color: 0x5f5141,
    roughness: 1,
    metalness: 0,
    flatShading: true,
  });
  const rootMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a3527,
    roughness: 1,
    flatShading: true,
  });

  const soil = new THREE.Mesh(new THREE.CylinderGeometry(14.15, 13.4, 2.6, 96, 1), soilMaterial);
  soil.position.y = -1.3;
  soil.receiveShadow = true;
  group.add(soil);

  const coneGeometry = new THREE.ConeGeometry(13.4, 9.5, 48, 5);
  coneGeometry.rotateX(Math.PI);
  const positions = coneGeometry.attributes.position;
  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    const angle = Math.atan2(z, x);
    const wobble = 1 + Math.sin(angle * 5.7 + y * 0.8) * 0.055 + Math.sin(angle * 2.1) * 0.04;
    positions.setX(i, x * wobble);
    positions.setZ(i, z * wobble);
  }
  coneGeometry.computeVertexNormals();

  const underside = new THREE.Mesh(coneGeometry, rockMaterial);
  underside.position.y = -2.55;
  underside.castShadow = true;
  underside.receiveShadow = true;
  group.add(underside);

  const chunkGeometry = new THREE.DodecahedronGeometry(1, 0);
  const chunks = new THREE.InstancedMesh(chunkGeometry, rockMaterial, 18);
  chunks.castShadow = true;
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const position = new THREE.Vector3();

  for (let i = 0; i < 18; i += 1) {
    const angle = between(random, 0, TAU);
    const radius = between(random, 10.8, 13.4);
    const size = between(random, 0.5, 1.55);
    position.set(Math.cos(angle) * radius, between(random, -4.8, -1.8), Math.sin(angle) * radius);
    quaternion.setFromEuler(
      new THREE.Euler(between(random, 0, TAU), between(random, 0, TAU), between(random, 0, TAU)),
    );
    scale.set(size * between(random, 0.8, 1.4), size, size * between(random, 0.8, 1.35));
    matrix.compose(position, quaternion, scale);
    chunks.setMatrixAt(i, matrix);
  }
  chunks.instanceMatrix.needsUpdate = true;
  group.add(chunks);

  const rootGeometry = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.3, -2.3, 0.2),
      new THREE.Vector3(-0.5, -4.7, 0.9),
      new THREE.Vector3(-0.2, -6.4, 0.4),
    ]),
    16,
    0.1,
    5,
    false,
  );
  for (let i = 0; i < 5; i += 1) {
    const root = new THREE.Mesh(rootGeometry, rootMaterial);
    const angle = (i / 5) * TAU + random() * 0.4;
    root.position.set(Math.cos(angle) * between(random, 7, 11), -2.2, Math.sin(angle) * between(random, 7, 11));
    root.rotation.y = angle;
    root.rotation.z = between(random, -0.3, 0.3);
    root.scale.setScalar(between(random, 0.7, 1.35));
    root.castShadow = true;
    group.add(root);
  }
}

function buildPath(group, random) {
  const curve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(-3.9, 0.045, -0.3),
      new THREE.Vector3(-3.2, 0.045, 1.3),
      new THREE.Vector3(-1.7, 0.045, 3.1),
      new THREE.Vector3(0.5, 0.045, 4.5),
      new THREE.Vector3(2.4, 0.045, 6.2),
      new THREE.Vector3(2.9, 0.045, 8.5),
      new THREE.Vector3(2.6, 0.045, 11.1),
      new THREE.Vector3(2.0, 0.045, 13.6),
    ],
    false,
    "catmullrom",
    0.35,
  );

  const divisions = 64;
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= divisions; i += 1) {
    const t = i / divisions;
    const point = curve.getPoint(t);
    const tangent = curve.getTangent(t);
    const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const width = 0.56 + Math.sin(t * 23) * 0.09 + Math.sin(t * 7.4) * 0.12;

    positions.push(
      point.x + side.x * width,
      point.y,
      point.z + side.z * width,
      point.x - side.x * width,
      point.y,
      point.z - side.z * width,
    );
    uvs.push(0, t * 8, 1, t * 8);

    if (i < divisions) {
      const a = i * 2;
      indices.push(a, a + 2, a + 1, a + 2, a + 3, a + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const pathMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b684a,
    roughness: 1,
    metalness: 0,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  const path = new THREE.Mesh(geometry, pathMaterial);
  path.receiveShadow = true;
  group.add(path);

  const stoneGeometry = new THREE.CylinderGeometry(0.34, 0.39, 0.07, 7);
  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0xb6a685,
    roughness: 0.95,
    flatShading: true,
  });
  const stoneCount = 25;
  const stones = new THREE.InstancedMesh(stoneGeometry, stoneMaterial, stoneCount);
  stones.receiveShadow = true;
  stones.castShadow = true;

  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const position = new THREE.Vector3();

  for (let i = 0; i < stoneCount; i += 1) {
    const t = (i + 0.5) / stoneCount;
    const point = curve.getPoint(t);
    const tangent = curve.getTangent(t);
    const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const offset = (random() - 0.5) * 0.32;
    position.set(point.x + side.x * offset, 0.075, point.z + side.z * offset);
    quaternion.setFromEuler(new THREE.Euler(0, random() * TAU, 0));
    scale.set(between(random, 0.75, 1.25), between(random, 0.75, 1.2), between(random, 0.75, 1.25));
    matrix.compose(position, quaternion, scale);
    stones.setMatrixAt(i, matrix);
  }
  stones.instanceMatrix.needsUpdate = true;
  group.add(stones);

  return { curve, samples: curve.getSpacedPoints(80) };
}

function buildMeadowHills(group, random) {
  const hillMaterial = new THREE.MeshStandardMaterial({
    color: 0x5c763f,
    roughness: 1,
    flatShading: true,
  });
  const geometry = new THREE.SphereGeometry(1, 18, 10);

  const hills = [
    [-8.4, -4.6, 3.2, 0.72, 2.6],
    [-3.1, -7.2, 3.8, 0.9, 2.8],
    [2.8, -7.6, 3.4, 0.8, 2.4],
    [7.0, -5.6, 3.0, 0.68, 2.3],
    [10.3, -1.4, 2.5, 0.55, 2.0],
  ];

  hills.forEach(([x, z, width, height, depth]) => {
    const hill = new THREE.Mesh(geometry, hillMaterial);
    hill.position.set(x, -height * 0.52, z);
    hill.scale.set(width, height, depth);
    hill.rotation.y = random() * TAU;
    hill.receiveShadow = true;
    group.add(hill);
  });
}

function buildRocksAndMushrooms(group, random) {
  const rockMaterial = new THREE.MeshStandardMaterial({
    color: 0x8a8471,
    roughness: 1,
    flatShading: true,
  });
  const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
  const rocks = new THREE.InstancedMesh(rockGeometry, rockMaterial, 34);
  rocks.castShadow = true;
  rocks.receiveShadow = true;

  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const position = new THREE.Vector3();

  for (let i = 0; i < 34; i += 1) {
    const angle = between(random, 0, TAU);
    const radius = between(random, 5.5, 13.1);
    const size = between(random, 0.16, 0.54);
    position.set(Math.cos(angle) * radius, size * 0.28, Math.sin(angle) * radius);
    quaternion.setFromEuler(
      new THREE.Euler(between(random, 0, TAU), between(random, 0, TAU), between(random, 0, TAU)),
    );
    scale.set(size * between(random, 0.8, 1.4), size * 0.7, size * between(random, 0.8, 1.25));
    matrix.compose(position, quaternion, scale);
    rocks.setMatrixAt(i, matrix);
  }
  rocks.instanceMatrix.needsUpdate = true;
  group.add(rocks);

  const capMaterial = new THREE.MeshStandardMaterial({
    color: 0xb9513d,
    roughness: 0.85,
    flatShading: true,
  });
  const stemMaterial = new THREE.MeshStandardMaterial({ color: 0xe9dfc5, roughness: 0.9 });
  const dotMaterial = new THREE.MeshStandardMaterial({ color: 0xf2e8ce, roughness: 0.9 });
  const stemGeometry = new THREE.CylinderGeometry(0.035, 0.055, 0.23, 6);
  const capGeometry = new THREE.SphereGeometry(0.18, 10, 6, 0, TAU, 0, Math.PI / 2);
  const dotGeometry = new THREE.SphereGeometry(0.018, 5, 4);

  const spots = [
    [-8.9, 3.4, 1.2],
    [-7.9, 4.2, 0.9],
    [6.9, 4.5, 1.1],
    [7.6, 3.5, 0.8],
    [-5.4, -1.0, 1.25],
    [4.7, -2.8, 0.9],
    [9.1, 0.9, 0.75],
    [-1.0, 5.8, 0.8],
  ];

  spots.forEach(([x, z, scaleValue]) => {
    const mushroom = new THREE.Group();
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.115;
    mushroom.add(stem);

    const cap = new THREE.Mesh(capGeometry, capMaterial);
    cap.position.y = 0.23;
    cap.scale.set(1, 0.7, 1);
    cap.castShadow = true;
    mushroom.add(cap);

    for (let i = 0; i < 4; i += 1) {
      const angle = (i / 4) * TAU + 0.35;
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      dot.position.set(Math.cos(angle) * 0.1, 0.275, Math.sin(angle) * 0.1);
      dot.scale.setScalar(0.65 + random() * 0.7);
      mushroom.add(dot);
    }

    mushroom.position.set(x, 0.02, z);
    mushroom.rotation.y = random() * TAU;
    mushroom.scale.setScalar(scaleValue);
    group.add(mushroom);
  });
}

function buildMossRim(group, random) {
  const mossMaterial = new THREE.MeshStandardMaterial({
    color: 0x6b8548,
    roughness: 1,
    flatShading: true,
  });
  const geometry = new THREE.DodecahedronGeometry(1, 0);
  const rim = new THREE.InstancedMesh(geometry, mossMaterial, 38);
  rim.receiveShadow = true;

  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const position = new THREE.Vector3();

  for (let i = 0; i < 38; i += 1) {
    const angle = (i / 38) * TAU + between(random, -0.03, 0.03);
    const radius = 13.75 + between(random, -0.14, 0.2);
    position.set(Math.cos(angle) * radius, between(random, -0.06, 0.03), Math.sin(angle) * radius);
    quaternion.setFromEuler(new THREE.Euler(0, angle + between(random, -0.4, 0.4), 0));
    scale.set(between(random, 0.24, 0.62), between(random, 0.12, 0.28), between(random, 0.3, 0.75));
    matrix.compose(position, quaternion, scale);
    rim.setMatrixAt(i, matrix);
  }
  rim.instanceMatrix.needsUpdate = true;
  group.add(rim);
}

export function createTerrain(scene) {
  const random = mulberry32(9241);
  const group = new THREE.Group();
  group.name = "terrain";

  const groundMaterial = new THREE.MeshStandardMaterial({
    map: groundTexture(),
    color: 0xffffff,
    roughness: 1,
    metalness: 0,
  });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(14, 128), groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  group.add(ground);

  buildUnderside(group, random);
  const path = buildPath(group, random);
  buildMeadowHills(group, random);
  buildRocksAndMushrooms(group, random);
  buildMossRim(group, random);

  scene.add(group);

  return {
    group,
    ground,
    pathCurve: path.curve,
    pathSamples: path.samples,
  };
}

export function distanceToPath(x, z, samples) {
  let closest = Infinity;
  for (let i = 0; i < samples.length; i += 1) {
    const dx = x - samples[i].x;
    const dz = z - samples[i].z;
    const distance = dx * dx + dz * dz;
    if (distance < closest) closest = distance;
  }
  return Math.sqrt(closest);
}
