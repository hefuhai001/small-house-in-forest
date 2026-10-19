/* ------------------------------------------------------------------
   The meadow's residents: a blinking owl on a branch, a squirrel on a
   trunk, a bluebird on the roof, plus butterflies and honey bees.
------------------------------------------------------------------- */

import * as THREE from "three";
import { TAU, between, mergePainted, mulberry32, paintGeometry } from "../utils.js";

const eyeDark = new THREE.MeshStandardMaterial({ color: 0x1c1a16, roughness: 0.45 });

function createOwl(position) {
  const group = new THREE.Group();
  group.position.copy(position);
  group.scale.setScalar(0.9);

  const feather = new THREE.MeshStandardMaterial({
    color: 0x8a6a4b,
    roughness: 1,
    flatShading: true,
  });
  const featherLight = new THREE.MeshStandardMaterial({
    color: 0xd0b793,
    roughness: 1,
    flatShading: true,
  });
  const featherDark = new THREE.MeshStandardMaterial({
    color: 0x6a5038,
    roughness: 1,
    flatShading: true,
  });
  const beakMaterial = new THREE.MeshStandardMaterial({
    color: 0xd99742,
    roughness: 0.7,
    flatShading: true,
  });
  const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xf3e6c7, roughness: 0.8 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.41, 10, 8), feather);
  body.scale.set(0.9, 1.18, 0.78);
  body.position.y = 0.48;
  body.castShadow = true;
  group.add(body);

  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), featherLight);
  belly.scale.set(0.7, 0.9, 0.32);
  belly.position.set(0, 0.47, 0.25);
  group.add(belly);

  const headGroup = new THREE.Group();
  headGroup.position.y = 0.98;
  group.add(headGroup);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.33, 10, 8), feather);
  head.scale.set(1.1, 0.95, 0.92);
  head.castShadow = true;
  headGroup.add(head);

  const facialDisc = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), featherLight);
  facialDisc.scale.set(1.05, 0.85, 0.42);
  facialDisc.position.set(0, 0.02, 0.23);
  headGroup.add(facialDisc);

  const eyeGroups = [];
  [-0.12, 0.12].forEach((x) => {
    const eyeGroup = new THREE.Group();
    eyeGroup.position.set(x, 0.05, 0.3);
    headGroup.add(eyeGroup);

    const white = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), eyeWhite);
    white.scale.z = 0.45;
    eyeGroup.add(white);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), eyeDark);
    pupil.position.z = 0.055;
    eyeGroup.add(pupil);

    const glint = new THREE.Mesh(
      new THREE.SphereGeometry(0.012, 5, 4),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
    );
    glint.position.set(0.015, 0.018, 0.09);
    eyeGroup.add(glint);

    eyeGroups.push(eyeGroup);
  });

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.15, 5), beakMaterial);
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, -0.06, 0.32);
  headGroup.add(beak);

  const earGeometry = new THREE.ConeGeometry(0.09, 0.23, 5);
  [-0.23, 0.23].forEach((x, index) => {
    const ear = new THREE.Mesh(earGeometry, featherDark);
    ear.position.set(x, 0.31, 0);
    ear.rotation.z = index === 0 ? 0.35 : -0.35;
    headGroup.add(ear);
  });

  const wingGeometry = new THREE.SphereGeometry(0.24, 8, 6);
  [-1, 1].forEach((side) => {
    const wing = new THREE.Mesh(wingGeometry, featherDark);
    wing.scale.set(0.4, 1.15, 0.75);
    wing.position.set(side * 0.34, 0.52, 0);
    wing.rotation.z = side * -0.16;
    wing.castShadow = true;
    group.add(wing);
  });

  const footMaterial = new THREE.MeshStandardMaterial({ color: 0xd8a85e, roughness: 0.8 });
  [-0.12, 0.12].forEach((x) => {
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.1, 5), footMaterial);
    foot.position.set(x, 0.05, 0.08);
    group.add(foot);
  });

  group.rotation.y = 0.2;

  return {
    group,
    update(time, phase) {
      headGroup.rotation.y = Math.sin(time * 0.34 + phase) * 0.38 + Math.sin(time * 0.13) * 0.08;
      headGroup.rotation.x = Math.sin(time * 0.24 + phase * 2) * 0.055;
      body.scale.y = 1.18 + Math.sin(time * 1.7 + phase) * 0.012;
      belly.scale.y = 0.9 + Math.sin(time * 1.7 + phase) * 0.01;

      const blinkPhase = (time + phase) % 4.8;
      const blink =
        blinkPhase < 0.15 ? Math.sin((blinkPhase / 0.15) * Math.PI) : 0;
      eyeGroups.forEach((eye) => {
        eye.scale.y = 1 - blink * 0.9;
      });
    },
  };
}

