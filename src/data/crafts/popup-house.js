import { svg, arrow, emoji, outlined, label, INK } from '../../diagrams/kit.js'
import { view } from '../../diagrams/solid.js'
import { page, cutLine, foldLine, mountainLine, thumbnail } from '../../diagrams/net.js'

// Объёмная открытка на параллельных складках. Все размеры — в миллиметрах.
// Внутренний лист А4 (297×210) складывается пополам по линии y = 105:
// верхняя половина — «стена», нижняя — «пол». Пара разрезов через сгиб
// глубиной d превращается в ступеньку высотой d и глубиной d.
// Закрытая открытка: передняя стенка ступеньки уходит на 2d от сгиба,
// поэтому всё, что приклеено над ней, должно уместиться в 105 − 2d.

const W = 297
const HALF = 105
const BOXES = [
  { id: 'tree1', x: 50, w: 18, d: 20 },
  { id: 'house', x: 113.5, w: 70, d: 40 },
  { id: 'tree2', x: 229, w: 18, d: 20 },
]
const ROOF = { overhang: 7, h: 22 }
const CROWN = { r: 15, h: 40 }

const C = {
  wall: '#cfe8ff',
  floor: '#b5dd8c',
  hole: '#7a8a99',
  houseFront: '#ffcc80',
  roof: '#d9534f',
  door: '#8d5a3b',
  window: '#fff59d',
  trunk: '#8d5a3b',
  crown: '#66bb6a',
  sun: '#ffd54f',
  cloud: '#ffffff',
  outer: '#ef9a9a',
}

for (const b of BOXES) {
  const top = b.id === 'house' ? ROOF.h : CROWN.h
  if (2 * b.d + top > HALF) throw new Error(`${b.id}: в закрытой открытке деталь вылезет за край`)
}

// --- Объёмный вид открытки, раскрытой на 90° ---
// x — вдоль сгиба, y — вверх, z — вглубь; стена в плоскости z = 105, пол — y = 0.

function scene({ k = 0.8, decorated = true, popped = true, outer = false } = {}) {
  const v = view({ ox: 12, oy: 205, scale: k })
  let out = ''
  if (outer) {
    out += v.plate(([[-4, 0, HALF + 1], [W + 4, 0, HALF + 1], [W + 4, HALF + 4, HALF + 1], [-4, HALF + 4, HALF + 1]]), C.outer)
  }
  out += v.plate(([[0, 0, HALF], [W, 0, HALF], [W, HALF, HALF], [0, HALF, HALF]]), C.wall)
  if (decorated) out += wallDecor(v)
  if (popped) for (const b of BOXES) out += v.plate(([[b.x, 0, HALF], [b.x + b.w, 0, HALF], [b.x + b.w, b.d, HALF], [b.x, b.d, HALF]]), C.hole)
  if (outer) out += v.plate(([[-4, -1, -4], [W + 4, -1, -4], [W + 4, -1, HALF + 1], [-4, -1, HALF + 1]]), C.outer)
  out += v.plate(([[0, 0, 0], [W, 0, 0], [W, 0, HALF], [0, 0, HALF]]), C.floor)
  if (popped) for (const b of BOXES) out += v.plate(([[b.x, 0, HALF - b.d], [b.x + b.w, 0, HALF - b.d], [b.x + b.w, 0, HALF], [b.x, 0, HALF]]), C.hole)
  if (popped) for (const b of BOXES) out += box(v, b, decorated)
  return out
}

