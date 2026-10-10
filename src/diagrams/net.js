// Развёртки для печати в натуральную величину (единица — миллиметр).

const CUT = '#222'
const FOLD = '#2f6fd1'
const GLUE = '#d9d9d9'
const MOUNTAIN = '#d64545'

const n = (v) => +v.toFixed(2)
const pts = (list) => list.map(([x, y]) => `${n(x)},${n(y)}`).join(' ')

export const edgeLengths = (profile) => profile.map((p, i) => {
  const q = profile[(i + 1) % profile.length]
  return Math.hypot(q[0] - p[0], q[1] - p[1])
})

const LEGEND = {
  cut: (x) => `<line x1="${x}" y1="-1.2" x2="${x + 10}" y2="-1.2" stroke="${CUT}" stroke-width="0.4"/><text x="${x + 12}" y="0">резать</text>`,
  fold: (x) => `<line x1="${x}" y1="-1.2" x2="${x + 10}" y2="-1.2" stroke="${FOLD}" stroke-width="0.4" stroke-dasharray="2 1.2"/><text x="${x + 12}" y="0">сгибать</text>`,
  valley: (x) => `<line x1="${x}" y1="-1.2" x2="${x + 10}" y2="-1.2" stroke="${FOLD}" stroke-width="0.4" stroke-dasharray="2 1.2"/><text x="${x + 12}" y="0">сгиб внутрь</text>`,
  mountain: (x) => `<line x1="${x}" y1="-1.2" x2="${x + 10}" y2="-1.2" stroke="${MOUNTAIN}" stroke-width="0.4" stroke-dasharray="3 1 0.6 1"/><text x="${x + 12}" y="0">сгиб наружу</text>`,
  glue: (x) => `<rect x="${x}" y="-3.2" width="8" height="4" fill="${GLUE}"/><text x="${x + 10}" y="0">мазать клеем</text>`,
  hole: (x) => `<circle cx="${x + 3}" cy="-1.2" r="1.6" fill="#fff" stroke="${CUT}" stroke-width="0.3"/><line x1="${x + 1}" y1="-1.2" x2="${x + 5}" y2="-1.2" stroke="${CUT}" stroke-width="0.25"/><text x="${x + 8}" y="0">проколоть</text>`,
}

/**
 * Лист А4 (альбомный). meta — заголовок строкой или { title, legend: ['cut', 'fold', ...] }.
 */
export function page(meta, ...parts) {
  const { title, legend = ['cut', 'fold', 'glue'] } = typeof meta === 'string' ? { title: meta } : meta
  let lx = 0
  const items = legend.map((k) => {
    const out = LEGEND[k](lx)
    lx += k === 'mountain' || k === 'valley' ? 40 : k === 'glue' ? 38 : 32
    return out
  })
  return (
    `<svg width="297mm" height="210mm" viewBox="0 0 297 210" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif">` +
    `<rect width="297" height="210" fill="#fff"/>` +
    `<text x="10" y="8" font-size="4" fill="#555">${title}</text>` +
    `<g transform="translate(10 199)" font-size="3.4" fill="#555">` +
    items.join('') +
    `<text x="277" y="0" text-anchor="end">Печатать в масштабе 100%</text>` +
    `</g>` +
    parts.join('') +
    `</svg>`
  )
}

export function mountainLine(x1, y1, x2, y2) {
  return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${MOUNTAIN}" stroke-width="0.4" stroke-dasharray="3 1 0.6 1"/>`
}

/** Отметка для прокола: кружок с крестиком. */
export function hole(x, y, r = 1.6) {
  return `<circle cx="${n(x)}" cy="${n(y)}" r="${r}" fill="#fff" stroke="${CUT}" stroke-width="0.3"/><line x1="${n(x - r - 1)}" y1="${n(y)}" x2="${n(x + r + 1)}" y2="${n(y)}" stroke="${CUT}" stroke-width="0.25"/><line x1="${n(x)}" y1="${n(y - r - 1)}" x2="${n(x)}" y2="${n(y + r + 1)}" stroke="${CUT}" stroke-width="0.25"/>`
}

export function foldLine(x1, y1, x2, y2) {
  return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${FOLD}" stroke-width="0.35" stroke-dasharray="2 1.2"/>`
}

function text(x, y, s, size = 3.2) {
  return `<text x="${n(x)}" y="${n(y)}" font-size="${size}" text-anchor="middle" fill="#333">${s}</text>`
}

