import { svg, arrow, emoji, label, path, line, INK } from '../../diagrams/kit.js'
import { prismZ, prismY, cylinderX, cylinderY, moved, view } from '../../diagrams/solid.js'
import { page, band, plate, strip, cutLine, edgeLengths, thumbnail } from '../../diagrams/net.js'

// Все размеры — в миллиметрах. Одни и те же числа идут и в схемы, и в шаблон для печати,
// поэтому развёртка гарантированно совпадает с тем, что нарисовано на схемах.

const TRACK = [[10, 0], [90, 0], [100, 10], [96, 20], [4, 20], [0, 10]]
const TRACK_W = 16
const HULL = [[2, 0], [94, 0], [80, 16], [8, 16]]
const HULL_W = 60 // гусеница + промежуток + гусеница
const TURRET = [[6, 0], [30, 0], [40, 8], [40, 22], [30, 30], [6, 30], [0, 22], [0, 8]]
const TURRET_H = 12
const RING_H = 6
const RING_BIG = 74 // длина без зоны для клея
const RING_SMALL = 64
const BARREL = { length: 45, wrap: 50 }
const WHEELS = [18, 34, 50, 66, 82]

const OLIVE = '#7d8f4e'
const TRACK_COLOR = '#5f5f57'
const WHEEL = '#9aa07f'

// Положение деталей в собранном танке
const HULL_DX = 4
const HULL_Y = 20
const HULL_TOP = HULL_Y + 16
const TURRET_X = 26
const TURRET_Z = 15
const TURRET_Y = HULL_TOP + RING_H
const RING_CX = TURRET_X + 20
const RING_CZ = TURRET_Z + 15

const trackNear = prismZ(TRACK, 0, TRACK_W)
const trackFar = prismZ(TRACK, HULL_W - TRACK_W, HULL_W)
const hull = prismZ(HULL.map(([x, y]) => [x + HULL_DX, y + HULL_Y]), 0, HULL_W)
const turret = prismY(TURRET.map(([x, z]) => [x + TURRET_X, z + TURRET_Z]), TURRET_Y, TURRET_Y + TURRET_H)
const barrel = cylinderX(TURRET_Y + 6, RING_CZ, 3.6, TURRET_X + 40, TURRET_X + 40 + BARREL.length - 4)
const ringBig = cylinderY(RING_CX, RING_CZ, RING_BIG / (2 * Math.PI), HULL_TOP, HULL_TOP + RING_H)
const ringSmall = cylinderY(RING_CX, RING_CZ, RING_SMALL / (2 * Math.PI), 0, RING_H)

const V = view({ ox: 22, oy: 222, scale: 2 })

const wheels = (v, dy = 0, z = 0) => WHEELS.map((x) => v.wheel(x, 9 + dy, z, 6.5, WHEEL)).join('')

const turretTop = (v, dy = 0) => v.hatch(TURRET_X + 13, TURRET_Y + TURRET_H + dy, RING_CZ, 6, '#6c7c42')

function tank({ withTurret = true } = {}) {
  return (
    V.body(trackFar, TRACK_COLOR) +
    V.body(trackNear, TRACK_COLOR) +
    wheels(V) +
    V.body(hull, OLIVE) +
    (withTurret ? V.body(ringBig, OLIVE) + V.body(barrel, OLIVE) + V.body(turret, OLIVE) + turretTop(V) : '')
  )
}

const p = (pt) => V.project(pt)

// --- Схемы шагов ---

function trackExploded(v) {
  const plateFront = TRACK.map(([x, y]) => [x, y, -26])
  const [ax, ay] = v.project([50, 10, -22])
  const [bx, by] = v.project([50, 10, -2])
  return (
    v.body(prismZ(TRACK, 0, TRACK_W), TRACK_COLOR, { open: 'front' }) +
    v.plate(plateFront, '#8a8a80') +
    WHEELS.map((x) => v.wheel(x, 9, -26, 6.5, WHEEL)).join('') +
    arrow(ax, ay, bx, by, { bend: 0.4 })
  )
}

function hullExploded(v) {
  const profile = HULL.map(([x, y]) => [x + HULL_DX, y])
  const [ax, ay] = v.project([50, 8, -30])
  const [bx, by] = v.project([50, 8, -4])
  return v.body(prismZ(profile, 0, HULL_W), OLIVE, { open: 'front' }) + v.plate(profile.map(([x, y]) => [x, y, -34]), '#93a565') + arrow(ax, ay, bx, by, { bend: 0.4 })
}