function createSquirrel(position) {
  const group = new THREE.Group();
  group.position.copy(position);
  group.scale.setScalar(0.72);

  const fur = new THREE.MeshStandardMaterial({
    color: 0xb86e3f,
    roughness: 0.95,
    flatShading: true,
  });
  const furLight = new THREE.MeshStandardMaterial({
    color: 0xd4945d,
    roughness: 0.95,
    flatShading: true,
  });
  const belly = new THREE.MeshStandardMaterial({
    color: 0xead5b0,
    roughness: 1,
    flatShading: true,
  });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.24, 9, 7), fur);
  body.scale.set(0.84, 1.35, 0.8);
  body.position.y = 0.38;
  body.castShadow = true;
  group.add(body);

  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), belly);
  chest.scale.set(0.75, 1.05, 0.4);
  chest.position.set(0, 0.38, 0.16);
  group.add(chest);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.68, 0.07);
  group.add(headGroup);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 9, 7), furLight);
  head.castShadow = true;
  headGroup.add(head);

  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.08, 7, 5), belly);
  muzzle.scale.set(1, 0.8, 0.8);
  muzzle.position.set(0, -0.045, 0.15);
  headGroup.add(muzzle);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.026, 6, 4), eyeDark);
  nose.position.set(0, -0.02, 0.22);
  headGroup.add(nose);

  [-0.075, 0.075].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.027, 6, 5), eyeDark);
    eye.position.set(x, 0.055, 0.165);
    headGroup.add(eye);
  });

  const earGeometry = new THREE.ConeGeometry(0.055, 0.12, 5);
  [-0.11, 0.11].forEach((x, index) => {
    const ear = new THREE.Mesh(earGeometry, fur);
    ear.position.set(x, 0.17, 0);
    ear.rotation.z = index === 0 ? 0.2 : -0.2;
    headGroup.add(ear);
  });

  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, 0.34, -0.17);
  group.add(tailGroup);

  const tailParts = [];
  const tailPoints = [
    [0, 0, 0, 0.14],
    [0, 0.15, -0.15, 0.18],
    [0, 0.34, -0.25, 0.22],
    [0, 0.54, -0.23, 0.22],
    [0, 0.68, -0.1, 0.18],
    [0, 0.7, 0.05, 0.12],
  ];
  tailPoints.forEach(([x, y, z, radius], index) => {
    const part = new THREE.SphereGeometry(radius, 7, 5);
    part.scale(0.82, 1.12, 0.82);
    part.translate(x, y, z);
    paintGeometry(part, index % 2 === 0 ? "#b86e3f" : "#c98252");
    tailParts.push(part);
  });
  const tail = new THREE.Mesh(
    mergePainted(tailParts),
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true }),
  );
  tail.castShadow = true;
  tailGroup.add(tail);

  const pawMaterial = new THREE.MeshStandardMaterial({ color: 0xa45f36, roughness: 1 });
  [-0.15, 0.15].forEach((x) => {
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 4), pawMaterial);
    paw.scale.set(0.8, 1.1, 0.7);
    paw.position.set(x, 0.06, 0.12);
    group.add(paw);
  });

  const acorn = new THREE.Group();
  const acornBody = new THREE.Mesh(
    new THREE.SphereGeometry(0.065, 7, 5),
    new THREE.MeshStandardMaterial({ color: 0x9a6231, roughness: 0.9 }),
  );
  acornBody.scale.set(1, 1.25, 1);
  acorn.add(acornBody);
  const acornCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 7, 4, 0, TAU, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x5d4328, roughness: 1 }),
  );
  acornCap.position.y = 0.055;
  acornCap.scale.y = 0.55;
  acorn.add(acornCap);
  acorn.position.set(0.02, 0.34, 0.26);
  group.add(acorn);

  return {
    group,
    update(time, phase) {
      tailGroup.rotation.x = Math.sin(time * 2.1 + phase) * 0.09 - 0.03;
      tailGroup.rotation.z = Math.sin(time * 1.35 + phase) * 0.06;
      headGroup.rotation.y = Math.sin(time * 0.8 + phase) * 0.25;
      headGroup.rotation.x = Math.sin(time * 1.2 + phase) * 0.05;
      body.scale.y = 1.35 + Math.sin(time * 2.3 + phase) * 0.012;
    },
  };
}

