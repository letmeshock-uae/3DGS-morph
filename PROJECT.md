# TSL Morphing Particles

**WebGPU-демо** на React Three Fiber: тысячи GPU-спрайтов расположены по поверхностям GLB-моделей и плавно морфятся между формами. Шейдеры написаны на **TSL (Three.js Shading Language)** — без GLSL-файлов.

## Стек

| Слой | Технология |
|------|-----------|
| UI | React 19, Vite 7, TypeScript 5.9 |
| 3D | Three.js r182 (`three/webgpu`, `three/tsl`) |
| R3F | `@react-three/fiber` 9.5, `@react-three/drei` 10.7 |
| Рендерер | **WebGPURenderer** (не WebGL) |
| Шейдинг | **TSL** — нодовый граф в TypeScript |
| Анимация | **GSAP** — прогресс морфа и нажатие кнопки |
| Контролы | **Leva** — живая подстройка параметров |
| Стили | Tailwind CSS v4 |

## Структура `src/` (25 файлов)

```
src/
├── main.tsx                          — React entry
├── app.tsx                           — корень: Canvas, OrbitControls, Lights, MorphShowcase
├── index.css                         — Tailwind v4, тёмная тема
├── r3f-extensions.d.ts               — типы для TSL-материалов в JSX
├── types/uniforms.ts                 — хелпер типов для TSL uniform
├── utils/
│   ├── tunnels.ts                    — tunnel-rat портал для HTML overlay
│   ├── leva.ts                       — тёмная тема Leva
│   └── capitalize.ts                 — форматирование меток
├── components/
│   ├── canvas.tsx                    — R3F Canvas + WebGPURenderer
│   ├── lights.tsx                    — Ambient + Directional
│   ├── loader.tsx                    — полоса загрузки
│   ├── stats-monitor.tsx             — FPS-статистика (Leva toggle)
│   ├── ui/credit-overlay.tsx         — оверлей авторства моделей
│   ├── morph-particles/
│   │   ├── config.ts                 — дефолты, пресеты стилей, credits
│   │   ├── morph-showcase.tsx        — главный компонент: instancedMesh + хуки
│   │   ├── morph-textures-debug.tsx  — дебаг-визуализация DataArrayTexture
│   │   ├── morph-assets-credits.tsx  — оверлей ссылки на автора модели
│   │   ├── utils/morph-textures.ts   — MeshSurfaceSampler → DataArrayTexture
│   │   └── hooks/
│   │       ├── use-morph-meshes.ts       — glob моделей, GLTF загрузка
│   │       ├── use-morph-material.ts     — ядро: TSL-шейдер частиц
│   │       ├── use-morph-controls.ts     — Leva + GSAP цикл морфа
│   │       └── use-morph-system-settings.ts — разрешение + дебаг
│   └── button-3d/                    — отдельный пример TSL (не подключён в App)
│       ├── button-3d.tsx
│       ├── config.ts
│       └── use-button-3d-controls.ts
```

## Как работает система частиц

### 1. Загрузка моделей

`import.meta.glob("/public/models/*.glb")` автоматически находит все GLB. Каждый меш → morph target.

### 2. Запекание (`generateMorphTextures`)

`MeshSurfaceSampler` берёт `resolution²` точек с поверхности каждого меша. Позиции (xyz + случайный масштаб в w) и UV записываются в две **`DataArrayTexture`** (float, по слою на меш). Все формы живут в VRAM одновременно.

### 3. Рендеринг

`InstancedMesh` с `planeGeometry` (квад-спрайты), `spriteNodeMaterial`. Instance count = `resolution²`. Каждый инстанс — billboard.

### 4. TSL-шейдер (`use-morph-material.ts`)

- По instance index → текстурные координаты → семплирование слоёв A и B из DataArrayTexture
- `animationProgress` миксит позиции, размеры, цвета между двумя формами
- **Noise-текстура** десинхронизирует частицы (per-particle delay через `smoothstep`)
- **Chaos** — curl-подобное смещение в середине полёта (`progress*(1-progress)*4`)
- **Oscillation** — лёгкое движение в покое (noise + time + hashed id)
- **Внешний вид** — радиальное расстояние от центра UV → glow/hard/smooth пресеты

### 5. Цикл морфа (GSAP)

Каждые ~4 сек выбирается следующий меш, обновляются индексы слоёв, `gsap.to(animationProgress, {value:1, duration, ease:"none"})`.

## Конфигурация

- **resolution** (32–1024) → количество частиц = resolution²
- **Стили частиц**: `glow`, `hard`, `smooth` (размер, glowSpread, alphaCutoff, sharpness)
- **Анимация**: duration, sync, chaos amplitude/scale, oscillation amplitude/speed
- **Рендеринг**: transparent, additive blending, depthWrite, wireframe, alphaTest
- **Камера**: auto-rotate, orbit controls
- **Дебаг**: визуализация текстур позиций/UV/цветов

## Ключевые архитектурные решения

- **WebGPU + TSL** вместо WebGL + GLSL — нодовые материалы прямо в TypeScript
- **DataArrayTexture** — все формы в VRAM, морф = смена индекса слоя + progress
- **Instanced quads + sprite material** — эффективный instancing
- **tunnel-rat** — HTML-оверлеи из 3D-дерева
- **React Compiler** включён в Vite
- **Vite `import.meta.glob`** — автодискавери моделей без ручных импортов
