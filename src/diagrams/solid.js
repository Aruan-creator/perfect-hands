// Простые объёмные схемы: выпуклые многогранники в косоугольной проекции.
// Оси: x — вправо (вперёд у модели), y — вверх, z — вглубь (уходит вправо-вверх).

import { INK } from './kit.js'

const DX = 0.45
const DY = 0.32
// Направление взгляда: точки вдоль него проецируются в одну точку
const VIEW = [-DX, -DY, 1]
const LIGHT = normalize([-0.35, 0.85, -0.4])

function normalize(v) {
  const l = Math.hypot(...v) || 1
  return v.map((c) => c / l)
}
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const centroid = (pts) => pts.reduce((s, p) => [s[0] + p[0] / pts.length, s[1] + p[1] / pts.length, s[2] + p[2] / pts.length], [0, 0, 0])

// Нормаль многоугольника методом Ньюэлла
function newell(pts) {
  const n = [0, 0, 0]
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % pts.length]
    n[0] += (p[1] - q[1]) * (p[2] + q[2])
    n[1] += (p[2] - q[2]) * (p[0] + q[0])
    n[2] += (p[0] - q[0]) * (p[1] + q[1])
  })
  return normalize(n)
}

function shade(hex, k) {
  const v = parseInt(hex.slice(1), 16)
  const ch = [(v >> 16) & 255, (v >> 8) & 255, v & 255].map((c) => Math.max(0, Math.min(255, Math.round(c * k))))
  return '#' + ch.map((c) => c.toString(16).padStart(2, '0')).join('')
}

/** Собирает тело из граней и разворачивает нормали наружу. */
function solid(faces) {
  const all = faces.flatMap((f) => f.pts)
  const c = centroid(all)
  return faces.map((f) => {
    let n = newell(f.pts)
    if (dot3(n, sub(centroid(f.pts), c)) < 0) n = n.map((x) => -x)
    return { ...f, n }
  })
}

const ring = (profile, map) => profile.map(map)

/** Призма: профиль [x, y] вытянут вдоль z. Грани-крышки называются 'front' (z0) и 'back' (z1). */
export function prismZ(profile, z0, z1) {
  const a = ring(profile, ([x, y]) => [x, y, z0])
  const b = ring(profile, ([x, y]) => [x, y, z1])
  return solid([
    { id: 'front', pts: a },
    { id: 'back', pts: b },
    ...a.map((p, i) => ({ id: `side${i}`, pts: [p, a[(i + 1) % a.length], b[(i + 1) % b.length], b[i]] })),
  ])
}

/** Призма: профиль [x, z] вытянут вдоль y. Крышки — 'bottom' (y0) и 'top' (y1). */
export function prismY(profile, y0, y1) {
  const a = ring(profile, ([x, z]) => [x, y0, z])
  const b = ring(profile, ([x, z]) => [x, y1, z])
  return solid([
    { id: 'bottom', pts: a },
    { id: 'top', pts: b },
    ...a.map((p, i) => ({ id: `side${i}`, pts: [p, a[(i + 1) % a.length], b[(i + 1) % b.length], b[i]] })),
  ])
}

/** Цилиндр вдоль оси x (например, ствол). */
export function cylinderX(cy, cz, r, x0, x1, sides = 18) {
  const profile = Array.from({ length: sides }, (_, i) => {
    const t = (i / sides) * 2 * Math.PI
    return [cy + r * Math.sin(t), cz + r * Math.cos(t)]
  })
  const a = profile.map(([y, z]) => [x0, y, z])
  const b = profile.map(([y, z]) => [x1, y, z])
  return solid([
    { id: 'start', pts: a },
    { id: 'end', pts: b },
    ...a.map((p, i) => ({ id: `side${i}`, pts: [p, a[(i + 1) % sides], b[(i + 1) % sides], b[i]], smooth: true })),
  ])
}

/** Цилиндр вдоль оси z (колесо, ось-трубочка). */
export function cylinderZ(cx, cy, r, z0, z1, sides = 24) {
  return prismZ(
    Array.from({ length: sides }, (_, i) => {
      const t = (i / sides) * 2 * Math.PI
      return [cx + r * Math.cos(t), cy + r * Math.sin(t)]
    }),
    z0,
    z1,
  ).map((f) => (f.id.startsWith('side') ? { ...f, smooth: true } : f))
}

/** Цилиндр вдоль оси y (кольцо-погон). */
export function cylinderY(cx, cz, r, y0, y1, sides = 24) {
  return prismY(
    Array.from({ length: sides }, (_, i) => {
      const t = (i / sides) * 2 * Math.PI
      return [cx + r * Math.cos(t), cz + r * Math.sin(t)]
    }),
    y0,
    y1,
  ).map((f) => (f.id.startsWith('side') ? { ...f, smooth: true } : f))
}

/** Сдвигает тело — удобно для «разнесённых» схем. */
export function moved(body, [dx, dy, dz]) {
  return body.map((f) => ({ ...f, pts: f.pts.map(([x, y, z]) => [x + dx, y + dy, z + dz]) }))
}

export function view({ ox = 150, oy = 200, scale = 2 } = {}) {
  const project = ([x, y, z]) => [ox + (x + z * DX) * scale, oy - (y + z * DY) * scale]
  const pts = (list) => list.map((p) => project(p).map((c) => +c.toFixed(1)).join(',')).join(' ')
  const tone = (color, n) => shade(color, 0.72 + 0.38 * Math.max(0, dot3(n, LIGHT)))

  return {
    project,
    scale,

    /**
     * Рисует тело. open — id грани, которую не рисуем (коробка без крышки):
     * тогда сквозь проём видны внутренние стенки.
     */
    body(faces, color, { open = null, stroke = INK } = {}) {
      const outer = []
      const inner = []
      for (const f of faces) {
        if (f.id === open) continue
        ;(dot3(f.n, VIEW) < 0 ? outer : inner).push(f)
      }
      const draw = (f, fill) => {
        const s = f.smooth ? `stroke="${fill}" stroke-width="0.8"` : `stroke="${stroke}" stroke-width="2"`
        return `<polygon points="${pts(f.pts)}" fill="${fill}" ${s}/>`
      }
      let out = open ? inner.map((f) => draw(f, shade(color, 0.55))).join('') : ''
      out += outer.map((f) => draw(f, tone(color, f.n))).join('')
      // Контур для «гладких» тел, у которых не рисуются рёбра
      if (faces.some((f) => f.smooth)) {
        out += outer
          .filter((f) => !f.smooth)
          .map((f) => `<polygon points="${pts(f.pts)}" fill="none" stroke="${stroke}" stroke-width="2"/>`)
          .join('')
      }
      return out
    },

    /** Плоская деталь (боковинка, крышка) в пространстве. */
    plate(points3d, color) {
      return `<polygon points="${pts(points3d)}" fill="${color}" stroke="${INK}" stroke-width="2"/>`
    },

    /** Круг в плоскости z = const (колёса на боковине). */
    wheel(x, y, z, r, fill) {
      const [cx, cy] = project([x, y, z])
      return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(r * scale).toFixed(1)}" fill="${fill}" stroke="${INK}" stroke-width="2"/>`
    },

    /** Эллипс в горизонтальной плоскости (люк сверху). */
    hatch(x, y, z, r, fill) {
      const ring = Array.from({ length: 20 }, (_, i) => {
        const t = (i / 20) * 2 * Math.PI
        return [x + r * Math.cos(t), y, z + r * Math.sin(t)]
      })
      return `<polygon points="${pts(ring)}" fill="${fill}" stroke="${INK}" stroke-width="2"/>`
    },
  }
}