function turretExploded() {
  const v = view({ ox: 40, oy: 230, scale: 3.4 })
  const plan = TURRET.map(([x, z]) => [x, z])
  const lift = 26
  const [ax, ay] = v.project([20, TURRET_H + lift - 3, 15])
  const [bx, by] = v.project([20, TURRET_H + 3, 15])
  return (
    v.body(prismY(plan, 0, TURRET_H), OLIVE, { open: 'top' }) +
    v.plate(plan.map(([x, z]) => [x, TURRET_H + lift, z]), '#93a565') +
    v.hatch(13, TURRET_H + lift, 15, 6, '#6c7c42') +
    arrow(ax, ay, bx, by, { bend: 0.5 })
  )
}

const barrelSteps = svg(
  // полоска и карандаш
  `<rect x="30" y="40" width="110" height="122" fill="#dfe6c8" stroke="${INK}" stroke-width="2.5"/>`,
  ...[52, 64, 76, 88, 100, 112, 124, 136, 148].map((y) => line(30, y, 42, y, { width: 2 })),
  `<rect x="20" y="166" width="130" height="14" rx="3" fill="#f2c94c" stroke="${INK}" stroke-width="2.5"/>`,
  `<polygon points="150,166 168,173 150,180" fill="#f5deb3" stroke="${INK}" stroke-width="2.5"/>`,
  arrow(90, 200, 90, 150, { bend: 0.8 }),
  // готовый ствол с лепестками
  `<rect x="195" y="140" width="80" height="22" fill="${OLIVE}" stroke="${INK}" stroke-width="2.5"/>`,
  `<ellipse cx="275" cy="151" rx="5" ry="11" fill="#55612f" stroke="${INK}" stroke-width="2"/>`,
  ...[-1, 1].flatMap((s) => [`<polygon points="195,${151 + s * 4} 180,${151 + s * 20} 188,${151 + s * 22} 197,${151 + s * 9}" fill="${OLIVE}" stroke="${INK}" stroke-width="2"/>`]),
  `<polygon points="195,148 178,145 178,157 195,154" fill="${OLIVE}" stroke="${INK}" stroke-width="2"/>`,
  label(230, 110, 'лепестки', { size: 16 }),
  arrow(205, 116, 188, 136, { bend: 0.2, width: 3 }),
)

function assembleHull() {
  const lift = 34
  const [ax, ay] = p([50, HULL_Y + lift - 6, 30])
  const [bx, by] = p([50, HULL_Y + 22, 30])
  return svg(V.body(trackFar, TRACK_COLOR), V.body(trackNear, TRACK_COLOR), wheels(V), V.body(moved(hull, [0, lift, 0]), OLIVE), arrow(ax, ay, bx, by, { bend: 0.3 }))
}

function mountTurret() {
  const lift = 30
  const t = moved(turret, [0, lift, 0])
  const rs = moved(ringSmall, [0, TURRET_Y + lift - RING_H, 0])
  const b = moved(barrel, [0, lift, 0])
  const [ax, ay] = p([RING_CX, HULL_TOP + lift - 4, RING_CZ - 22])
  const [bx, by] = p([RING_CX, HULL_TOP + 10, RING_CZ - 22])
  const [rx, ry] = p([RING_CX, TURRET_Y + lift + TURRET_H + 6, RING_CZ])
  return svg(
    V.body(trackFar, TRACK_COLOR),
    V.body(trackNear, TRACK_COLOR),
    wheels(V),
    V.body(hull, OLIVE),
    V.body(ringBig, OLIVE),
    V.body(rs, OLIVE),
    V.body(b, OLIVE),
    V.body(t, OLIVE),
    turretTop(V, lift),
    arrow(ax, ay, bx, by, { bend: 0.3 }),
    arrow(rx - 38, ry - 6, rx + 38, ry - 6, { bend: -0.35, width: 3.5, color: '#2f6fd1' }),
  )
}

const finished = svg(path('M10 262 L290 262', { stroke: '#c9b79c', width: 4 }), tank())

// --- Шаблон для печати (2 листа А4) ---

const PAPER_OLIVE = '#dfe6c8'
const PAPER_TRACK = '#d9d9d2'

