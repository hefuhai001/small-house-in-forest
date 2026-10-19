/* ------------------------------------------------------------------
   Weather direction for the diorama. Four hand-tuned presets blend
   smoothly: warm clear light, drifting mist, a rose-gold dusk with
   fireflies, and a soft summer rain.
------------------------------------------------------------------- */

import * as THREE from "three";
import { TAU, between, cloudTexture, mulberry32, softTexture } from "../utils.js";

export const WEATHER_PRESETS = {
  sunny: {
    skyTop: "#72a8cc",
    skyMid: "#b8d5d2",
    skyBottom: "#f3e1b8",
    fogColor: "#dfe6d2",
    fogDensity: 0.009,
    hemiSky: "#e7f2ff",
    hemiGround: "#647b42",
    hemiIntensity: 1.35,
    ambientColor: "#b7c49c",
    ambientIntensity: 0.38,
    sunColor: "#ffe1a8",
    sunIntensity: 3.0,
    sunPos: [-18, 30, 20],
    cloudColor: "#fff3d9",
    cloudOpacity: 0.32,
    mistColor: "#e7ece0",
    mistOpacity: 0,
    rainOpacity: 0,
    fireflyOpacity: 0,
    starOpacity: 0,
    exposure: 1.05,
    windowGlow: 1.4,
    windowGlowOpacity: 0.22,
    lanternGlow: 1.6,
    lanternGlowOpacity: 0.3,
    lanternLight: 1.4,
    windowLight: 1.4,
    sunGlowColor: "#fff0c2",
    sunGlowOpacity: 1,
    sunScale: 30,
  },
  misty: {
    skyTop: "#899fa1",
    skyMid: "#b6c5bd",
    skyBottom: "#d9ded3",
    fogColor: "#c5d0c6",
    fogDensity: 0.024,
    hemiSky: "#d3dfdc",
    hemiGround: "#53624a",
    hemiIntensity: 1.1,
    ambientColor: "#b8c4b6",
    ambientIntensity: 0.55,
    sunColor: "#dfe9e2",
    sunIntensity: 0.8,
    sunPos: [-8, 22, 12],
    cloudColor: "#eef0e9",
    cloudOpacity: 0.58,
    mistColor: "#eef1e9",
    mistOpacity: 0.8,
    rainOpacity: 0,
    fireflyOpacity: 0,
    starOpacity: 0,
    exposure: 0.98,
    windowGlow: 2.2,
    windowGlowOpacity: 0.34,
    lanternGlow: 2.8,
    lanternGlowOpacity: 0.5,
    lanternLight: 2.0,
    windowLight: 1.8,
    sunGlowColor: "#f4f2df",
    sunGlowOpacity: 0.1,
    sunScale: 36,
  },
  dusk: {
    skyTop: "#3b3b60",
    skyMid: "#906a7a",
    skyBottom: "#f0a26b",
    fogColor: "#b0806f",
    fogDensity: 0.013,
    hemiSky: "#9384a8",
    hemiGround: "#333b2b",
    hemiIntensity: 0.9,
    ambientColor: "#6f6070",
    ambientIntensity: 0.3,
    sunColor: "#ff9f63",
    sunIntensity: 2.5,
    sunPos: [22, 9, 16],
    cloudColor: "#eeb4a0",
    cloudOpacity: 0.4,
    mistColor: "#e3b2a0",
    mistOpacity: 0.1,
    rainOpacity: 0,
    fireflyOpacity: 1,
    starOpacity: 0.8,
    exposure: 1.14,
    windowGlow: 4.2,
    windowGlowOpacity: 0.58,
    lanternGlow: 4.0,
    lanternGlowOpacity: 0.72,
    lanternLight: 2.6,
    windowLight: 2.4,
    sunGlowColor: "#ffd09a",
    sunGlowOpacity: 0.92,
    sunScale: 38,
  },
  rainy: {
    skyTop: "#46565d",
    skyMid: "#6f8084",
    skyBottom: "#aab7b2",
    fogColor: "#97a8a6",
    fogDensity: 0.02,
    hemiSky: "#a2b7be",
    hemiGround: "#39463a",
    hemiIntensity: 0.9,
    ambientColor: "#889a9c",
    ambientIntensity: 0.55,
    sunColor: "#b9cbd2",
    sunIntensity: 1.0,
    sunPos: [-14, 26, 8],
    cloudColor: "#9aa7a8",
    cloudOpacity: 0.62,
    mistColor: "#c3cfcc",
    mistOpacity: 0.3,
    rainOpacity: 1,
    fireflyOpacity: 0,
    starOpacity: 0,
    exposure: 0.88,
    windowGlow: 3.0,
    windowGlowOpacity: 0.4,
    lanternGlow: 3.6,
    lanternGlowOpacity: 0.62,
    lanternLight: 2.2,
    windowLight: 2.0,
    sunGlowColor: "#dce7e8",
    sunGlowOpacity: 0,
    sunScale: 30,
  },
};

