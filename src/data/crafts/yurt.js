import { svg, arrow, emoji, label, INK } from '../../diagrams/kit.js'
import { page, strip, hole, thumbnail } from '../../diagrams/net.js'

// Юрта (киіз үй) с раздвижной решёткой-кереге. Все размеры — в миллиметрах.
//
// Кереге: 8 «иксов» из полосок. В каждой полоске 3 отверстия: два по концам и одно
// посередине, расстояние между крайними L. Иксы сцеплены концами в цепочку, а концы
// цепочки крепятся к дверной раме. Если раздвинуть цепочку до шага PITCH, полоски
// встанут под углом α, а высота стены станет H = L·sin α.

const L = 80
const STRIP_W = 8
const STRIP_MARGIN = 5
const N_X = 8
const PITCH = 43
const ALPHA = Math.acos(PITCH / L)
const H = L * Math.sin(ALPHA)
const DOOR_W = 36
const CIRC = N_X * PITCH + DOOR_W
const R = CIRC / (2 * Math.PI)

// Крыша: уықтар идут от верха кереге к шаңыраку
const SH_R = 14 // радиус шаңырака, куда приходят уықтар
const SH_OUTER = 16
const ROOF_RISE = 30
const OVERHANG = 4
const slope = ROOF_RISE / (R - SH_R)
const UYK_LEN = Math.hypot(R - SH_R, ROOF_RISE)

// Развёртка усечённого конуса для покрышки крыши
const R2 = R + OVERHANG
const R1 = SH_R
const SLANT = Math.hypot(R2 - R1, (R2 - R1) * slope)
const OUT_R = (R2 * SLANT) / (R2 - R1)
const IN_R = (R1 * SLANT) / (R2 - R1)
const SECTOR = (360 * R2) / OUT_R

// Углы верхних и нижних концов полосок по кругу. Дверь смотрит на нас (−90°).
const deg = (a) => (a * 180) / Math.PI
const DOOR_ARC = deg(DOOR_W / R)
const PITCH_ARC = deg(PITCH / R)
const TIPS = Array.from({ length: N_X + 1 }, (_, k) => -90 + DOOR_ARC / 2 + k * PITCH_ARC)

const C = {
  wood: '#c8a165',
  woodBack: '#e6d3ac',
  door: '#d84315',
  doorDark: '#a5300f',
  felt: '#f6f1e7',
  feltShade: '#e4dccb',
  band: '#c62828',
  gold: '#e0b84c',
  ground: '#d7ead0',
}

const n = (v) => +v.toFixed(1)
const P3 = (angle, r, y) => [r * Math.cos((angle * Math.PI) / 180), y, r * Math.sin((angle * Math.PI) / 180)]

// --- Объёмная юрта ---
// Своя проекция «спереди и чуть сверху»: круг становится ровным эллипсом, дверь — по центру.

const TILT = 0.34
function view({ ox, oy, scale }) {
  const project = ([x, y, z]) => [ox + x * scale, oy - (y * 0.94 + z * TILT) * scale]
  const ellipse = (y, r, fill, stroke = INK, w = 2) => {
    const pts = Array.from({ length: 48 }, (_, i) => project(P3((i / 48) * 360, r, y)))
    return `<polygon points="${pts.map(([x, yy]) => `${n(x)},${n(yy)}`).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"/>`
  }
  return { project, scale, ellipse }
}

