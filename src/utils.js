/* ------------------------------------------------------------------
   Shared helpers: seeded randomness, procedural canvas textures and
   small geometry builders used across the diorama.
------------------------------------------------------------------- */

import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const TAU = Math.PI * 2;

/** Small deterministic PRNG so the forest looks the same on every visit. */
export function mulberry32(seed) {
  let value = seed >>> 0;
  return function random() {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function between(random, min, max) {
  return min + random() * (max - min);
}

export function choose(random, items) {
  return items[Math.floor(random() * items.length)];
}

export function canvasTexture(width, height, draw, options = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  draw(context, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = options.anisotropy ?? 4;

  if (options.repeat) {
    texture.repeat.set(options.repeat[0], options.repeat[1]);
  }

  return texture;
}

export function softTexture(size = 128, inner = "rgba(255,255,255,1)") {
  return canvasTexture(size, size, (context, width, height) => {
    const gradient = context.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      width / 2,
    );
    gradient.addColorStop(0, inner);
    gradient.addColorStop(0.35, "rgba(255,255,255,0.55)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  });
}

export function cloudTexture() {
  return canvasTexture(512, 256, (context, width, height) => {
    context.clearRect(0, 0, width, height);
    const blobs = [
      [0.24, 0.58, 0.24, 0.33],
      [0.4, 0.45, 0.3, 0.4],
      [0.58, 0.5, 0.34, 0.42],
      [0.76, 0.6, 0.23, 0.3],
      [0.5, 0.63, 0.42, 0.28],
    ];

    context.globalCompositeOperation = "lighter";
    blobs.forEach(([x, y, rx, ry]) => {
      const gradient = context.createRadialGradient(
        x * width,
        y * height,
        0,
        x * width,
        y * height,
        rx * width,
      );
      gradient.addColorStop(0, "rgba(255,255,255,0.72)");
      gradient.addColorStop(0.55, "rgba(255,255,255,0.32)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      context.save();
      context.translate(x * width, y * height);
      context.scale(1, (ry * height) / (rx * width));
      context.translate(-x * width, -y * height);
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x * width, y * height, rx * width, 0, TAU);
      context.fill();
      context.restore();
    });
  });
}

export function groundTexture() {
  return canvasTexture(
    512,
    512,
    (context, width, height) => {
      const random = mulberry32(2407);
      context.fillStyle = "#657d46";
      context.fillRect(0, 0, width, height);

      const patchColors = ["#556f3b", "#738b4d", "#5e7a42", "#7d9252", "#4f6a38"];
      for (let i = 0; i < 150; i += 1) {
        const x = random() * width;
        const y = random() * height;
        const radius = 10 + random() * 58;
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `${choose(random, patchColors)}aa`);
        gradient.addColorStop(1, "rgba(101,125,70,0)");
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(x, y, radius, 0, TAU);
        context.fill();
      }

      for (let i = 0; i < 1800; i += 1) {
        const x = random() * width;
        const y = random() * height;
        const heightStroke = 1 + random() * 4;
        context.strokeStyle = random() > 0.5 ? "rgba(48,68,35,0.22)" : "rgba(151,166,101,0.18)";
        context.lineWidth = 0.7 + random() * 0.7;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + (random() - 0.5) * 2, y - heightStroke);
        context.stroke();
      }
    },
    { repeat: [7, 7], anisotropy: 8 },
  );
}

export function roofTexture() {
  return canvasTexture(
    512,
    512,
    (context, width, height) => {
      const random = mulberry32(1311);
      context.fillStyle = "#984a36";
      context.fillRect(0, 0, width, height);

      const rows = 9;
      const rowHeight = height / rows;
      const tileWidth = 58;

      for (let row = 0; row < rows; row += 1) {
        const y = row * rowHeight;
        const offset = row % 2 === 0 ? 0 : tileWidth / 2;
        for (let x = -tileWidth; x < width + tileWidth; x += tileWidth) {
          const shade = 0.82 + random() * 0.26;
          const red = Math.round(158 * shade);
          const green = Math.round(77 * shade);
          const blue = Math.round(56 * shade);
          context.fillStyle = `rgb(${red},${green},${blue})`;
          context.beginPath();
          context.moveTo(x + offset, y);
          context.lineTo(x + offset + tileWidth, y);
          context.lineTo(x + offset + tileWidth, y + rowHeight * 0.82);
          context.quadraticCurveTo(
            x + offset + tileWidth / 2,
            y + rowHeight * 1.14,
            x + offset,
            y + rowHeight * 0.82,
          );
          context.closePath();
          context.fill();

          context.strokeStyle = "rgba(75,35,26,0.2)";
          context.lineWidth = 1.4;
          context.stroke();

          if (random() > 0.75) {
            context.fillStyle = "rgba(213,145,100,0.13)";
            context.fillRect(x + offset + 8, y + 5, tileWidth - 18, 3);
          }
        }
        context.fillStyle = "rgba(73,32,24,0.13)";
        context.fillRect(0, y, width, 2);
      }
    },
    { repeat: [3, 2], anisotropy: 8 },
  );
}

export function signTexture() {
  return canvasTexture(512, 160, (context, width, height) => {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#4c3423";
    context.beginPath();
    context.roundRect(4, 4, width - 8, height - 8, 18);
    context.fill();

    context.strokeStyle = "#8e6a48";
    context.lineWidth = 3;
    context.stroke();

    context.fillStyle = "#f0dfba";
    context.font = "500 46px Fraunces, Georgia, serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("MOSS COTTAGE", width / 2, height / 2 + 2);

    context.fillStyle = "rgba(240,223,186,0.44)";
    context.font = "600 13px Karla, sans-serif";
    context.letterSpacing = "6px";
    context.fillText("KEEP THE LIGHT ON", width / 2, height - 26);
  });
}

/** Paint a solid vertex colour onto a geometry so many pieces can share one mesh. */
export function paintGeometry(geometry, color) {
  const colorObject = new THREE.Color(color);
  const count = geometry.attributes.position.count;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    colors[i * 3] = colorObject.r;
    colors[i * 3 + 1] = colorObject.g;
    colors[i * 3 + 2] = colorObject.b;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

export function mergePainted(geometries) {
  const normalized = geometries.map((geometry) =>
    geometry.index ? geometry.toNonIndexed() : geometry,
  );
  const merged = mergeGeometries(normalized, false);
  normalized.forEach((geometry) => geometry.dispose());
  return merged;
}

/** A tapered cylinder that spans two arbitrary points. */
export function cylinderBetween(start, end, radiusStart, radiusEnd, segments = 6) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const geometry = new THREE.CylinderGeometry(radiusEnd, radiusStart, length, segments, 1);
  geometry.translate(0, length / 2, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize(),
  );
  geometry.applyQuaternion(quaternion);
  geometry.translate(start.x, start.y, start.z);
  return geometry;
}

/** Add a gentle wind sway into an instanced standard material. */
export function addWind(material, timeUniform, strength = 0.08) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uWindTime = timeUniform;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uWindTime;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
          float windPhase = instanceMatrix[3][0] * 0.74 + instanceMatrix[3][2] * 0.51;
        #else
          float windPhase = position.x * 0.7;
        #endif
        float windBend = pow(max(transformed.y, 0.0), 1.35);
        float windSway = sin(uWindTime * 1.45 + windPhase) * 0.7
          + sin(uWindTime * 0.63 + windPhase * 1.9) * 0.3;
        transformed.x += windSway * windBend * ${strength.toFixed(3)};
        transformed.z += cos(uWindTime * 1.08 + windPhase) * windBend * ${(
          strength * 0.32
        ).toFixed(3)};`,
      );
  };
}