/**
 * Лента, которая обходит боковину по кругу. segments — длины рёбер профиля по порядку.
 * По обоим длинным краям — клапаны для приклеивания боковин, в конце — клапан, замыкающий ленту.
 */
export function band(x0, y0, segments, width, { fill = '#fff', tab = 5, endTab = 7, name = '', decorate = '' } = {}) {
  const L = segments.reduce((a, b) => a + b, 0)
  const top = []
  const bottom = []
  const tabs = []
  const folds = []
  let x = x0
  segments.forEach((len, i) => {
    const x1 = x
    const x2 = x + len
    const inset = Math.min(tab, Math.max(0.3, len / 2 - 1.5))
    const t = [
      [x1 + 0.8, y0],
      [x1 + 0.8 + inset, y0 - tab],
      [x2 - 0.8 - inset, y0 - tab],
      [x2 - 0.8, y0],
    ]
    const b = t.map(([px, py]) => [px, 2 * y0 + width - py]).reverse()
    top.push(...t)
    bottom.unshift(...b)
    tabs.push(t, b)
    if (i > 0) folds.push(foldLine(x1, y0, x1, y0 + width))
    x = x2
  })
  const end = [
    [x0 + L, y0 + 1],
    [x0 + L + endTab, y0 + 2.5],
    [x0 + L + endTab, y0 + width - 2.5],
    [x0 + L, y0 + width - 1],
  ]
  const outline = [[x0, y0], ...top, [x0 + L, y0], ...end, [x0 + L, y0 + width], ...bottom, [x0, y0 + width]]
  return (
    tabs.map((t) => `<polygon points="${pts(t)}" fill="${GLUE}"/>`).join('') +
    `<polygon points="${pts(end)}" fill="${GLUE}"/>` +
    `<rect x="${n(x0)}" y="${n(y0)}" width="${n(L)}" height="${n(width)}" fill="${fill}"/>` +
    decorate +
    `<polygon points="${pts(outline)}" fill="none" stroke="${CUT}" stroke-width="0.4"/>` +
    folds.join('') +
    foldLine(x0, y0, x0 + L, y0) +
    foldLine(x0, y0 + width, x0 + L, y0 + width) +
    foldLine(x0 + L, y0, x0 + L, y0 + width) +
    (name ? text(x0 + 30, y0 + width / 2 + 1.2, name) : '')
  )
}

/** Плоская деталь по контуру (боковина, крышка). Профиль задаётся «y вверх», как в схемах. */
export function plate(x0, y0, profile, { fill = '#fff', name = '', mirror = false, decorate = () => '' } = {}) {
  const maxX = Math.max(...profile.map((p) => p[0]))
  const maxY = Math.max(...profile.map((p) => p[1]))
  const map = ([x, y]) => [x0 + (mirror ? maxX - x : x), y0 + maxY - y]
  return (
    `<polygon points="${pts(profile.map(map))}" fill="${fill}" stroke="${CUT}" stroke-width="0.4"/>` +
    decorate(map) +
    (name ? text(x0 + maxX / 2, y0 + maxY / 2 + 1.2, name) : '')
  )
}

/** Прямоугольная полоска; glue — ширина зоны для клея на правом конце. */
export function strip(x0, y0, w, h, { fill = '#fff', glue = 0, name = '', decorate = '' } = {}) {
  return (
    `<rect x="${n(x0)}" y="${n(y0)}" width="${n(w)}" height="${n(h)}" fill="${fill}"/>` +
    (glue ? `<rect x="${n(x0 + w - glue)}" y="${n(y0)}" width="${n(glue)}" height="${n(h)}" fill="${GLUE}"/>` : '') +
    decorate +
    `<rect x="${n(x0)}" y="${n(y0)}" width="${n(w)}" height="${n(h)}" fill="none" stroke="${CUT}" stroke-width="0.4"/>` +
    (name ? text(x0 + (w - glue) / 2, y0 + h / 2 + 1.2, name, Math.min(3.2, h * 0.6)) : '')
  )
}

export const cutLine = (x1, y1, x2, y2) =>
  `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${CUT}" stroke-width="0.4"/>`

export const label = text

/** Уменьшенная копия листа шаблона для схем (холст 300×300). */
export function thumbnail(x, y, w, sheet) {
  const h = (w * 210) / 297
  return `<rect x="${x + 3}" y="${y + 3}" width="${w}" height="${h}" fill="#e7dccd"/>` + sheet.replace('width="297mm" height="210mm"', `x="${x}" y="${y}" width="${w}" height="${h}"`)
}