function box(v, b, decorated) {
  const z = HALF - b.d
  const x1 = b.x
  const x2 = b.x + b.w
  const isHouse = b.id === 'house'
  const face = isHouse ? (decorated ? C.houseFront : '#fff') : decorated ? C.trunk : '#fff'
  let out =
    v.plate([[x2, 0, z], [x2, 0, HALF], [x2, b.d, HALF], [x2, b.d, z]], '#5f7080') +
    v.plate([[x1, b.d, z], [x2, b.d, z], [x2, b.d, HALF], [x1, b.d, HALF]], isHouse && decorated ? '#e0a860' : '#eee') +
    v.plate([[x1, 0, z], [x2, 0, z], [x2, b.d, z], [x1, b.d, z]], face)
  if (!decorated) return out
  if (isHouse) {
    const cx = (x1 + x2) / 2
    out += v.plate([[x1 - ROOF.overhang, b.d - 2, z], [x2 + ROOF.overhang, b.d - 2, z], [cx, b.d + ROOF.h, z]], C.roof)
    out += v.plate([[cx - 7, 0, z], [cx + 7, 0, z], [cx + 7, 22, z], [cx - 7, 22, z]], C.door)
    for (const wx of [x1 + 8, x2 - 22]) out += v.plate([[wx, 16, z], [wx + 14, 16, z], [wx + 14, 30, z], [wx, 30, z]], C.window)
  } else {
    const [cx, cy] = v.project([(x1 + x2) / 2, b.d + CROWN.h / 2 - 4, z])
    const r = CROWN.r * v.scale
    out += outlined(
      [`<circle cx="${cx}" cy="${cy - r * 0.35}" r="${r}"/>`, `<circle cx="${cx - r * 0.6}" cy="${cy + r * 0.3}" r="${r * 0.75}"/>`, `<circle cx="${cx + r * 0.6}" cy="${cy + r * 0.3}" r="${r * 0.75}"/>`],
      C.crown,
      { width: 2 },
    )
  }
  return out
}

function wallDecor(v) {
  const [sx, sy] = v.project([40, 82, HALF])
  const [cx, cy] = v.project([180, 85, HALF])
  const r = 11 * v.scale
  const cloud = (x, y, s) =>
    outlined([`<circle cx="${x}" cy="${y}" r="${7 * s}"/>`, `<circle cx="${x + 8 * s}" cy="${y - 4 * s}" r="${8 * s}"/>`, `<circle cx="${x + 17 * s}" cy="${y}" r="${7 * s}"/>`], C.cloud, { width: 1.6 })
  return `<circle cx="${sx}" cy="${sy}" r="${r}" fill="${C.sun}" stroke="${INK}" stroke-width="2"/>` + cloud(cx, cy, 1) + cloud(cx + 45, cy + 12, 0.8)
}

// --- Плоские схемы ---

function foldedSheet({ k = 0.9, cut = true, strips = false } = {}) {
  // Сложенный пополам лист: сгиб внизу, видна одна половина (297 × 105)
  const ox = (300 - W * k) / 2
  const oy = 100
  const X = (x) => ox + x * k
  const Y = (y) => oy + y * k // y = 0 — верх, HALF — сгиб
  let out = `<rect x="${X(0)}" y="${Y(0)}" width="${W * k}" height="${HALF * k}" fill="#fff" stroke="${INK}" stroke-width="2.2"/>`
  out += `<line x1="${X(0)}" y1="${Y(HALF)}" x2="${X(W)}" y2="${Y(HALF)}" stroke="${INK}" stroke-width="4"/>`
  out += label(X(W) - 4, Y(HALF) + 20, 'сгиб', { size: 15, anchor: 'end' })
  for (const b of BOXES) {
    const top = Y(HALF - b.d)
    if (strips) {
      out += `<rect x="${X(b.x)}" y="${top}" width="${b.w * k}" height="${b.d * k}" fill="#ffe0b2" stroke="${INK}" stroke-width="2"/>`
      out += `<line x1="${X(b.x)}" y1="${top}" x2="${X(b.x + b.w)}" y2="${top}" stroke="#2f6fd1" stroke-width="2.5" stroke-dasharray="7 5"/>`
      out += arrow(X(b.x + b.w / 2), Y(HALF) - 4, X(b.x + b.w / 2), top - 26, { bend: -0.6, width: 3 })
    } else if (cut) {
      out += `<line x1="${X(b.x)}" y1="${Y(HALF)}" x2="${X(b.x)}" y2="${top}" stroke="#e0325f" stroke-width="3"/>`
      out += `<line x1="${X(b.x + b.w)}" y1="${Y(HALF)}" x2="${X(b.x + b.w)}" y2="${top}" stroke="#e0325f" stroke-width="3"/>`
    }
  }
  return out
}

