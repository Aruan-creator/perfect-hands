import { svg, arrow, emoji, label, path, INK } from '../../diagrams/kit.js'
import { prismZ, cylinderX, cylinderZ, moved, view } from '../../diagrams/solid.js'
import { page, band, plate, hole, edgeLengths, thumbnail } from '../../diagrams/net.js'

// Машинка с реактивным двигателем из воздушного шарика. Размеры — в миллиметрах.
// Корпус — коробочка из развёртки: профиль сбоку вытянут на ширину W.
// Лента вокруг профиля разбита на две части (дно отдельно), чтобы влезть в А4.

const PROFILE = [[0, 0], [120, 0], [120, 18], [100, 22], [84, 36], [40, 36], [26, 22], [0, 18]]
const W = 60
const WHEEL_R = 20
const AXLES = [24, 96]
const AXLE_Y = WHEEL_R
const BODY_Y = AXLE_Y + 4 // трубочка-ось приклеена под дном
const STRAW_R = 3.5
const ROOF_Y = BODY_Y + 36

const C = {
  body: '#ef5350',
  glass: '#b3e5fc',
  wheel: '#455a64',
  hub: '#cfd8dc',
  straw: '#ffffff',
  skewer: '#d7b98e',
  balloon: '#ffca28',
  stripe: '#ffffff',
  tape: '#fff8e1',
}

const lens = edgeLengths(PROFILE)
const BOTTOM = [lens[0]]
const TOP = lens.slice(1)

const body = prismZ(PROFILE.map(([x, y]) => [x, y + BODY_Y]), 0, W)
const straws = AXLES.map((x) => cylinderZ(x, AXLE_Y, STRAW_R, 3, W - 3))
const skewers = AXLES.map((x) => cylinderZ(x, AXLE_Y, 1.4, -10, W + 10, 10))
const wheel = (x, z0, z1) => cylinderZ(x, AXLE_Y, WHEEL_R, z0, z1)
const wheelsNear = AXLES.map((x) => wheel(x, -7, -1))
const wheelsFar = AXLES.map((x) => wheel(x, W + 1, W + 7))
const tube = cylinderX(ROOF_Y + 3, W / 2, 3, -28, 72, 12)

const V = view({ ox: 52, oy: 222, scale: 1.55 })

function windows(v, z) {
  const P = (pts) => pts.map(([x, y]) => [x, y + BODY_Y, z])
  return (
    v.plate(P([[64, 23], [97, 23], [83, 33.5], [64, 33.5]]), C.glass) +
    v.plate(P([[60, 23], [60, 33.5], [41, 33.5], [29, 23]]), C.glass)
  )
}

function decor(v) {
  const P = (pts) => pts.map(([x, y]) => [x, y + BODY_Y, 0])
  const [cx, cy] = v.project([62, BODY_Y + 11, 0])
  return (
    v.plate(P([[0, 8], [120, 8], [120, 13], [0, 13]]), C.stripe) +
    `<circle cx="${cx}" cy="${cy}" r="${9 * v.scale}" fill="#fff" stroke="${INK}" stroke-width="2"/>` +
    label(cx, cy + 7, '7', { size: 20 })
  )
}

const hubs = (v, z) => AXLES.map((x) => v.wheel(x, AXLE_Y, z, 6, C.hub)).join('')

function balloon(v, size = 1) {
  const [bx, by] = v.project([72, ROOF_Y + 3, W / 2])
  const rx = 34 * size
  const ry = 26 * size
  return (
    `<ellipse cx="${bx + rx * 0.9}" cy="${by - ry * 0.55}" rx="${rx}" ry="${ry}" fill="${C.balloon}" stroke="${INK}" stroke-width="2.2" transform="rotate(-12 ${bx} ${by})"/>` +
    `<ellipse cx="${bx + rx * 0.9 - rx * 0.4}" cy="${by - ry * 0.55 - ry * 0.4}" rx="${rx * 0.22}" ry="${ry * 0.14}" fill="#fff" opacity="0.7" transform="rotate(-30 ${bx} ${by})"/>` +
    `<rect x="${bx - 6}" y="${by - 6}" width="12" height="11" rx="2" fill="${C.tape}" stroke="${INK}" stroke-width="1.5"/>`
  )
}