function yurt({ k = 1.6, uyks = true, shanyrak = true, roof = false, base = true, doorOpen = true } = {}) {
  const v = view({ ox: 150, oy: 232, scale: k })
  const seg = (a, b, color, w) => {
    const [x1, y1] = v.project(a)
    const [x2, y2] = v.project(b)
    return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`
  }
  const back = []
  const front = []
  const put = (a, b, w = 3.4) => {
    const z = (a[2] + b[2]) / 2
    ;(z > -R * 0.15 ? back : front).push([a, b, w])
  }
  // Кереге
  for (let i = 0; i < N_X; i++) {
    const a = TIPS[i]
    const b = TIPS[i + 1]
    put(P3(a, R, 0), P3(b, R, H))
    put(P3(a, R, H), P3(b, R, 0))
  }
  // Уықтар
  if (uyks) for (const a of TIPS) put(P3(a, R, H), P3(a, SH_R, H + ROOF_RISE), 2.6)

  let out = ''
  if (base) out += v.ellipse(0, R + 14, C.ground)
  out += back.map(([a, b, w]) => seg(a, b, C.woodBack, w)).join('')
  if (shanyrak) out += shanyrakRing(v)
  out += front.map(([a, b, w]) => seg(a, b, C.wood, w)).join('')
  // Брадсы на передних узлах
  for (const a of TIPS) {
    const [x, y, z] = P3(a, R, 0)
    if (z < 0) for (const p of [[x, 0, z], [x, H, z]]) out += dot(v, p)
  }
  for (let i = 0; i < N_X; i++) {
    const p = P3((TIPS[i] + TIPS[i + 1]) / 2, R * Math.cos(((PITCH_ARC / 2) * Math.PI) / 180), H / 2)
    if (p[2] < 0) out += dot(v, p)
  }
  out += door(v, doorOpen)
  if (roof) out += roofCover(v)
  return out
}

const dot = (v, p) => {
  const [x, y] = v.project(p)
  return `<circle cx="${n(x)}" cy="${n(y)}" r="2.6" fill="${C.gold}" stroke="${INK}" stroke-width="1"/>`
}

function door(v, open) {
  const a1 = TIPS[N_X] - 360
  const a2 = TIPS[0]
  const p = (a, y) => v.project(P3(a, R, y))
  const frame = [p(a1, 0), p(a2, 0), p(a2, H), p(a1, H)]
  const pts = (list) => list.map(([x, y]) => `${n(x)},${n(y)}`).join(' ')
  // Створка открыта наружу, на петлях слева
  const [hx, hy] = p(a1, 4)
  const [hx2, hy2] = p(a1, H - 4)
  const w = (DOOR_W - 8) * v.scale
  const flap = open
    ? [[hx, hy], [hx - w * 0.55, hy + w * 0.3], [hx2 - w * 0.55, hy2 + w * 0.3], [hx2, hy2]]
    : [p(a1 + 1.5, 4), p(a2 - 1.5, 4), p(a2 - 1.5, H - 4), p(a1 + 1.5, H - 4)]
  const inner = [p(a1 + 4, 4), p(a2 - 4, 4), p(a2 - 4, H - 4), p(a1 + 4, H - 4)]
  return (
    `<polygon points="${pts(frame)}" fill="${C.door}" stroke="${INK}" stroke-width="2"/>` +
    `<polygon points="${pts(inner)}" fill="${open ? '#3e2723' : C.doorDark}" stroke="${INK}" stroke-width="1.5"/>` +
    `<polygon points="${pts(flap)}" fill="${C.door}" stroke="${INK}" stroke-width="2"/>`
  )
}

function shanyrakRing(v) {
  const y = H + ROOF_RISE
  const ring = (r) =>
    Array.from({ length: 36 }, (_, i) => v.project(P3((i / 36) * 360, r, y)))
      .map(([x, yy]) => `${n(x)},${n(yy)}`)
      .join(' ')
  const bar = (a, off) => {
    const [x1, y1] = v.project([Math.cos(a) * -SH_R + Math.sin(a) * off, y, Math.sin(a) * -SH_R - Math.cos(a) * off])
    const [x2, y2] = v.project([Math.cos(a) * SH_R + Math.sin(a) * off, y, Math.sin(a) * SH_R - Math.cos(a) * off])
    const [mx, my] = v.project([Math.sin(a) * off, y + 6, -Math.cos(a) * off])
    return `<path d="M${n(x1)} ${n(y1)} Q${n(2 * mx - (x1 + x2) / 2)} ${n(2 * my - (y1 + y2) / 2)} ${n(x2)} ${n(y2)}" fill="none" stroke="${C.wood}" stroke-width="2.4"/>`
  }
  return (
    `<polygon points="${ring(SH_OUTER)}" fill="none" stroke="${INK}" stroke-width="5.5"/>` +
    `<polygon points="${ring(SH_OUTER)}" fill="none" stroke="${C.gold}" stroke-width="3.5"/>` +
    [-5, 5].map((o) => bar(0, o)).join('') +
    [-5, 5].map((o) => bar(Math.PI / 2, o)).join('')
  )
}

function roofCover(v) {
  const steps = 40
  const yLow = H - OVERHANG * slope
  const yTop = H + ROOF_RISE
  const lower = []
  const upper = []
  // Видимая (передняя) половина: углы от 180° до 360°, с небольшим запасом из-за проекции
  for (let i = 0; i <= steps; i++) {
    const a = 180 + (i / steps) * 180
    lower.push(v.project(P3(a, R2, yLow)))
    upper.push(v.project(P3(a, R1, yTop)))
  }
  const pts = (list) => list.map(([x, y]) => `${n(x)},${n(y)}`).join(' ')
  const bandOuter = lower
  const bandInner = []
  for (let i = 0; i <= steps; i++) {
    const a = 180 + (i / steps) * 180
    bandInner.push(v.project(P3(a, R2 - 7, yLow + 7 * slope)))
  }
  // Задняя часть покрышки видна над передней
  const backTop = []
  for (let i = 0; i <= steps; i++) backTop.push(v.project(P3((i / steps) * 180, R2, yLow)))
  return (
    `<polygon points="${pts([...backTop.slice().reverse(), ...upper])}" fill="${C.feltShade}" stroke="${INK}" stroke-width="2"/>` +
    `<polygon points="${pts([...lower, ...upper.slice().reverse()])}" fill="${C.felt}" stroke="${INK}" stroke-width="2"/>` +
    `<polygon points="${pts([...bandOuter, ...bandInner.slice().reverse()])}" fill="${C.band}" stroke="${INK}" stroke-width="1.5"/>` +
    shanyrakRing(v)
  )
}

// --- Плоские схемы ---

/** Полоска с тремя отверстиями, повёрнутая на угол a вокруг середины. */
function stripAt(cx, cy, a, k, color = C.wood) {
  const len = (L + 2 * STRIP_MARGIN) * k
  const w = STRIP_W * k
  return (
    `<g transform="translate(${n(cx)} ${n(cy)}) rotate(${n(a)})">` +
    `<rect x="${n(-len / 2)}" y="${n(-w / 2)}" width="${n(len)}" height="${n(w)}" rx="${n(w / 3)}" fill="${color}" stroke="${INK}" stroke-width="2"/>` +
    [-L / 2, 0, L / 2].map((x) => `<circle cx="${n(x * k)}" cy="0" r="${n(1.8 * k)}" fill="#fff" stroke="${INK}" stroke-width="1"/>`).join('') +
    `</g>`
  )
}

const bradAt = (x, y, r = 5) => `<circle cx="${n(x)}" cy="${n(y)}" r="${r}" fill="${C.gold}" stroke="${INK}" stroke-width="1.5"/>`

function oneX(cx, cy, k, angle) {
  return stripAt(cx, cy, -angle, k) + stripAt(cx, cy, angle, k, '#d9b679') + bradAt(cx, cy)
}

/** Цепочка иксов при заданном угле (в градусах от горизонтали). */
function chain(x0, cy, count, angleDeg, k) {
  const a = (angleDeg * Math.PI) / 180
  const pitch = L * Math.cos(a) * k
  const h = L * Math.sin(a) * k
  let out = ''
  for (let i = 0; i < count; i++) out += stripAt(x0 + pitch * (i + 0.5), cy, -angleDeg, k) + stripAt(x0 + pitch * (i + 0.5), cy, angleDeg, k, '#d9b679')
  for (let i = 0; i <= count; i++) out += bradAt(x0 + pitch * i, cy - h / 2, 4) + bradAt(x0 + pitch * i, cy + h / 2, 4)
  for (let i = 0; i < count; i++) out += bradAt(x0 + pitch * (i + 0.5), cy, 4)
  return out
}

// --- Шаблон ---

const PAPER = '#f3e3c3'

function stripPart(x, y) {
  return strip(x, y, L + 2 * STRIP_MARGIN, STRIP_W, { fill: PAPER }) + [0, L / 2, L].map((d) => hole(x + STRIP_MARGIN + d, y + STRIP_W / 2, 1.3)).join('')
}

function doorPart(x, y) {
  const w = DOOR_W + 8
  const h = H + 8
  return (
    `<rect x="${x}" y="${y}" width="${w}" height="${n(h)}" fill="#ffccbc" stroke="#222" stroke-width="0.4"/>` +
    // Створка: резать по трём сторонам, по четвёртой сгибать
    `<polyline points="${x + 8},${y + 8} ${x + w - 8},${y + 8} ${x + w - 8},${n(y + h - 8)} ${x + 8},${n(y + h - 8)}" fill="none" stroke="#222" stroke-width="0.4"/>` +
    `<line x1="${x + 8}" y1="${y + 8}" x2="${x + 8}" y2="${n(y + h - 8)}" stroke="#2f6fd1" stroke-width="0.4" stroke-dasharray="2 1.2"/>` +
    [[4, 4], [w - 4, 4], [4, h - 4], [w - 4, h - 4]].map(([dx, dy]) => hole(x + dx, y + dy, 1.3)).join('') +
    `<text x="${x + w / 2}" y="${n(y + h + 5)}" font-size="3.2" text-anchor="middle" fill="#555">есік (дверь)</text>`
  )
}

function uykPart(x, y) {
  const len = Math.ceil(UYK_LEN) + 10
  return strip(x, y, len, 6, { fill: PAPER, glue: 5 }) + `<rect x="${x}" y="${y}" width="5" height="6" fill="#d9d9d9" stroke="#222" stroke-width="0.4"/>`
}

function shanyrakPart(cx, cy) {
  const marks = TIPS.map((a) => {
    const [x1, , z1] = P3(a, SH_R - 1, 0)
    const [x2, , z2] = P3(a, SH_OUTER, 0)
    return `<line x1="${n(cx + x1)}" y1="${n(cy - z1)}" x2="${n(cx + x2)}" y2="${n(cy - z2)}" stroke="#c62828" stroke-width="0.5"/>`
  }).join('')
  return (
    `<circle cx="${cx}" cy="${cy}" r="${SH_OUTER + 3}" fill="${PAPER}" stroke="#222" stroke-width="0.4"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${SH_R - 3}" fill="#fff" stroke="#222" stroke-width="0.4"/>` +
    marks +
    `<text x="${cx}" y="${cy + SH_OUTER + 8}" font-size="3.2" text-anchor="middle" fill="#555">шаңырақ: красные метки — для уықтар</text>`
  )
}