/** Обратная сторона внутреннего листа: где мазать клей. */
function glueMap() {
  const k = 0.9
  const ox = (300 - W * k) / 2
  const oy = 40
  let out = `<rect x="${ox}" y="${oy}" width="${W * k}" height="${2 * HALF * k}" fill="#d9d9d9" stroke="${INK}" stroke-width="2.2"/>`
  out += `<line x1="${ox}" y1="${oy + HALF * k}" x2="${ox + W * k}" y2="${oy + HALF * k}" stroke="#2f6fd1" stroke-width="2" stroke-dasharray="7 5"/>`
  for (const b of BOXES) {
    out += `<rect x="${ox + b.x * k}" y="${oy + (HALF - b.d) * k}" width="${b.w * k}" height="${2 * b.d * k}" fill="#fff" stroke="#e0325f" stroke-width="2.2"/>`
  }
  out += label(150, oy + HALF * k - 52, 'клей', { size: 18 })
  out += label(ox + 148.5 * k, oy + 2 * HALF * k + 26, 'белое — не клеить!', { size: 16, color: '#e0325f' })
  return out
}

// --- Шаблон ---

function innerSheet() {
  let out = ''
  // Сгиб открытки — везде, кроме полосок
  let x = 0
  for (const b of [...BOXES].sort((a, c) => a.x - c.x)) {
    out += foldLine(x, HALF, b.x, HALF)
    x = b.x + b.w
  }
  out += foldLine(x, HALF, W, HALF)
  for (const b of BOXES) {
    out += cutLine(b.x, HALF - b.d, b.x, HALF + b.d) + cutLine(b.x + b.w, HALF - b.d, b.x + b.w, HALF + b.d)
    out += mountainLine(b.x, HALF, b.x + b.w, HALF)
    out += foldLine(b.x, HALF - b.d, b.x + b.w, HALF - b.d) + foldLine(b.x, HALF + b.d, b.x + b.w, HALF + b.d)
  }
  return out
}

const sheet1 = page(
  { title: 'Открытка «Домик» · лист 1 из 2 · внутренний лист: сложить пополам линиями наружу и резать от сгиба', legend: ['cut', 'valley', 'mountain'] },
  innerSheet(),
)

function stencils() {
  const s = 'stroke="#222" stroke-width="0.4" fill="#fff"'
  const house = BOXES.find((b) => b.id === 'house')
  const rw = house.w + 2 * ROOF.overhang
  let out = ''
  out += `<polygon points="15,60 ${15 + rw},60 ${15 + rw / 2},${60 - ROOF.h}" ${s}/>`
  out += `<text x="${15 + rw / 2}" y="68" font-size="3.4" text-anchor="middle" fill="#555">крыша</text>`
  out += `<rect x="115" y="38" width="14" height="22" ${s}/><text x="122" y="68" font-size="3.4" text-anchor="middle" fill="#555">дверь</text>`
  out += `<rect x="140" y="46" width="14" height="14" ${s}/><rect x="160" y="46" width="14" height="14" ${s}/><text x="157" y="68" font-size="3.4" text-anchor="middle" fill="#555">окна</text>`
  const crown = (cx, cy) =>
    outlined([`<circle cx="${cx}" cy="${cy - 5}" r="${CROWN.r}"/>`, `<circle cx="${cx - 9}" cy="${cy + 4.5}" r="${CROWN.r * 0.75}"/>`, `<circle cx="${cx + 9}" cy="${cy + 4.5}" r="${CROWN.r * 0.75}"/>`], '#fff', { stroke: '#222', width: 0.4 })
  out += crown(210, 45) + crown(255, 45) + `<text x="232" y="74" font-size="3.4" text-anchor="middle" fill="#555">кроны деревьев (2 шт.)</text>`
  out += `<circle cx="35" cy="115" r="11" ${s}/><text x="35" y="134" font-size="3.4" text-anchor="middle" fill="#555">солнце</text>`
  const cloud = (x, y) => outlined([`<circle cx="${x}" cy="${y}" r="7"/>`, `<circle cx="${x + 8}" cy="${y - 4}" r="8"/>`, `<circle cx="${x + 17}" cy="${y}" r="7"/>`], '#fff', { stroke: '#222', width: 0.4 })
  out += cloud(70, 115) + cloud(105, 115) + `<text x="97" y="134" font-size="3.4" text-anchor="middle" fill="#555">облака</text>`
  out += `<path d="M150 125 ${Array.from({ length: 14 }, (_, i) => `L${154 + i * 9} 110 L${158.5 + i * 9} 125`).join(' ')} Z" ${s}/><text x="214" y="134" font-size="3.4" text-anchor="middle" fill="#555">травка (на пол, мимо прорезей)</text>`
  out += `<text x="15" y="160" font-size="3.4" fill="#555">Крышу и кроны приклеивайте только к передней стенке ступеньки, их верх свободен.</text>`
  out += `<text x="15" y="166" font-size="3.4" fill="#555">Проверка: закройте открытку — ничего не должно торчать за край.</text>`
  return out
}