function car({ withWheels = true, withAxles = true, deco = true, motor = 0, wheelOffset = 0 } = {}) {
  let out = ''
  if (withWheels) out += wheelsFar.map((w) => V.body(w, C.wheel)).join('')
  if (withAxles) out += skewers.map((s) => V.body(s, C.skewer)).join('') + straws.map((s) => V.body(s, C.straw)).join('')
  out += V.body(body, C.body) + windows(V, 0)
  if (deco) out += decor(V)
  if (withWheels) out += wheelsNear.map((w) => V.body(moved(w, [0, 0, -wheelOffset]), C.wheel)).join('') + hubs(V, -7 - wheelOffset)
  if (motor) out += V.body(tube, C.straw) + balloon(V, motor)
  return out
}

function exploded() {
  const v = view({ ox: 40, oy: 225, scale: 1.55 })
  const profile = PROFILE.map(([x, y]) => [x, y + 10])
  const [ax, ay] = v.project([60, 22, -34])
  const [bx, by] = v.project([60, 22, -4])
  return v.body(prismZ(profile, 0, W), C.body, { open: 'front' }) + v.plate(profile.map(([x, y]) => [x, y, -40]), '#f28b82') + arrow(ax, ay, bx, by, { bend: 0.4 })
}

const puffs = () => {
  const [x, y] = V.project([-28, ROOF_Y + 3, W / 2])
  return [0, 1, 2].map((i) => `<circle cx="${x - 14 - i * 16}" cy="${y + (i % 2 ? -6 : 4)}" r="${7 - i * 1.6}" fill="#e3f2fd" stroke="#90caf9" stroke-width="2"/>`).join('')
}

// --- Шаблон ---

const PAPER = '#ffe0dd'
const segX = (i) => 12 + TOP.slice(0, i).reduce((a, b) => a + b, 0)

const topDecor = (() => {
  const y0 = 18
  const glass = (i) => `<rect x="${segX(i) + 1}" y="${y0 + 4}" width="${TOP[i] - 2}" height="${W - 8}" fill="#d6effa"/>`
  const lights = (i, fill) => [14, W - 14].map((y) => `<circle cx="${segX(i) + TOP[i] / 2}" cy="${y0 + y}" r="4" fill="${fill}" stroke="#666" stroke-width="0.3"/>`).join('')
  return lights(0, '#fff59d') + glass(2) + glass(4) + lights(6, '#ef9a9a')
})()

const sideDecor = (map) => {
  const poly = (pts) => `<polygon points="${pts.map((p) => map(p).join(',')).join(' ')}" fill="#d6effa" stroke="#666" stroke-width="0.3"/>`
  const [x1, y1] = map([62, 2])
  const [x2, y2] = map([62, 22])
  return poly([[64, 23], [97, 23], [83, 33.5], [64, 33.5]]) + poly([[60, 23], [60, 33.5], [41, 33.5], [29, 23]]) + `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#666" stroke-width="0.3"/>`
}