function createBluebird(position) {
  const group = new THREE.Group();
  group.position.copy(position);
  group.scale.setScalar(0.85);

  const blue = new THREE.MeshStandardMaterial({
    color: 0x4e82a8,
    roughness: 0.8,
    flatShading: true,
  });
  const blueDark = new THREE.MeshStandardMaterial({
    color: 0x37617f,
    roughness: 0.9,
    flatShading: true,
  });
  const breast = new THREE.MeshStandardMaterial({
    color: 0xdba45e,
    roughness: 0.9,
    flatShading: true,
  });
  const beakMaterial = new THREE.MeshStandardMaterial({ color: 0xc8873f, roughness: 0.8 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), blue);
  body.scale.set(0.9, 1.1, 1.3);
  body.position.y = 0.18;
  body.castShadow = true;
  group.add(body);

  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), breast);
  belly.scale.set(0.8, 0.9, 0.7);
  belly.position.set(0, 0.14, 0.08);
  group.add(belly);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.31, 0.08);
  group.add(headGroup);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), blue);
  head.castShadow = true;
  headGroup.add(head);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.08, 4), beakMaterial);
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, -0.005, 0.11);
  headGroup.add(beak);

  [-0.047, 0.047].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.016, 5, 4), eyeDark);
    eye.position.set(x, 0.025, 0.078);
    headGroup.add(eye);
  });

  const wingGeometry = new THREE.SphereGeometry(0.1, 6, 5);
  [-1, 1].forEach((side) => {
    const wing = new THREE.Mesh(wingGeometry, blueDark);
    wing.scale.set(0.22, 0.55, 1.1);
    wing.position.set(side * 0.1, 0.19, -0.01);
    wing.rotation.z = side * -0.2;
    group.add(wing);
  });

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 4), blueDark);
  tail.rotation.x = -Math.PI / 2.5;
  tail.position.set(0, 0.16, -0.2);
  group.add(tail);

  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x6b5035, roughness: 1 });
  [-0.04, 0.04].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.08, 4), legMaterial);
    leg.position.set(x, 0.03, 0);
    group.add(leg);
  });

  group.rotation.y = 0.15;

  return {
    group,
    update(time, phase) {
      headGroup.rotation.y = Math.sin(time * 1.1 + phase) * 0.38;
      headGroup.rotation.x = Math.sin(time * 0.9 + phase) * 0.1;
      tail.rotation.z = Math.sin(time * 2.2 + phase) * 0.14;
      body.scale.y = 1.1 + Math.sin(time * 2.6 + phase) * 0.015;
    },
  };
}

function createWingGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.1, 0.15, 0.32, 0.2, 0.41, 0.06);
  shape.bezierCurveTo(0.45, -0.02, 0.3, -0.17, 0.12, -0.13);
  shape.bezierCurveTo(0.05, -0.1, 0.02, -0.04, 0, 0);
  const geometry = new THREE.ShapeGeometry(shape, 8);
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