const sheet2 = page({ title: 'Открытка «Домик» · лист 2 из 2 · трафареты для аппликации (обвести на цветной бумаге)', legend: ['cut'] }, stencils())

const k = 0.8
const finished = svg(scene({ k, outer: true }))

export default {
  id: 'popup-house-card',
  title: 'Объёмная открытка «Домик»',
  technique: 'paper',
  difficulty: 3,
  age: '8+',
  time: '45–60 минут',
  description:
    'Открываешь открытку, и из неё встаёт домик с деревьями. Это pop-up на параллельных складках: всего шесть разрезов, а получаются три объёмные ступеньки.',
  materials: [
    'Распечатанный шаблон: 2 листа А4',
    'Белая плотная бумага для внутреннего листа (шаблон печатаем прямо на неё)',
    'Цветной картон А4 для обложки',
    'Цветная бумага для крыши, окон, деревьев, солнца и травы',
    'Ножницы, клей-карандаш, линейка',
  ],
  cover: finished,
  template: [sheet1, sheet2],
  steps: [
    {
      text: 'Распечатай внутренний лист на белой плотной бумаге, а трафареты на обычной.',
      svg: svg(thumbnail(20, 40, 180, sheet1), thumbnail(100, 150, 180, sheet2), emoji(250, 60, '🖨️', 44)),
    },
    {
      text: 'Сложи внутренний лист пополам, линиями наружу. Режь по сплошным линиям от сгиба через оба слоя сразу.',
      tip: 'Режем только до конца линии, не дальше! Длина разрезов определяет высоту ступенек.',
      svg: svg(foldedSheet(), emoji(150, 250, '✂️', 44)),
    },
    {
      text: 'Каждую полоску между разрезами отогни вверх по пунктиру, хорошо прогладь и верни обратно.',
      svg: svg(foldedSheet({ strips: true })),
    },
    {
      text: 'Разверни лист и сложи его пополам в другую сторону, линиями внутрь. Полоски при этом продави внутрь, между половинками. Закрой и крепко прижми.',
      tip: 'Открой лист под прямым углом: если всё получилось, три ступеньки встанут сами.',
      svg: svg(scene({ k, decorated: false })),
    },
    {
      text: 'Вырежи по трафаретам из цветной бумаги крышу, дверь, окна, две кроны, солнце, облака и травку.',
      svg: svg(thumbnail(20, 70, 260, sheet2), emoji(240, 250, '✂️', 40)),
    },
    {
      text: 'Приклей крышу, дверь и окна на большую ступеньку, кроны на маленькие. Солнце и облака наклей на «стену», травку на «пол».',
      tip: 'Крышу и кроны клеим только нижним краем, к передней стенке ступеньки. Травку не клеим поверх прорезей.',
      svg: svg(scene({ k })),
    },
    {
      text: 'Сложи цветной картон пополам: это обложка. Намажь клеем обратную сторону внутреннего листа, кроме ступенек, и вклей его в обложку.',
      tip: 'Если клей попадёт на ступеньки, они приклеятся к обложке и не будут раскрываться.',
      svg: svg(glueMap()),
    },
    {
      text: 'Открытка готова! Подпиши поздравление на обложке. Открой медленно, и домик встанет.',
      svg: finished,
    },
  ],
  teacherTips: [
    'Геометрия ступеньки: при открытии на 90° её высота равна глубине и равна длине разреза. Попросите детей проверить линейкой.',
    'Почему крыша не вылезет за край: в закрытой открытке передняя стенка ступеньки уходит от сгиба на две длины разреза. Для домика это 2 × 4 см = 8 см, и на крышу остаётся 2,5 см.',
    'Сложите одну открытку заранее и покажите в начале. Эффект «раскрытия» сразу всех заинтересует.',
  ],
  variations: [
    'Своя сцена: торт со свечами на день рождения, ёлка с подарками, замок.',
    'Ступенька на ступеньке: на передней стенке домика можно сделать ещё пару разрезов, получится крыльцо.',
    'Задачка для старших: сделайте ступеньку высотой 3 см. Какой длины будет разрез?',
  ],
}
