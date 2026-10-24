<div align="center">

# Moss & Meadow

**A handcrafted Three.js woodland diorama.**

**English** · [简体中文](README.md)

[Live Demo](https://moss-and-meadow.pages.dev/) · [GitHub](https://github.com/hefuhai001/small-house-in-forest)

</div>

<p align="center">
  <a href="https://moss-and-meadow.pages.dev/">
    <img src="./screenshots/sunny.jpg" alt="Moss & Meadow on a clear day" width="100%" />
  </a>
  <br />
  <sub>Clear day · sunlight through the canopy</sub>
</p>

## About the scene

Moss & Meadow is an interactive low-poly diorama built by hand with **Three.js**. The terrain, cottage, trees, flowers, animals and weather system are all generated procedurally in code—there are no external 3D models or texture assets.

The scene is meant to feel like a quiet storybook illustration: faceted tree canopies, warm window light, sunflowers swaying in front of the cottage, and a breeze following the winding path through the woods.

## What is in the scene

- **Forest cottage**: timber framing, mossy terracotta roof, arched door, flower boxes, porch, lantern and chimney smoke.
- **Woodland residents**: a blinking owl on a branch, a squirrel climbing a trunk and a bluebird perched on the roof.
- **Sunflower meadow**: a dense field of low-poly sunflowers, daisies, lavender and layered grass that sways in the wind.
- **Butterflies and bees**: butterflies flap their wings while following curved flight paths; bees hover and weave between sunflowers.
- **Four weather modes**: clear, mist, dusk and rain. Sky colors, fog, lighting, window glow, rain and fireflies blend smoothly between them.
- **Free camera**: drag to orbit and scroll to zoom, or turn on Auto Orbit and let the camera circle the cottage.
- **Atmosphere**: a floating island base, drifting clouds, dusk fireflies, chimney smoke, mist, rain and a responsive glass UI.

## Weather at a glance

<table>
  <tr>
    <td width="50%" align="center">
      <img src="./screenshots/sunny.jpg" alt="Moss & Meadow on a clear day" width="100%" />
      <br />
      <sub><strong>CLEAR</strong> · sunlight through the canopy</sub>
    </td>
    <td width="50%" align="center">
      <img src="./screenshots/misty.jpg" alt="Moss & Meadow in mist" width="100%" />
      <br />
      <sub><strong>MIST</strong> · fog drifting in from the trees</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="./screenshots/dusk.jpg" alt="Moss & Meadow at dusk with glowing windows" width="100%" />
      <br />
      <sub><strong>DUSK</strong> · the porch light comes on</sub>
    </td>
    <td width="50%" align="center">
      <img src="./screenshots/rainy.jpg" alt="Moss & Meadow in soft rain" width="100%" />
      <br />
      <sub><strong>RAIN</strong> · raindrops on the mushroom caps</sub>
    </td>
  </tr>
</table>

## Controls

| Action | Result |
| --- | --- |
| Drag / swipe | Orbit around the diorama |
| Scroll / pinch | Zoom in and out |
| Weather buttons (top right) | Switch between clear, mist, dusk and rain |
| Number keys `1` `2` `3` `4` | Jump directly to each weather mode |
| Auto Orbit (bottom right) | Start or stop the slow automatic camera orbit |

## Tech stack

- **Three.js** for scene graph, materials, lighting, shadows and animation
- **Vite** for local development and production builds
- **Cloudflare Pages** for static hosting
- **Procedural Canvas textures** for grass, roof tiles, the wooden sign and soft glows
- **InstancedMesh** for grass, sunflowers, daisies and lavender
- **ShaderMaterial** for the sky gradient, fog tones and wind sway
- **ACES Filmic Tone Mapping** for warm highlights and a soft dusk palette

No external models, HDRIs or image textures are loaded. Every visual element is generated at runtime.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open the local URL printed in the terminal.

Production build:

```bash
npm run build
npm run preview
```

## Deploy to Cloudflare Pages

```bash
npx wrangler pages deploy dist --project-name=moss-and-meadow --branch=main
```

Live site:

**[https://moss-and-meadow.pages.dev/](https://moss-and-meadow.pages.dev/)**

## Project structure

```text
.
├── index.html                 # Page structure, weather panel and loader
├── src/
│   ├── main.js                # Renderer, camera, interaction and render loop
│   ├── style.css              # Interface styling and responsive layout
│   ├── utils.js               # Seeded random, textures and geometry helpers
│   └── scene/
│       ├── terrain.js         # Floating island, path, stones and mushrooms
│       ├── cabin.js           # Cottage, window glow, lantern and chimney smoke
│       ├── forest.js          # Trees, bushes, fallen log and animal anchors
│       ├── meadow.js          # Sunflowers, daisies, lavender and grass
│       ├── creatures.js       # Owl, squirrel, bluebird, butterflies and bees
│       └── weather.js         # Weather presets, sky, clouds, rain, mist and fireflies
├── screenshots/               # README preview images
├── PROMPT.md                  # Original website prompt and requirement breakdown
└── package.json
```

## Notes

- A modern browser with WebGL 2 support is recommended (Chrome, Edge, Safari or Firefox).
- The interface adapts to different screen sizes; touch orbit and pinch zoom are supported on mobile.
- Real-time shadows, particles and dense instanced vegetation are best experienced on a desktop.