const wheelPart = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="${WHEEL_R}" fill="#fff" stroke="#222" stroke-width="0.4"/><circle cx="${cx}" cy="${cy}" r="6" fill="none" stroke="#999" stroke-width="0.3"/>` + hole(cx, cy, 1.2)

const sheet = page(
  { title: 'Машинка на шарике · 1 лист · корпус и колёса (печатать на плотной бумаге)', legend: ['cut', 'fold', 'glue', 'hole'] },
  band(12, 18, TOP, W, { fill: PAPER, name: 'корпус · верх', decorate: topDecor }),
  band(12, 107, BOTTOM, W, { fill: PAPER, name: 'корпус · дно' }),
  plate(152, 107, PROFILE, { fill: PAPER, decorate: sideDecor }),
  plate(152, 150, PROFILE, { fill: PAPER, mirror: true, decorate: sideDecor }),
  `<text x="212" y="194" font-size="3.2" text-anchor="middle" fill="#555">бока корпуса (зеркальные)</text>`,
  wheelPart(214, 38),
  wheelPart(260, 38),
  wheelPart(214, 82),
  wheelPart(260, 82),
  `<text x="237" y="10" font-size="3" text-anchor="middle" fill="#555">колёса: наклейте на картон в 2–3 слоя</text>`,
  `<text x="75.5" y="186" font-size="3" text-anchor="middle" fill="#555">Нужно ещё: 2 трубочки, 2 шпажки, шарик, скотч, пластилин</text>`,
)

const finished = svg(car({ motor: 1 }), puffs(), arrow(200, 250, 268, 250, { bend: 0, width: 4 }))

export default {
  id: 'balloon-car',
  title: 'Машинка на воздушном шарике',
  technique: 'paper',
  difficulty: 3,
  age: '8+',
  time: '60 минут + гонки',
  description:
    'Машинка с настоящим реактивным двигателем: воздух выходит из шарика назад, и машинка едет вперёд. После сборки можно устроить гонки и измерить, чья уедет дальше.',
  materials: [
    'Распечатанный шаблон (1 лист А4, плотная бумага)',
    'Картон для колёс (или 4 одинаковые крышки от бутылок)',
    '2 трубочки для коктейля',
    '2 деревянные шпажки',
    'Воздушный шарик',
    'Скотч, клей-карандаш, пластилин',
    'Ножницы, шило (работает взрослый)',
  ],
  cover: finished,
  template: [sheet],
  steps: [
    {
      text: 'Распечатай шаблон на плотной бумаге и приготовь трубочки, шпажки, шарик и скотч.',
      svg: svg(thumbnail(20, 50, 230, sheet), emoji(250, 230, '🎈', 48), emoji(190, 245, '🥤', 40)),
    },
    {
      text: 'Вырежи детали. Продави линейкой и стержнем все пунктирные линии. Колёса наклей на картон в два-три слоя и вырежи.',
      tip: 'Колёса должны быть одинаковыми и круглыми, иначе машинка поедет «вприпрыжку». Крышки от бутылок подойдут даже лучше.',
      svg: svg(`<svg x="10" y="60" width="280" height="${(280 * 85) / 190}" viewBox="8 8 190 85">${band(12, 18, TOP, W, { fill: PAPER, decorate: topDecor })}</svg>`, emoji(90, 230, '✂️', 48), emoji(200, 230, '📏', 48)),
    },
    {
      text: 'Собери корпус-коробочку: обе ленты по очереди приклей клапанами к одному боку, потом закрой вторым боком.',
      tip: 'Верхняя лента и дно соединяются концевыми клапанами: спереди и сзади получаются замкнутые «кольца».',
      svg: svg(exploded()),
    },
    {
      text: 'Укрась машинку: полоски, номер, фары. Окна уже нарисованы на шаблоне, их можно обклеить голубой бумагой.',
      svg: svg(car({ withWheels: false, withAxles: false })),
    },
    {
      text: 'Отрежь от одной трубочки два кусочка чуть уже корпуса и приклей их скотчем поперёк дна: спереди и сзади. Вставь в них шпажки.',
      tip: 'Острые концы шпажек взрослый сразу срезает. Шпажка должна легко крутиться внутри трубочки.',
      svg: svg(car({ withWheels: false })),
    },
    {
      text: 'Взрослый прокалывает центры колёс. Надень колёса на шпажки и закрепи снаружи шариком пластилина.',
      tip: 'Проверьте: толкните машинку пальцем, она должна катиться далеко. Если колёса трутся о корпус, отодвиньте их на пару миллиметров.',
      svg: svg(car({ wheelOffset: 22 }), arrow(...V.project([24, AXLE_Y, -38]), ...V.project([24, AXLE_Y, -12]), { bend: 0.3 })),
    },
    {
      text: 'Двигатель: надень шарик на конец второй трубочки и плотно обмотай скотчем. Приклей трубочку скотчем на крышу так, чтобы шарик был впереди, а конец трубочки торчал назад.',
      tip: 'Проверьте, что воздух не выходит через скотч: подуйте в трубочку и зажмите её.',
      svg: svg(car({ motor: 0.35 })),
    },
    {
      text: 'Надуй шарик через трубочку, зажми её пальцем, поставь машинку на пол и отпусти! Воздух вылетает назад, а машинка едет вперёд.',
      tip: 'Это реактивное движение, как у ракеты: воздух толкают назад, и он толкает машинку вперёд.',
      svg: finished,
    },
  ],
  teacherTips: [
    'Главная причина, почему машинка не едет, — колёса не крутятся свободно. Проверяйте катание до установки шарика.',
    'Уточните у родителей про аллергию на латекс. Надувать шарики лучше через трубочку, а не ртом прямо.',
    'Гонки: наклейте на пол стартовую линию скотчем, а расстояние меряйте рулеткой. Результаты можно записать в таблицу на доске.',
  ],
  variations: [
    'Эксперимент: что будет с двумя шариками? С длинной трубочкой? С большими колёсами из старых дисков?',
    'Конкурс дизайна: пожарная машина, гоночный болид, школьный автобус — развёртка та же, украшения разные.',
    'Для старших: посчитать скорость. Расстояние разделить на время по секундомеру.',
  ],
}
