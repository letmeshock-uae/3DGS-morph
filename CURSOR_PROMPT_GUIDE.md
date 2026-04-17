# Cursor Prompt Guide
## TSL Morphing Particles — Scroll-Driven Landing Page

> Этот гайд — последовательность промптов для Cursor.
> Вставляй каждый промпт в чат Cursor **по очереди**, не пропуская шагов.
> Перед каждым промптом открой нужные файлы через Cursor's `@file`.

---

## Архитектура, которую мы строим

```
Было:  GSAP auto-cycle каждые 4 сек → animationProgress
Стало: scrollY → normalized progress → morphIndex + transitionProgress
```

**Принцип маппинга скролла:**
```
morphT = scrollProgress * numMeshes          // 0 → N (float)
shapeA = Math.floor(morphT)                  // текущая форма
shapeB = shapeA + 1                          // следующая форма
transitionT = morphT - shapeA               // 0→1 внутри перехода
```

Каждый viewport-height скролла = один полный морф-переход.

**Структура лендинга:**
- Canvas: `position: fixed`, всегда на экране
- Scroll-контейнер: height = `(numMeshes + 1) * 100vh`
- Секции: absolute/sticky, появляются и исчезают по скроллу
- HUD: показывает текущую форму и progress

**Новые файлы:**
```
src/hooks/use-scroll-progress.ts
src/components/morph-particles/hooks/use-scroll-morph.ts
src/components/landing/landing-page.tsx
src/components/landing/landing-sections.tsx
src/components/landing/use-section-visibility.ts
```

**Модифицируемые файлы:**
```
src/components/morph-particles/hooks/use-morph-controls.ts   ← главный
src/components/morph-particles/morph-showcase.tsx             ← layout mode
src/components/canvas.tsx                                      ← fixed position
src/app.tsx                                                    ← routing
```

---

## STEP 0 — Контекст для Cursor

Вставь это **один раз в начале сессии** как системный контекст:

```
@PROJECT.md

Контекст проекта: TSL Morphing Particles — WebGPU-демо на R3F.
Задача: добавить scroll-driven режим к существующей системе морфа.
Ничего не ломаем — добавляем параллельный режим через пропс `mode`.
Весь существующий Leva-контрол и GSAP auto-cycle должны остаться рабочими.
TypeScript strict mode, никаких any.
```

---

## STEP 1 — Хук нормализованного скролла

**Открой:** ничего, новый файл

**Промпт:**
```
Создай @src/hooks/use-scroll-progress.ts

Хук useScrollProgress():
- Возвращает { scrollY, scrollProgress, isScrolling }
- scrollProgress: number 0→1 (scrollY / maxScrollY)
- maxScrollY = document.documentElement.scrollHeight - window.innerHeight
- Использует useEffect + window scroll listener с passive: true
- isScrolling: true в течение 150ms после последнего scroll-события (useRef + clearTimeout)
- Очищает listeners в cleanup
- SSR-safe: проверяет typeof window !== 'undefined'
- Экспортирует тип ScrollProgressState
```

---

## STEP 2 — Хук морфа по скроллу

**Открой:** `@src/components/morph-particles/hooks/use-morph-controls.ts`

**Промпт:**
```
@src/components/morph-particles/hooks/use-morph-controls.ts
@src/hooks/use-scroll-progress.ts

Создай @src/components/morph-particles/hooks/use-scroll-morph.ts

Этот хук — scroll-driven альтернатива use-morph-controls.
Он принимает те же зависимости (meshNames, uniforms), но управляется скроллом.

Интерфейс:
  useScrollMorph(meshNames: string[], uniforms: MorphUniforms): ScrollMorphResult

ScrollMorphResult:
  currentShapeName: string
  nextShapeName: string
  morphProgress: number        // 0→1 текущего перехода
  globalProgress: number       // 0→1 от начала до конца лендинга
  shapeIndexA: number
  shapeIndexB: number

Логика:
1. Вызывает useScrollProgress()
2. morphT = scrollProgress * (meshNames.length - 1)
   — не умножаем на meshNames.length, а на (length - 1),
     чтобы последняя форма была при scroll=1.0
3. shapeIndexA = Math.floor(morphT), clamp 0..length-2
4. shapeIndexB = shapeIndexA + 1, clamp 0..length-1
5. transitionT = morphT - shapeIndexA (уже 0→1)
6. В useEffect при изменении shapeIndexA/shapeIndexB:
   - обновляет uniforms.morphIndexA.value = shapeIndexA
   - обновляет uniforms.morphIndexB.value = shapeIndexB
7. В useEffect при изменении transitionT:
   - uniforms.animationProgress.value = transitionT
8. Никакого GSAP — прямое присваивание uniform.value

Важно: не трогает Leva, не добавляет собственных контролов.
```

