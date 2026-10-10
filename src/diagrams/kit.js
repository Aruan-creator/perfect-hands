// Небольшой набор функций для рисования схем в SVG.
// Все схемы рисуются на холсте 300×300.

export const INK = '#4a3424'
export const FOLD = '#2f6fd1'
export const ARROW = '#e0325f'
export const WHITE_SIDE = '#fffaf0'

const n = (v) => +v.toFixed(1)
const pts = (list) => list.map(([x, y]) => `${n(x)},${n(y)}`).join(' ')

export function svg(...parts) {
  return box('0 0 300 300', ...parts)
}

/** Тот же холст, но с другой видимой областью — чтобы приблизить мелкую фигуру. */
export function box(viewBox, ...parts) {
  return `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" stroke-linejoin="round">${parts.join('')}</svg>`
}

export function poly(points, fill, { stroke = INK, width = 2.5 } = {}) {
  return `<polygon points="${pts(points)}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`
}

export function path(d, { fill = 'none', stroke = INK, width = 2.5, cap = 'round', extra = '' } = {}) {
  return `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="${cap}" ${extra}/>`
}

export function line(x1, y1, x2, y2, { stroke = INK, width = 2.5, dash = '' } = {}) {
  const d = dash ? ` stroke-dasharray="${dash}"` : ''
  return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"${d}/>`
}

/** Линия сгиба «долиной» (сгибаем к себе) — пунктир. */
export function valley(x1, y1, x2, y2) {
  return line(x1, y1, x2, y2, { stroke: FOLD, width: 3, dash: '10 7' })
}

/** Линия сгиба «горой» (отгибаем назад) — штрих-пунктир. */
export function mountain(x1, y1, x2, y2) {
  return line(x1, y1, x2, y2, { stroke: FOLD, width: 3, dash: '14 6 3 6' })
}

/** Уже намеченная линия сгиба — тонкая линия. */
export function crease(x1, y1, x2, y2) {
  return line(x1, y1, x2, y2, { stroke: INK, width: 1.2 })
}

/**
 * Изогнутая стрелка из (x1,y1) в (x2,y2).
 * bend > 0 выгибает стрелку влево по ходу движения, bend < 0 — вправо.
 */
export function arrow(x1, y1, x2, y2, { bend = 0.35, color = ARROW, width = 4, dash = '' } = {}) {
  const dx = x2 - x1
  const dy = y2 - y1
  const cx = (x1 + x2) / 2 + dy * bend
  const cy = (y1 + y2) / 2 - dx * bend
  let tx = x2 - cx
  let ty = y2 - cy
  const len = Math.hypot(tx, ty) || 1
  tx /= len
  ty /= len
  const head = 16
  const half = 9
  const bx = x2 - tx * head
  const by = y2 - ty * head
  const p1 = [bx - ty * half, by + tx * half]
  const p2 = [bx + ty * half, by - tx * half]
  const d = dash ? ` stroke-dasharray="${dash}"` : ''
  return (
    `<path d="M${n(x1)} ${n(y1)} Q${n(cx)} ${n(cy)} ${n(bx)} ${n(by)}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"${d}/>` +
    `<polygon points="${pts([[x2, y2], p1, p2])}" fill="${color}"/>`
  )
}

export function circle(cx, cy, r, fill, { stroke = INK, width = 2.5 } = {}) {
  return `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`
}

export function dot(cx, cy, r = 5, fill = INK) {
  return `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"/>`
}

/** Глазик: белок, зрачок и блик. */
export function eye(cx, cy, r = 9) {
  return circle(cx, cy, r, '#fff', { width: 2 }) + dot(cx + r * 0.2, cy + r * 0.15, r * 0.55) + dot(cx + r * 0.35, cy - r * 0.1, r * 0.18, '#fff')
}

export function label(x, y, text, { size = 18, color = INK, anchor = 'middle', weight = 600 } = {}) {
  return `<text x="${n(x)}" y="${n(y)}" font-size="${size}" fill="${color}" text-anchor="${anchor}" font-weight="${weight}" font-family="inherit">${text}</text>`
}

export function emoji(x, y, char, size = 40) {
  return `<text x="${n(x)}" y="${n(y)}" font-size="${size}" text-anchor="middle" dominant-baseline="central">${char}</text>`
}

/** Значок «переверни лист». */
export function flipMark(x, y) {
  return (
    arrow(x - 28, y + 6, x + 28, y + 6, { bend: 0.6, width: 3.5, color: FOLD }) +
    label(x, y + 30, 'переверни', { size: 14, color: FOLD })
  )
}

/**
 * Фигура, обведённая одним общим контуром: сначала рисуем все части
 * с толстой обводкой, потом поверх — без обводки. Внутренние линии исчезают.
 */
export function outlined(shapes, fill, { stroke = INK, width = 2.5, transform = '' } = {}) {
  const t = transform ? ` transform="${transform}"` : ''
  const under = shapes.map((s) => s.replace('/>', ` fill="${stroke}" stroke="${stroke}" stroke-width="${width * 2}"/>`)).join('')
  const over = shapes.map((s) => s.replace('/>', ` fill="${fill}"/>`)).join('')
  return `<g${t}>${under}${over}</g>`
}

/** Толстая «колбаска» по пути (для пластилина) с контуром. */
export function sausage(d, color, thickness) {
  return (
    path(d, { stroke: INK, width: thickness + 5 }) +
    path(d, { stroke: color, width: thickness }) +
    path(d, { stroke: 'rgba(255,255,255,0.35)', width: thickness * 0.22, extra: `transform="translate(0 ${-thickness * 0.22})"` })
  )
}

/** Точка пересечения прямых (a1,a2) и (b1,b2). */
export function intersect(a1, a2, b1, b2) {
  const d = (a1[0] - a2[0]) * (b1[1] - b2[1]) - (a1[1] - a2[1]) * (b1[0] - b2[0])
  const u = a1[0] * a2[1] - a1[1] * a2[0]
  const v = b1[0] * b2[1] - b1[1] * b2[0]
  return [(u * (b1[0] - b2[0]) - (a1[0] - a2[0]) * v) / d, (u * (b1[1] - b2[1]) - (a1[1] - a2[1]) * v) / d]
}

/** Отражение точки p относительно прямой через a и b — для расчёта складок. */
export function reflect(p, a, b) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)
  const fx = a[0] + t * dx
  const fy = a[1] + t * dy
  return [2 * fx - p[0], 2 * fy - p[1]]
}