function createButterfly(position, color, random, phase) {
  const group = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a2b1c,
    roughness: 0.8,
    flatShading: true,
  });
  const wingMaterial = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.8,
    side: THREE.DoubleSide,
    emissive: new THREE.Color(color).multiplyScalar(0.06),
  });
  const spotMaterial = new THREE.MeshStandardMaterial({
    color: 0x3d3023,
    roughness: 0.8,
    side: THREE.DoubleSide,
  });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 4), bodyMaterial);
  body.scale.set(0.75, 0.65, 2.6);
  group.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.032, 6, 4), bodyMaterial);
  head.position.z = 0.105;
  group.add(head);

  const wingGeometry = createWingGeometry();
  const leftPivot = new THREE.Group();
  const rightPivot = new THREE.Group();
  leftPivot.position.x = 0.018;
  rightPivot.position.x = -0.018;
  group.add(leftPivot, rightPivot);

  const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
  const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
  rightWing.scale.x = -1;
  leftPivot.add(leftWing);
  rightPivot.add(rightWing);

  const spotGeometry = new THREE.CircleGeometry(0.04, 6);
  spotGeometry.rotateX(-Math.PI / 2);

  const leftSpot = new THREE.Mesh(spotGeometry, spotMaterial);
  leftSpot.position.set(0.31, 0.006, -0.01);
  leftPivot.add(leftSpot);

  const rightSpot = new THREE.Mesh(spotGeometry, spotMaterial);
  rightSpot.position.set(-0.31, 0.006, -0.01);
  rightPivot.add(rightSpot);

  const antennaMaterial = new THREE.MeshStandardMaterial({ color: 0x3a2b1c, roughness: 1 });
  [-1, 1].forEach((side) => {
    const antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.004, 0.005, 0.12, 4),
      antennaMaterial,
    );
    antenna.position.set(side * 0.03, 0.03, 0.16);
    antenna.rotation.x = 0.75;
    antenna.rotation.z = side * 0.35;
    group.add(antenna);
  });

  group.position.copy(position);
  group.scale.setScalar(between(random, 0.7, 1.05));

  return {
    group,
    leftPivot,
    rightPivot,
    center: position.clone(),
    radiusX: between(random, 0.9, 2.3),
    radiusZ: between(random, 0.7, 1.9),
    speed: between(random, 0.24, 0.46),
    bob: between(random, 0.2, 0.55),
    height: position.y,
    phase,
    previous: position.clone(),
  };
}

function createBee(position, random, phase) {
  const group = new THREE.Group();
  const yellow = new THREE.MeshStandardMaterial({
    color: 0xe0ae35,
    roughness: 0.7,
    flatShading: true,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x302615,
    roughness: 0.8,
    flatShading: true,
  });
  const wingMaterial = new THREE.MeshBasicMaterial({
    color: 0xf7f0d4,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.09, 7, 5), yellow);
  body.scale.set(0.9, 0.88, 1.55);
  group.add(body);

  [-0.055, 0.045].forEach((z) => {
    const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.073, 0.011, 4, 8), dark);
    stripe.position.z = z;
    stripe.scale.set(1, 0.82, 1);
    group.add(stripe);
  });

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.075, 6, 5), dark);
  head.position.z = 0.15;
  head.scale.set(1, 0.95, 0.85);
  group.add(head);

  const stinger = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.08, 4), dark);
  stinger.rotation.x = -Math.PI / 2;
  stinger.position.z = -0.17;
  group.add(stinger);

  const wingGeometry = new THREE.CircleGeometry(0.11, 8);
  wingGeometry.rotateX(-Math.PI / 2);

  const leftPivot = new THREE.Group();
  const rightPivot = new THREE.Group();
  leftPivot.position.set(0.03, 0.06, 0);
  rightPivot.position.set(-0.03, 0.06, 0);
  group.add(leftPivot, rightPivot);

  const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
  leftWing.position.x = 0.1;
  leftWing.scale.set(1, 1, 0.55);
  leftPivot.add(leftWing);

  const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
  rightWing.position.x = -0.1;
  rightWing.scale.set(1, 1, 0.55);
  rightPivot.add(rightWing);

  group.position.copy(position);
  group.scale.setScalar(between(random, 0.65, 0.95));

  return {
    group,
    leftPivot,
    rightPivot,
    center: position.clone(),
    radius: between(random, 0.18, 0.65),
    speed: between(random, 1.5, 3.2),
    height: position.y,
    phase,
    previous: position.clone(),
  };
}