---

## STEP 3 — Модификация use-morph-controls

**Открой:** `@src/components/morph-particles/hooks/use-morph-controls.ts`

**Промпт:**
```
@src/components/morph-particles/hooks/use-morph-controls.ts

Добавь параметр mode: 'auto' | 'scroll' к хуку use-morph-controls.
Дефолт: 'auto'.

При mode === 'scroll':
- Не запускать GSAP timeline и не вешать setInterval/setTimeout
- Отключить Leva-контролы для duration и sync (скрыть их через Leva schema, 
  используя render: () => mode === 'auto')
- Возвращать те же uniforms — они будут управляться извне

При mode === 'auto':
- Поведение полностью прежнее

Leva-контрол "Mode" добавь в секцию "Animation":
  type: 'select', options: ['auto', 'scroll'], дефолт: 'auto'

Важно: mode — это пропс хука, не только Leva. Если пропс передан — 
Leva-контрол mode инициализируется им, но пользователь может переключить.

Верни { ...existingReturn, activeMode: 'auto' | 'scroll' }
```

---

## STEP 4 — Модификация MorphShowcase

**Открой:** `@src/components/morph-particles/morph-showcase.tsx`

**Промпт:**
```
@src/components/morph-particles/morph-showcase.tsx
@src/components/morph-particles/hooks/use-morph-controls.ts
@src/components/morph-particles/hooks/use-scroll-morph.ts

Добавь пропс mode?: 'auto' | 'scroll' к компоненту MorphShowcase.
Дефолт: 'auto'.

Логика:
- Передай mode в use-morph-controls
- Если activeMode === 'scroll', дополнительно вызови useScrollMorph(meshNames, uniforms)
  (useScrollMorph не делает ничего лишнего если uniforms уже правильно заданы)
- Если activeMode === 'auto', useScrollMorph не вызывать

Экспортируй также scrollState из useScrollMorph — он нужен лендингу для
отображения UI-элементов (currentShapeName, globalProgress).
Пробрось через onScrollState?: (state: ScrollMorphResult) => void callback.
```

---

## STEP 5 — Фиксированный Canvas для лендинга

**Открой:** `@src/components/canvas.tsx`

**Промпт:**
```
@src/components/canvas.tsx

Добавь пропс fixed?: boolean к компоненту Canvas (или его wrapper div).

При fixed === true:
- Враппер получает style: position: 'fixed', inset: 0, zIndex: 0
- pointerEvents: 'none' (скролл должен проходить сквозь canvas к странице)

При fixed === false (дефолт):
- Поведение прежнее

Не трогай WebGPURenderer, gl, camera — только позиционирование.
```

---

## STEP 6 — Компонент секций лендинга

**Открой:** ничего, новый файл

**Промпт:**
```
Создай @src/components/landing/landing-sections.tsx

Это чисто HTML/CSS компонент — никаких Three.js зависимостей.

Принимает:
  interface LandingSectionsProps {
    meshNames: string[]          // ['duck', 'fox', 'robot', ...]
    scrollMorphState: ScrollMorphResult | null
  }

Рендерит scroll-контейнер:
  - position: relative
  - height: (meshNames.length + 1) * 100vh   ← +1 для hero-секции

Внутри секции:
  1. Hero-секция (h: 100vh, sticky top:0):
     - Заголовок проекта (Bebas Neue или любой display font через className)
     - Подзаголовок "WebGPU · TSL · React Three Fiber"
     - Scroll hint: маленькая анимированная стрелка вниз
     - Тексты из config.ts если он экспортирует описание проекта

  2. Morph-секции (по одной на каждый mesh, h: 100vh каждая):
     - Рендерятся через meshNames.map()
     - Позиция: sticky top:0 или absolute — выбери что выглядит лучше
     - Контент: имя меша, порядковый номер, короткое описание (placeholder)
     - Opacity/transform анимируется через CSS transition на основе
       того, насколько эта секция "активна" (сравни с scrollMorphState)
     - "Активна" = shapeIndexA === i || shapeIndexB === i

  3. Final-секция (h: 100vh):
     - Итоговое состояние: все формы пройдены
     - CTA или credits

Используй Tailwind классы. Никакого inline style кроме динамических значений.
Экспортируй как default.
```

---

## STEP 7 — Главный компонент лендинга

**Открой:** `@src/app.tsx`, `@src/components/canvas.tsx`, `@src/components/morph-particles/morph-showcase.tsx`