const treads = (x0, y0, L, w) =>
  Array.from({ length: Math.floor(L / 4) }, (_, i) => cutLine(x0 + 2 + i * 4, y0 + 1.5, x0 + 2 + i * 4, y0 + w - 1.5).replace('#222', '#8c8c84').replace('0.4', '0.6')).join('')

const trackWheels = (map) =>
  WHEELS.map((x) => {
    const [cx, cy] = map([x, 9])
    return `<circle cx="${cx}" cy="${cy}" r="6.5" fill="#bfc4a6" stroke="#666" stroke-width="0.3"/>`
  }).join('')

const trackLen = edgeLengths(TRACK)
const hullLen = edgeLengths(HULL)
const turretLen = edgeLengths(TURRET)
const sum = (a) => a.reduce((s, x) => s + x, 0)

const sheet1 = page(
  'Танк · лист 1 из 2 · корпус и башня',
  band(12, 18, hullLen, HULL_W, { fill: PAPER_OLIVE, name: 'корпус · лента' }),
  plate(236, 16, TURRET.map(([x, z]) => [x, z]), {
    fill: PAPER_OLIVE,
    name: 'башня · верх',
    decorate: (map) => {
      const [cx, cy] = map([13, 15])
      return `<circle cx="${cx}" cy="${cy}" r="6" fill="none" stroke="#666" stroke-width="0.3"/>`
    },
  }),
  plate(236, 56, TURRET.map(([x, z]) => [x, z]), { fill: PAPER_OLIVE, name: 'башня · низ' }),
  plate(12, 104, HULL, { fill: PAPER_OLIVE, name: 'корпус · бок' }),
  plate(118, 104, HULL, { fill: PAPER_OLIVE, name: 'корпус · бок', mirror: true }),
  band(12, 146, turretLen, TURRET_H, { fill: PAPER_OLIVE, name: 'башня · лента', tab: 4 }),
  strip(160, 146, RING_BIG + 6, RING_H, { fill: PAPER_OLIVE, glue: 6, name: 'большое кольцо' }),
  strip(160, 162, RING_SMALL + 6, RING_H, { fill: PAPER_OLIVE, glue: 6, name: 'малое кольцо' }),
)

const barrelX = 236
const barrelY = 104
const sheet2 = page(
  'Танк · лист 2 из 2 · гусеницы и ствол',
  band(12, 18, trackLen, TRACK_W, { fill: PAPER_TRACK, name: 'гусеница · лента', decorate: treads(12, 18, sum(trackLen), TRACK_W) }),
  band(12, 52, trackLen, TRACK_W, { fill: PAPER_TRACK, name: 'гусеница · лента', decorate: treads(12, 52, sum(trackLen), TRACK_W) }),
  plate(12, 90, TRACK, { fill: PAPER_TRACK, decorate: trackWheels }),
  plate(122, 90, TRACK, { fill: PAPER_TRACK, decorate: trackWheels }),
  plate(12, 122, TRACK, { fill: PAPER_TRACK, decorate: trackWheels }),
  plate(122, 122, TRACK, { fill: PAPER_TRACK, decorate: trackWheels }),
  strip(barrelX, barrelY - 8, BARREL.length, BARREL.wrap, {
    fill: PAPER_OLIVE,
    decorate: Array.from({ length: 9 }, (_, i) => cutLine(barrelX, barrelY - 8 + 5 * (i + 1), barrelX + 5, barrelY - 8 + 5 * (i + 1))).join(''),
  }),
  `<text x="${barrelX + BARREL.length / 2}" y="${barrelY + BARREL.wrap - 1}" font-size="3.2" text-anchor="middle" fill="#333">ствол</text>`,
  `<text x="${barrelX + BARREL.length / 2}" y="${barrelY + BARREL.wrap + 4}" font-size="2.6" text-anchor="middle" fill="#666">надрезы — лепестки</text>`,
  `<text x="67" y="160" font-size="3.2" text-anchor="middle" fill="#333">гусеница · бока (4 шт.)</text>`,
)