const sheet1 = page(
  { title: `Юрта · лист 1 из 2 · кереге: 16 полосок, дверь, 9 уықтар, шаңырақ`, legend: ['cut', 'fold', 'glue', 'hole'] },
  ...Array.from({ length: 16 }, (_, i) => stripPart(12 + (i % 2) * 100, 16 + Math.floor(i / 2) * 11)),
  `<text x="107" y="108" font-size="3.2" text-anchor="middle" fill="#555">полоски кереге (16 шт.)</text>`,
  doorPart(222, 16),
  ...Array.from({ length: 9 }, (_, i) => uykPart(12 + (i % 3) * 75, 118 + Math.floor(i / 3) * 11)),
  `<text x="112" y="156" font-size="3.2" text-anchor="middle" fill="#555">уықтар (9 шт.): серые концы — для клея</text>`,
  shanyrakPart(255, 140),
  ...[0, 1, 2, 3].map((i) => strip(12 + i * 46, 165, 2 * SH_OUTER + 4, 4, { fill: PAPER })),
  `<text x="94" y="177" font-size="3.2" text-anchor="middle" fill="#555">перекладины шаңырака (4 шт.)</text>`,
)

function roofPart(cx, cy) {
  const a0 = -90 - SECTOR / 2
  const a1 = -90 + SECTOR / 2
  const p = (r, a) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)]
  const large = SECTOR > 180 ? 1 : 0
  const [ox1, oy1] = p(OUT_R, a0)
  const [ox2, oy2] = p(OUT_R, a1)
  const [ix2, iy2] = p(IN_R, a1)
  const [ix1, iy1] = p(IN_R, a0)
  const d = `M${n(ox1)} ${n(oy1)} A${n(OUT_R)} ${n(OUT_R)} 0 ${large} 1 ${n(ox2)} ${n(oy2)} L${n(ix2)} ${n(iy2)} A${n(IN_R)} ${n(IN_R)} 0 ${large} 0 ${n(ix1)} ${n(iy1)} Z`
  // Клапан вдоль одного края
  const t = 8
  const [tx1, ty1] = p(OUT_R - 2, a1 + deg(t / OUT_R))
  const [tx2, ty2] = p(IN_R + 2, a1 + deg(t / IN_R) * 0.6)
  const tab = `M${n(ox2)} ${n(oy2)} L${n(tx1)} ${n(ty1)} L${n(tx2)} ${n(ty2)} L${n(ix2)} ${n(iy2)} Z`
  // Орнаментная кайма по нижнему краю
  const bandR = OUT_R - 8
  const [bx1, by1] = p(bandR, a0)
  const [bx2, by2] = p(bandR, a1)
  const band = `<path d="M${n(bx1)} ${n(by1)} A${n(bandR)} ${n(bandR)} 0 ${large} 1 ${n(bx2)} ${n(by2)}" fill="none" stroke="#999" stroke-width="0.3" stroke-dasharray="1.5 1"/>`
  return (
    `<path d="${tab}" fill="#d9d9d9" stroke="#222" stroke-width="0.4"/>` +
    `<path d="${d}" fill="#fff" stroke="#222" stroke-width="0.4"/>` +
    `<line x1="${n(ox2)}" y1="${n(oy2)}" x2="${n(ix2)}" y2="${n(iy2)}" stroke="#2f6fd1" stroke-width="0.4" stroke-dasharray="2 1.2"/>` +
    band +
    `<text x="${cx}" y="${cy - 40}" font-size="3.4" text-anchor="middle" fill="#555">покрышка крыши</text>` +
    `<text x="${cx}" y="${cy - 35}" font-size="2.8" text-anchor="middle" fill="#777">между пунктиром и краем — кайма для орнамента</text>`
  )
}