const COLOR_KEYS = new Set([
  "skyTop",
  "skyMid",
  "skyBottom",
  "fogColor",
  "hemiSky",
  "hemiGround",
  "ambientColor",
  "sunColor",
  "cloudColor",
  "mistColor",
  "sunGlowColor",
]);

function buildState(preset) {
  const state = {};
  Object.entries(preset).forEach(([key, value]) => {
    if (key === "sunPos") {
      state[key] = new THREE.Vector3(...value);
    } else if (COLOR_KEYS.has(key)) {
      state[key] = new THREE.Color(value);
    } else {
      state[key] = value;
    }
  });
  return state;
}

function cloneState(state) {
  const clone = {};
  Object.entries(state).forEach(([key, value]) => {
    if (value instanceof THREE.Color || value instanceof THREE.Vector3) {
      clone[key] = value.clone();
    } else {
      clone[key] = value;
    }
  });
  return clone;
}

function createSky(scene) {
  const uniforms = {
    uTop: { value: new THREE.Color() },
    uMid: { value: new THREE.Color() },
    uBottom: { value: new THREE.Color() },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
    toneMapped: false,
    vertexShader: `
      varying vec3 vWorldDirection;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldDirection = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uTop;
      uniform vec3 uMid;
      uniform vec3 uBottom;
      varying vec3 vWorldDirection;

      void main() {
        float h = normalize(vWorldDirection).y;
        vec3 color = mix(uBottom, uMid, smoothstep(-0.04, 0.26, h));
        color = mix(color, uTop, smoothstep(0.18, 0.78, h));
        float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
        color += (dither - 0.5) / 255.0;
        color = pow(max(color, 0.0), vec3(0.4545));
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });

  const sky = new THREE.Mesh(new THREE.SphereGeometry(150, 32, 20), material);
  sky.frustumCulled = false;
  sky.renderOrder = -10;
  scene.add(sky);
  return uniforms;
}

function createSkyAtmosphere(scene, random) {
  const sunTexture = softTexture(256, "rgba(255,248,218,1)");
  const sunCoreMaterial = new THREE.SpriteMaterial({
    map: sunTexture,
    color: 0xfff2c2,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
  });
  const sunHaloMaterial = new THREE.SpriteMaterial({
    map: sunTexture,
    color: 0xffdf9f,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
  });

  const sunGroup = new THREE.Group();
  const sunCore = new THREE.Sprite(sunCoreMaterial);
  sunCore.scale.set(15, 15, 1);
  const sunHalo = new THREE.Sprite(sunHaloMaterial);
  sunHalo.scale.set(42, 42, 1);
  sunGroup.add(sunHalo, sunCore);
  scene.add(sunGroup);

  const clouds = [];
  const cloudMaterials = [0.46, 0.34, 0.24].map(
    (opacity) =>
      new THREE.SpriteMaterial({
        map: cloudTexture(),
        color: 0xfff3d9,
        transparent: true,
        opacity,
        depthWrite: false,
        fog: false,
      }),
  );
  cloudMaterials.forEach((material) => {
    material.userData.baseOpacity = material.opacity;
  });

  for (let i = 0; i < 16; i += 1) {
    const cluster = new THREE.Group();
    const spriteCount = 2 + Math.floor(random() * 3);
    for (let j = 0; j < spriteCount; j += 1) {
      const material = cloudMaterials[Math.floor(random() * cloudMaterials.length)];
      const sprite = new THREE.Sprite(material);
      const width = between(random, 12, 24);
      sprite.scale.set(width, width * between(random, 0.34, 0.48), 1);
      sprite.position.set(
        between(random, -8, 8),
        between(random, -2.2, 2.2),
        between(random, -4, 4),
      );
      cluster.add(sprite);
    }
    const angle = between(random, 0, TAU);
    const radius = between(random, 30, 58);
    const height = between(random, 17, 31);
    cluster.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
    scene.add(cluster);
    clouds.push({
      group: cluster,
      angle,
      radius,
      height,
      speed: between(random, 0.004, 0.012) * (random() > 0.5 ? 1 : -1),
      bob: between(random, 0.2, 0.8),
      phase: between(random, 0, TAU),
    });
  }

  const starTexture = softTexture(64);
  const starGeometry = new THREE.BufferGeometry();
  const starPositions = [];
  for (let i = 0; i < 340; i += 1) {
    const theta = between(random, 0, TAU);
    const phi = between(random, 0.08, Math.PI * 0.48);
    const radius = between(random, 110, 135);
    starPositions.push(
      Math.cos(theta) * Math.cos(phi) * radius,
      Math.sin(phi) * radius,
      Math.sin(theta) * Math.cos(phi) * radius,
    );
  }
  starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
  const starMaterial = new THREE.PointsMaterial({
    map: starTexture,
    color: 0xfff1d0,
    size: 2.2,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  });
  const stars = new THREE.Points(starGeometry, starMaterial);
  stars.frustumCulled = false;
  scene.add(stars);

  return {
    sunGroup,
    sunCoreMaterial,
    sunHaloMaterial,
    cloudMaterials,
    clouds,
    stars,
    starMaterial,
  };
}

function createMist(scene, random) {
  const texture = softTexture(256, "rgba(255,255,255,0.75)");
  const materials = [0.13, 0.085].map(
    (opacity) =>
      new THREE.SpriteMaterial({
        map: texture,
        color: 0xedf1e9,
        transparent: true,
        opacity,
        depthWrite: false,
        fog: true,
      }),
  );
  materials.forEach((material) => {
    material.userData.baseOpacity = material.opacity;
  });

  const sprites = [];
  for (let i = 0; i < 20; i += 1) {
    const material = materials[i % materials.length];
    const sprite = new THREE.Sprite(material);
    const angle = between(random, 0, TAU);
    const radius = between(random, 3.5, 14.5);
    const width = between(random, 9, 18);
    sprite.scale.set(width, width * between(random, 0.26, 0.42), 1);
    sprite.position.set(
      Math.cos(angle) * radius,
      between(random, 0.9, 3.6),
      Math.sin(angle) * radius,
    );
    sprite.renderOrder = 4;
    scene.add(sprite);
    sprites.push({
      sprite,
      baseX: sprite.position.x,
      baseZ: sprite.position.z,
      phase: between(random, 0, TAU),
      drift: between(random, 0.25, 0.9),
    });
  }

  return { materials, sprites };
}

function createRain(scene, random) {
  const count = 900;
  const positions = new Float32Array(count * 6);
  const drops = [];

  for (let i = 0; i < count; i += 1) {
    const x = between(random, -17, 17);
    const z = between(random, -17, 17);
    const y = between(random, 0, 24);
    const length = between(random, 0.32, 0.75);
    const speed = between(random, 9, 16);
    drops.push({ x, y, z, length, speed });
    positions[i * 6] = x;
    positions[i * 6 + 1] = y;
    positions[i * 6 + 2] = z;
    positions[i * 6 + 3] = x;
    positions[i * 6 + 4] = y - length;
    positions[i * 6 + 5] = z;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.computeBoundingSphere();
  geometry.boundingSphere.radius = 30;

  const material = new THREE.LineBasicMaterial({
    color: 0xc9dadd,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    fog: true,
  });

  const rain = new THREE.LineSegments(geometry, material);
  rain.frustumCulled = false;
  rain.visible = false;
  scene.add(rain);

  return {
    rain,
    material,
    drops,
    positions,
    update(delta) {
      drops.forEach((drop, index) => {
        drop.y -= drop.speed * delta;
        if (drop.y < -0.3) {
          drop.y = between(random, 18, 25);
          drop.x = between(random, -17, 17);
          drop.z = between(random, -17, 17);
        }
        positions[index * 6] = drop.x;
        positions[index * 6 + 1] = drop.y;
        positions[index * 6 + 2] = drop.z;
        positions[index * 6 + 3] = drop.x;
        positions[index * 6 + 4] = drop.y - drop.length;
        positions[index * 6 + 5] = drop.z;
      });
      geometry.attributes.position.needsUpdate = true;
    },
  };
}

function createFireflies(scene, random) {
  const count = 95;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const base = [];
  const flame = new THREE.Color("#ffd27a");

  for (let i = 0; i < count; i += 1) {
    const angle = between(random, 0, TAU);
    const radius = between(random, 4.2, 12.8);
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = between(random, 0.55, 2.9);
    base.push({ x, z, y, phase: between(random, 0, TAU) });
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    colors[i * 3] = flame.r;
    colors[i * 3 + 1] = flame.g;
    colors[i * 3 + 2] = flame.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    map: softTexture(64),
    color: 0xffffff,
    vertexColors: true,
    size: 0.22,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  });

  const fireflies = new THREE.Points(geometry, material);
  fireflies.frustumCulled = false;
  fireflies.visible = false;
  scene.add(fireflies);

  return {
    fireflies,
    material,
    base,
    positions,
    colors,
    update(time) {
      base.forEach((fly, index) => {
        positions[index * 3] = fly.x + Math.sin(time * 0.55 + fly.phase) * 0.4;
        positions[index * 3 + 1] = fly.y + Math.sin(time * 1.15 + fly.phase * 2.1) * 0.18;
        positions[index * 3 + 2] = fly.z + Math.cos(time * 0.47 + fly.phase) * 0.4;

        const twinkle = 0.35 + (Math.sin(time * 2.4 + fly.phase * 3.7) * 0.5 + 0.5) * 0.65;
        colors[index * 3] = flame.r * twinkle;
        colors[index * 3 + 1] = flame.g * twinkle;
        colors[index * 3 + 2] = flame.b * twinkle;
      });
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
    },
  };
}

export function createWeather({ scene, camera, renderer, cabin }) {
  const random = mulberry32(8841);
  const skyUniforms = createSky(scene);
  const atmosphere = createSkyAtmosphere(scene, random);
  const mist = createMist(scene, random);
  const rain = createRain(scene, random);
  const fireflies = createFireflies(scene, random);

  const hemi = new THREE.HemisphereLight(0xe7f2ff, 0x647b42, 1.35);
  scene.add(hemi);

  const ambient = new THREE.AmbientLight(0xb7c49c, 0.38);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xffe1a8, 3.0);
  sun.position.set(-18, 30, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -18;
  sun.shadow.camera.right = 18;
  sun.shadow.camera.top = 18;
  sun.shadow.camera.bottom = -18;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 75;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.025;
  sun.target.position.set(0, 0.8, 0);
  scene.add(sun, sun.target);

  scene.fog = new THREE.FogExp2(0xdfe6d2, 0.009);
  scene.background = new THREE.Color(0xdfe6d2);

  let currentName = "sunny";
  const targetState = buildState(WEATHER_PRESETS.sunny);
  const currentState = cloneState(targetState);

  function applyState() {
    scene.fog.color.copy(currentState.fogColor);
    scene.fog.density = currentState.fogDensity;
    scene.background.copy(currentState.fogColor);

    skyUniforms.uTop.value.copy(currentState.skyTop);
    skyUniforms.uMid.value.copy(currentState.skyMid);
    skyUniforms.uBottom.value.copy(currentState.skyBottom);

    hemi.color.copy(currentState.hemiSky);
    hemi.groundColor.copy(currentState.hemiGround);
    hemi.intensity = currentState.hemiIntensity;

    ambient.color.copy(currentState.ambientColor);
    ambient.intensity = currentState.ambientIntensity;

    sun.color.copy(currentState.sunColor);
    sun.intensity = currentState.sunIntensity;
    sun.position.copy(currentState.sunPos);

    renderer.toneMappingExposure = currentState.exposure;

    const sunDirection = currentState.sunPos.clone().normalize().multiplyScalar(96);
    atmosphere.sunGroup.position.copy(sunDirection);
    atmosphere.sunCoreMaterial.color.copy(currentState.sunGlowColor);
    atmosphere.sunHaloMaterial.color.copy(currentState.sunGlowColor);
    atmosphere.sunCoreMaterial.opacity = currentState.sunGlowOpacity;
    atmosphere.sunHaloMaterial.opacity = currentState.sunGlowOpacity * 0.4;
    const coreScale = currentState.sunScale * 0.52;
    atmosphere.sunGroup.children[0].scale.set(coreScale * 2.8, coreScale * 2.8, 1);
    atmosphere.sunGroup.children[1].scale.set(coreScale, coreScale, 1);

    atmosphere.cloudMaterials.forEach((material) => {
      material.color.copy(currentState.cloudColor);
      material.opacity = material.userData.baseOpacity * currentState.cloudOpacity;
    });

    mist.materials.forEach((material) => {
      material.color.copy(currentState.mistColor);
      material.opacity = material.userData.baseOpacity * currentState.mistOpacity;
    });

    rain.material.opacity = currentState.rainOpacity;
    rain.rain.visible = currentState.rainOpacity > 0.005;

    fireflies.material.opacity = currentState.fireflyOpacity;
    fireflies.fireflies.visible = currentState.fireflyOpacity > 0.01;

    atmosphere.starMaterial.opacity = currentState.starOpacity;
    atmosphere.stars.visible = currentState.starOpacity > 0.01;

    cabin.windowMaterial.emissiveIntensity = currentState.windowGlow;
    cabin.windowGlowMaterial.opacity = currentState.windowGlowOpacity;
    cabin.lanternMaterial.emissiveIntensity = currentState.lanternGlow;
    cabin.lanternGlowMaterial.opacity = currentState.lanternGlowOpacity;
    cabin.porchLight.intensity = currentState.lanternLight;
    cabin.windowLight.intensity = currentState.windowLight;
  }

  function setWeather(name) {
    if (!WEATHER_PRESETS[name] || name === currentName) return false;
    currentName = name;
    const next = buildState(WEATHER_PRESETS[name]);
    Object.keys(targetState).forEach((key) => {
      const value = next[key];
      if (value instanceof THREE.Color || value instanceof THREE.Vector3) {
        targetState[key].copy(value);
      } else {
        targetState[key] = value;
      }
    });
    return true;
  }

  applyState();

  let mistTime = 0;

  return {
    get current() {
      return currentName;
    },
    set: setWeather,
    update(delta, time) {
      const blend = 1 - Math.exp(-delta * 2.0);
      Object.keys(targetState).forEach((key) => {
        const current = currentState[key];
        const target = targetState[key];
        if (current instanceof THREE.Color) {
          current.lerp(target, blend);
        } else if (current instanceof THREE.Vector3) {
          current.lerp(target, blend);
        } else {
          currentState[key] = THREE.MathUtils.damp(current, target, 2.0, delta);
        }
      });

      applyState();

      mistTime += delta;
      atmosphere.clouds.forEach((cloud) => {
        cloud.angle += cloud.speed * delta;
        cloud.group.position.set(
          Math.cos(cloud.angle) * cloud.radius,
          cloud.height + Math.sin(mistTime * 0.12 + cloud.phase) * cloud.bob,
          Math.sin(cloud.angle) * cloud.radius,
        );
      });

      mist.sprites.forEach(({ sprite, baseX, baseZ, phase, drift }) => {
        sprite.position.x = baseX + Math.sin(mistTime * 0.09 + phase) * drift;
        sprite.position.z = baseZ + Math.cos(mistTime * 0.07 + phase * 1.4) * drift;
      });

      if (rain.rain.visible) {
        rain.update(delta);
      }

      if (fireflies.fireflies.visible) {
        fireflies.update(time);
      }

      camera.updateMatrixWorld();
    },
  };
}