export function createCreatures(scene, { owlAnchor, squirrelAnchor, birdAnchor, flowers }) {
  const random = mulberry32(55741);
  const group = new THREE.Group();
  group.name = "creatures";

  const owl = createOwl(owlAnchor);
  const squirrel = createSquirrel(squirrelAnchor);
  const bluebird = createBluebird(birdAnchor);
  group.add(owl.group, squirrel.group, bluebird.group);

  const butterflyColors = [0xf0a24c, 0xf4e1b8, 0x7fa9c8, 0xe9c85a, 0xd77f61, 0xb7a2cb];
  const butterflyCenters = [
    [4.7, 2.5, 3.9],
    [7.5, 2.1, 6.2],
    [2.2, 2.8, 5.8],
    [-6.7, 2.4, 4.8],
    [9.2, 2.7, 1.4],
    [0.4, 2.3, 7.9],
    [5.4, 3.1, 8.1],
    [-4.2, 2.6, 7.0],
  ];
  const butterflies = butterflyCenters.map((center, index) => {
    const butterfly = createButterfly(
      new THREE.Vector3(...center),
      butterflyColors[index % butterflyColors.length],
      random,
      between(random, 0, TAU),
    );
    group.add(butterfly.group);
    return butterfly;
  });

  const bees = [];
  const beeFlowers = flowers
    .filter((_, index) => index % 9 === 0)
    .slice(0, 11);
  beeFlowers.forEach((flower, index) => {
    const bee = createBee(
      new THREE.Vector3(flower.x, 1.45, flower.z),
      random,
      between(random, 0, TAU) + index * 0.55,
    );
    group.add(bee.group);
    bees.push(bee);
  });

  scene.add(group);

  return {
    group,
    update(time, delta) {
      const owlPhase = 0.5;
      owl.update(time, owlPhase);
      squirrel.update(time, 1.6);
      bluebird.update(time, 2.8);

      butterflies.forEach((butterfly) => {
        const t = time * butterfly.speed + butterfly.phase;
        const x = butterfly.center.x + Math.cos(t) * butterfly.radiusX;
        const z = butterfly.center.z + Math.sin(t * 0.82) * butterfly.radiusZ;
        const y =
          butterfly.height +
          Math.sin(t * 2.1) * butterfly.bob +
          Math.sin(t * 0.7) * 0.12;
        butterfly.group.position.set(x, y, z);

        const dx = x - butterfly.previous.x;
        const dz = z - butterfly.previous.z;
        if (Math.abs(dx) + Math.abs(dz) > 0.0001) {
          butterfly.group.rotation.y = Math.atan2(dx, dz);
        }
        butterfly.previous.set(x, y, z);

        const flap = Math.sin(time * 17 + butterfly.phase) * 0.85 + 0.3;
        butterfly.leftPivot.rotation.z = flap;
        butterfly.rightPivot.rotation.z = -flap;
        butterfly.group.rotation.z = Math.sin(time * 1.5 + butterfly.phase) * 0.08;
      });

      bees.forEach((bee) => {
        const t = time * bee.speed + bee.phase;
        const x = bee.center.x + Math.cos(t) * bee.radius;
        const z = bee.center.z + Math.sin(t * 1.3) * bee.radius * 0.6;
        const y = bee.height + Math.sin(t * 3.2) * 0.12;
        bee.group.position.set(x, y, z);

        const dx = x - bee.previous.x;
        const dz = z - bee.previous.z;
        if (Math.abs(dx) + Math.abs(dz) > 0.0001) {
          bee.group.rotation.y = Math.atan2(dx, dz);
        }
        bee.previous.set(x, y, z);

        const flap = Math.sin(time * 42 + bee.phase) * 0.9 + 0.35;
        bee.leftPivot.rotation.z = flap;
        bee.rightPivot.rotation.z = -flap;
        bee.group.rotation.x = Math.sin(time * 2.4 + bee.phase) * 0.06;
      });

      void delta;
    },
  };
}