function basePart(cx, cy) {
  const ticks = TIPS.map((a) => {
    const [x, , z] = P3(a, R, 0)
    return `<circle cx="${n(cx + x)}" cy="${n(cy - z)}" r="1.4" fill="#c62828"/>`
  }).join('')
  const [dx1, , dz1] = P3(TIPS[N_X], R, 0)
  const [dx2, , dz2] = P3(TIPS[0], R, 0)
  return (
    `<circle cx="${cx}" cy="${cy}" r="${n(R)}" fill="none" stroke="#2f6fd1" stroke-width="0.4" stroke-dasharray="2 1.2"/>` +
    ticks +
    `<line x1="${n(cx + dx1)}" y1="${n(cy - dz1)}" x2="${n(cx + dx2)}" y2="${n(cy - dz2)}" stroke="${C.door}" stroke-width="1.2"/>` +
    `<text x="${cx}" y="${n(cy + R + 7)}" font-size="3.2" text-anchor="middle" fill="#555">основа: положи на картон, ставь кереге по кругу</text>` +
    `<text x="${cx}" y="${n(cy + R - 4)}" font-size="3" text-anchor="middle" fill="#c62828">дверь</text>`
  )
}

const sheet2 = page(
  { title: 'Юрта · лист 2 из 2 · покрышка крыши и основа', legend: ['cut', 'fold', 'glue'] },
  roofPart(88, 104),
  basePart(226, 100),
)