export default {
  id: 'paper-tank',
  title: 'Танк с поворотной башней',
  technique: 'paper',
  difficulty: 3,
  age: '9+',
  time: '2 занятия по 40 минут',
  description:
    'Объёмная модель из развёрток: корпус, две гусеницы с катками, башня, которая поворачивается, и ствол. Для тех, кто уже уверенно режет и клеит.',
  materials: [
    'Распечатанный шаблон: 2 листа А4 (лучше плотная бумага 160–200 г/м²)',
    'Ножницы',
    'Клей-карандаш или ПВА',
    'Линейка и стержень без пасты, чтобы продавить линии сгиба',
    'Карандаш, на который будем наворачивать ствол',
    'Фломастеры или краски (по желанию)',
  ],
  cover: finished,
  template: [sheet1, sheet2],
  steps: [
    {
      text: 'Распечатай шаблон на двух листах. Если хочешь раскрасить танк, сделай это сейчас, пока детали плоские.',
      tip: 'При печати выберите масштаб 100% (не «по размеру страницы»), иначе кольца башни не подойдут друг к другу.',
      svg: svg(thumbnail(18, 45, 170, sheet1), thumbnail(112, 160, 170, sheet2), emoji(250, 70, '🖨️', 48)),
    },
    {
      text: 'Вырежи все детали по сплошной линии. Потом приложи линейку и продави стержнем все пунктирные линии.',
      tip: 'Продавленный сгиб (биговка) ложится ровно. Без него толстая бумага мнётся и коробки получаются кривыми.',
      svg: svg(
        `<svg x="10" y="70" width="280" height="${(280 * 50) / 240}" viewBox="8 8 240 50">${band(12, 18, trackLen, TRACK_W, { fill: PAPER_TRACK, decorate: treads(12, 18, sum(trackLen), TRACK_W) })}</svg>`,
        emoji(90, 200, '✂️', 52),
        emoji(200, 200, '📏', 52),
      ),
    },
    {
      text: 'Согни ленту гусеницы по линиям, а все серые клапаны загни внутрь. Приклей клапаны к одной боковинке, обходя её по кругу. Потом закрой коробочку второй боковинкой.',
      tip: 'Клейте по одной стороне и прижимайте несколько секунд. Если намазать всё сразу, клей высохнет раньше, чем дойдёт очередь.',
      svg: svg(trackExploded(view({ ox: 40, oy: 215, scale: 2.2 }))),
    },
    {
      text: 'Так же собери вторую гусеницу и корпус.',
      svg: svg(hullExploded(view({ ox: 30, oy: 230, scale: 2 }))),
    },
    {
      text: 'Поставь гусеницы рядом, катками наружу. Приклей сверху корпус так, чтобы его края совпали с внешними краями гусениц.',
      svg: assembleHull(),
    },
    {
      text: 'Собери башню: ленту приклей к нижней детали, а сверху закрой деталью с люком.',
      svg: svg(turretExploded()),
    },
    {
      text: 'Ствол: плотно наверни полоску на карандаш и заклей край. Сними трубочку, отогни лепестки на конце и приклей их к передней стенке башни.',
      tip: 'Наворачивайте начиная со стороны без надрезов. Лепестки удобно смазать клеем-карандашом прямо на столе.',
      svg: barrelSteps,
    },
    {
      text: 'Склей из полосок два колечка. Большое приклей на корпус, маленькое — под башню. Вставь маленькое кольцо в большое, и башня будет поворачиваться!',
      tip: 'Клеем мажется только серая зона на конце полоски. Сами кольца к корпусу и башне удобнее клеить ПВА.',
      svg: mountTurret(),
    },
    {
      text: 'Танк готов! Можно нарисовать номер на башне или камуфляжные пятна.',
      svg: finished,
    },
  ],
  teacherTips: [
    'Удобно разделить на два занятия: на первом — гусеницы, на втором — корпус, башня и ствол.',
    'Проверьте масштаб на первом распечатанном листе: длинная лента корпуса должна быть около 21 см.',
    'Если бумага тонкая (80 г/м²), танк соберётся, но будет мяться. Лучше распечатать на плотной или наклеить лист на тонкий картон до вырезания.',
    'Самое трудное — замкнуть последнюю боковинку коробочки. Дайте детям подсказку: сначала приклейте длинные клапаны, потом короткие.',
  ],
  variations: [
    'Подарок к 23 февраля: танк на открытке-подставке с поздравлением.',
    'Колонна техники: на основе тех же развёрток можно придумать грузовик — корпус-коробочка на четырёх колёсах из картонных кружков.',
    'Пусть дети придумают и нарисуют собственный камуфляж: лесной, зимний, пустынный.',
  ],
}