**Промпт:**
```
@src/app.tsx
@src/components/canvas.tsx
@src/components/morph-particles/morph-showcase.tsx
@src/components/landing/landing-sections.tsx

Создай @src/components/landing/landing-page.tsx

Компонент LandingPage:
1. State: scrollMorphState: ScrollMorphResult | null — useState
2. Хук useMorphMeshes (или получи meshNames из контекста/пропса)

Layout:
  <div style={{ position: 'relative' }}>
    {/* Фиксированный 3D слой */}
    <Canvas fixed>
      <MorphShowcase
        mode="scroll"
        onScrollState={setScrollMorphState}
      />
    </Canvas>

    {/* Скроллируемый контент поверх */}
    <LandingSections
      meshNames={meshNames}
      scrollMorphState={scrollMorphState}
    />

    {/* HUD — progress и название формы */}
    <ScrollHUD state={scrollMorphState} />
  </div>

ScrollHUD — inline маленький компонент внутри этого же файла:
  - position: fixed, bottom: 2rem, right: 2rem
  - Показывает currentShapeName и (globalProgress * 100).toFixed(0) + '%'
  - Анимируется fade-in при первом скролле

Пока не трогай app.tsx — просто создай компонент.
```

---

## STEP 8 — Роутинг (финальный шаг)

**Открой:** `@src/app.tsx`

**Промпт:**
```
@src/app.tsx
@src/components/landing/landing-page.tsx

Добавь в app.tsx простой роутинг без внешних библиотек:

const isLanding = window.location.pathname === '/landing' 
                  || new URLSearchParams(window.location.search).has('landing')

Если isLanding:
  рендерить <LandingPage />

Иначе:
  рендерить существующий контент (Canvas + MorphShowcase в auto-режиме)

Не меняй существующий рендер — только оберни в условие.
```

---

## STEP 9 — Финальный промпт: шлифовка

После того как всё собрано и работает — запусти этот промпт:

**Промпт:**
```
Проверь landing-page и исправь следующее:

1. Скролл-секции не должны перекрывать canvas кликами —
   убедись что pointer-events: none только там где нет интерактивного контента.

2. На мобильных (< 768px) текстовые панели должны быть снизу экрана,
   а не справа. Проверь breakpoints.

3. Переход между секциями: когда morphProgress < 0.1 или > 0.9 — 
   соответствующая секция должна быть opacity: 1.
   В середине перехода (0.4–0.6) обе секции полупрозрачны.
   Реализуй через CSS transition, не JS animation loop.

4. Добавь <title> и <meta description> специфичные для лендинга.

5. При режиме scroll — OrbitControls должны быть отключены
   (иначе конфликт: пользователь крутит мышью AND скроллит).
   Передай enableOrbit={activeMode !== 'scroll'} в MorphShowcase.
```

---

## Архитектурные заметки для Cursor

Можешь вставить этот блок перед любым промптом если Cursor теряет контекст:

```
Архитектурные ограничения проекта:
- WebGPURenderer: не заменять на WebGLRenderer
- TSL-материалы: не переписывать шейдеры на GLSL
- Uniforms управляются через .value — не через setState
- R3F Canvas: должен оставаться единственным, не дублировать
- use-morph-controls: GSAP auto-режим должен работать как раньше
- Leva: controls остаются, просто некоторые скрыты в scroll-режиме
- TypeScript: никаких as any, никаких @ts-ignore
```

---

## Структура данных для ссылок между промптами

```typescript
// Типы которые должны появиться после Step 1-2 и
// на которые ссылаются все последующие промпты:

interface ScrollMorphResult {
  currentShapeName: string
  nextShapeName: string
  morphProgress: number      // 0→1 текущего перехода
  globalProgress: number     // 0→1 от начала до конца
  shapeIndexA: number
  shapeIndexB: number
}

interface ScrollProgressState {
  scrollY: number
  scrollProgress: number     // 0→1
  isScrolling: boolean
}
```

---

## Порядок запуска для проверки

```bash
# После всех изменений
npm run dev

# Открой в браузере:
http://localhost:5173/?landing   # scroll-режим
http://localhost:5173/           # auto-режим (должен работать как раньше)
```

**Что проверить:**
- [ ] Auto-режим не сломан (морф идёт сам, Leva работает)
- [ ] Scroll-режим: каждый viewport-scroll = один морф-переход
- [ ] OrbitControls отключены в scroll-режиме
- [ ] HUD обновляется в реальном времени
- [ ] Текстовые секции fade in/out синхронно с морфом
- [ ] На мобильном — canvas видно, текст не перекрывает частицы полностью