const finished = svg(yurt({ roof: true }))

export default {
  id: 'kazakh-yurt',
  title: 'Юрта с раздвижной решёткой',
  technique: 'paper',
  difficulty: 3,
  age: '8+',
  time: '2 занятия по 40 минут',
  description:
    'Модель казахской юрты (киіз үй) ко Дню Республики. Стена-кереге — настоящая раздвижная решётка: сложил, и она собирается в пачку, потянул, и она встаёт кругом. Сверху уықтар, шаңырақ и войлочная крыша.',
  materials: [
    'Распечатанный шаблон: 2 листа А4 (лист 1 — на плотной бумаге или тонком картоне)',
    '26 мини-брадсов. Можно заменить кусочками синельной проволоки по 3 см, скрученными в отверстиях',
    'Картон 15×15 см для основы',
    'Клей ПВА или клей-карандаш, скотч',
    'Шило (работает взрослый), ножницы',
    'Фломастеры или цветная бумага для орнамента на крыше',
  ],
  cover: finished,
  template: [sheet1, sheet2],
  steps: [
    {
      text: 'Распечатай шаблоны. Лист с полосками — на плотной бумаге: решётка должна держать форму.',
      svg: svg(thumbnail(15, 40, 190, sheet1), thumbnail(95, 155, 190, sheet2), emoji(250, 60, '🖨️', 44)),
    },
    {
      text: 'Вырежи 16 полосок. Взрослый прокалывает в каждой три отверстия: по краям и посередине.',
      tip: 'Удобно проколоть сразу стопку из 3–4 полосок, сложенных ровно. Тогда отверстия совпадут.',
      svg: svg(...[0, 1, 2, 3].map((i) => stripAt(150, 80 + i * 32, 0, 2.5)), emoji(150, 250, '✂️', 40)),
    },
    {
      text: 'Сложи две полоски крестом и соедини брадсом через средние отверстия. Сделай так 8 иксов.',
      tip: 'Брадс не прижимаем туго: полоски должны свободно поворачиваться, как ножницы.',
      svg: svg(oneX(150, 150, 2.6, 55)),
    },
    {
      text: 'Соедини иксы в цепочку: верхний конец одного с верхним концом следующего, нижний с нижним. Получится решётка-гармошка.',
      tip: 'Покажите детям: сожмите решётку — она высокая и узкая, растяните — низкая и широкая. Так устроены настоящие кереге.',
      svg: svg(chain(30, 90, 3, 72, 1.25), arrow(150, 150, 150, 168, { bend: 0, width: 3 }), chain(25, 225, 3, 50, 1.25), label(150, 290, 'сжали ↔ растянули', { size: 15 })),
    },
    {
      text: 'Вырежи дверную раму. Створку разрежь по трём сторонам, а по пунктиру согни: дверь будет открываться. Прикрепи концы решётки к углам рамы брадсами. Кольцо замкнулось!',
      svg: svg(yurt({ uyks: false, shanyrak: false, base: false })),
    },
    {
      text: 'Поставь кереге на основу: растяни решётку по синему кругу так, чтобы нижние концы встали на красные точки. Прикрепи их кусочками скотча.',
      svg: svg(yurt({ uyks: false, shanyrak: false })),
    },
    {
      text: 'Шаңырақ: наклей перекладины крест-накрест, чуть выгнув их дугой. Приклей уықтар нижним концом к верхним узлам решётки, а верхним — под шаңырақ, на красные метки.',
      tip: 'Шаңырақ — главная часть юрты, его передавали из поколения в поколение. Он изображён и на гербе Казахстана.',
      svg: svg(yurt()),
    },
    {
      text: 'Покрышку крыши укрась орнаментом по кайме, сверни конусом и склей по клапану. Надень на уықтар так, чтобы шаңырақ остался открытым.',
      tip: 'Стены можно оставить открытыми, как в музее: так видно, как устроена юрта.',
      svg: finished,
    },
  ],
  teacherTips: [
    'Перед занятием расскажите, что юрту можно разобрать и перевезти на верблюдах за пару часов, а кереге складываются как раз благодаря такой решётке.',
    `Геометрия для старших: высота стены зависит от угла полосок. Полоска ${L / 10} см, а при шаге ${PITCH / 10} см стена получается около ${(H / 10).toFixed(1)} см. Что будет, если растянуть сильнее?`,
    'Если брадсов мало: соединяйте иксы кусочками синельной проволоки, скручивая их с обратной стороны.',
    'Удобно разделить на два занятия: на первом — решётка и дверь, на втором — шаңырақ, уықтар и крыша.',
  ],
  variations: [
    'Ауыл: несколько юрт на одном большом картоне, вокруг кони и верблюды из пластилина.',
    'Внутреннее убранство: сырмаки и кошма из цветной бумаги, сундук из спичечного коробка.',
    'Орнамент «қошқар мүйіз» на кайме крыши и двери — по трафарету из поделки «Флаг с солнцем».',
  ],
}
