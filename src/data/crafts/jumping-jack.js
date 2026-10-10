import { svg, arrow, emoji, outlined, INK } from '../../diagrams/kit.js'
import { page, hole, thumbnail } from '../../diagrams/net.js'

// Все размеры — в миллиметрах. Руки и ноги висят на брадсах за туловищем.
// Нитка цепляется за отверстие выше и ближе к центру, чем ось.
// Тянем нитку вниз, и рука поворачивается вокруг оси, поднимаясь вверх.

const SHOULDERS = [[26, 88], [74, 88]]
const HIPS = [[34, 140], [66, 140]]
const ARM_HOLE = [5, -11]
const LEG_HOLE = [6, -12]
const REST = { arm: 15, leg: 8 }
const UP = { arm: 120, leg: 42 }

const C = {
  skin: '#ffd9b8',
  hat: '#7e57c2',
  hatStripe: '#ffd54f',
  hair: '#ff8a3d',
  body: '#ef5350',
  dots: '#ffeb3b',
  sleeve: '#42a5f5',
  pants: '#66bb6a',
  shoe: '#5d4037',
  collar: '#ffffff',
  back: '#e7dccd',
  brad: '#e0b84c',
  thread: '#c2185b',
}

const n = (v) => +v.toFixed(2)

/** Поворот точки (в системе SVG: положительный угол — по часовой стрелке). */
const rot = ([x, y], deg) => {
  const a = (deg * Math.PI) / 180
  return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]
}
const add = (a, b) => [a[0] + b[0], a[1] + b[1]]
const mirrorX = ([x, y]) => [-x, y]

// --- Детали. color = false — контур для печати (раскраска) ---

const fills = (color) => (key) => (color ? C[key] : '#fff')

function arm(w, color, side) {
  const f = fills(color)
  return (
    `<rect x="-9" y="-20" width="18" height="76" rx="9" fill="${f('sleeve')}" stroke="${INK}" stroke-width="${w}"/>` +
    (color ? `<rect x="-9" y="38" width="18" height="6" fill="${C.hatStripe}" stroke="${INK}" stroke-width="${w * 0.6}"/>` : '') +
    `<circle cx="0" cy="62" r="9.5" fill="${f('skin')}" stroke="${INK}" stroke-width="${w}"/>`
  )
}

function leg(w, color, side) {
  const f = fills(color)
  const toe = side === 'left' ? -7 : 7
  return (
    `<rect x="-11" y="-20" width="22" height="88" rx="8" fill="${f('pants')}" stroke="${INK}" stroke-width="${w}"/>` +
    (color ? `<line x1="-11" y1="20" x2="11" y2="20" stroke="${INK}" stroke-width="${w * 0.6}"/><line x1="-11" y1="44" x2="11" y2="44" stroke="${INK}" stroke-width="${w * 0.6}"/>` : '') +
    `<ellipse cx="${toe}" cy="74" rx="16" ry="8" fill="${f('shoe')}" stroke="${INK}" stroke-width="${w}"/>`
  )
}

const bodyParts = [
  '<polygon points="33,32 67,32 50,3"/>',
  '<circle cx="50" cy="4" r="4.5"/>',
  '<circle cx="30" cy="46" r="8"/>',
  '<circle cx="70" cy="46" r="8"/>',
  '<circle cx="50" cy="48" r="20"/>',
  '<rect x="16" y="68" width="68" height="84" rx="16"/>',
  '<polygon points="26,64 33,74 40,64 47,74 54,64 61,74 68,64 74,64 74,76 26,76"/>',
]

function face(w) {
  return (
    `<circle cx="42" cy="44" r="2.6" fill="${INK}"/><circle cx="58" cy="44" r="2.6" fill="${INK}"/>` +
    `<path d="M40 55 Q50 64 60 55" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<circle cx="50" cy="51" r="4.5" fill="#e53935" stroke="${INK}" stroke-width="${w * 0.8}"/>`
  )
}

function body(w, color, { back = false } = {}) {
  if (back) return outlined(bodyParts, C.back, { width: w })
  if (!color) {
    // Для печати: общий контур + линии деталей, чтобы было что раскрашивать
    return (
      outlined(bodyParts, '#fff', { width: w }) +
      `<circle cx="50" cy="48" r="20" fill="none" stroke="${INK}" stroke-width="${w * 0.6}"/>` +
      `<line x1="33" y1="32" x2="67" y2="32" stroke="${INK}" stroke-width="${w * 0.6}"/>` +
      `<polyline points="26,76 26,64 33,74 40,64 47,74 54,64 61,74 68,64 74,64 74,76" fill="none" stroke="${INK}" stroke-width="${w * 0.6}"/>` +
      face(w * 0.8).replace(/fill="#e53935"/, 'fill="#fff"')
    )
  }
  const s = `stroke="${INK}" stroke-width="${w}"`
  return (
    `<polygon points="33,32 67,32 50,3" fill="${C.hat}" ${s}/>` +
    `<polygon points="38.5,22 61.5,22 57,15 43,15" fill="${C.hatStripe}"/>` +
    `<circle cx="50" cy="4" r="4.5" fill="${C.hatStripe}" ${s}/>` +
    `<circle cx="30" cy="46" r="8" fill="${C.hair}" ${s}/><circle cx="70" cy="46" r="8" fill="${C.hair}" ${s}/>` +
    `<circle cx="50" cy="48" r="20" fill="${C.skin}" ${s}/>` +
    `<rect x="16" y="68" width="68" height="84" rx="16" fill="${C.body}" ${s}/>` +
    [[34, 96], [62, 90], [46, 120], [68, 128], [30, 136], [52, 142]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${C.dots}"/>`).join('') +
    `<polygon points="26,64 33,74 40,64 47,74 54,64 61,74 68,64 74,64 74,76 26,76" fill="${C.collar}" ${s}/>` +
    `<circle cx="36" cy="52" r="3.5" fill="#ff8a80" opacity="0.7"/><circle cx="64" cy="52" r="3.5" fill="#ff8a80" opacity="0.7"/>` +
    face(w)
  )
}

/** Рука или нога на своём месте и под своим углом. */
function limb(kind, side, angle, w, color, { holes = false, brad = false } = {}) {
  const P = (kind === 'arm' ? SHOULDERS : HIPS)[side === 'left' ? 0 : 1]
  const H = kind === 'arm' ? ARM_HOLE : LEG_HOLE
  const E = side === 'left' ? H : mirrorX(H)
  const a = side === 'left' ? angle : -angle
  const shape = kind === 'arm' ? arm(w, color, side) : leg(w, color, side)
  let marks = ''
  if (holes) marks += `<circle cx="0" cy="0" r="2" fill="#fff" stroke="${INK}" stroke-width="${w * 0.6}"/><circle cx="${E[0]}" cy="${E[1]}" r="1.6" fill="#fff" stroke="${INK}" stroke-width="${w * 0.6}"/>`
  if (brad) marks += `<circle cx="0" cy="0" r="3.4" fill="${C.brad}" stroke="${INK}" stroke-width="${w * 0.7}"/>`
  return `<g transform="translate(${P[0]} ${P[1]}) rotate(${a})">${shape}${marks}</g>`
}

/** Где оказывается отверстие для нитки при данном угле. */
function threadPoint(kind, side, angle) {
  const P = (kind === 'arm' ? SHOULDERS : HIPS)[side === 'left' ? 0 : 1]
  const H = kind === 'arm' ? ARM_HOLE : LEG_HOLE
  const E = side === 'left' ? H : mirrorX(H)
  return add(P, rot(E, side === 'left' ? angle : -angle))
}

const limbs = (pose, w, color, opts) =>
  ['arm', 'leg'].flatMap((k) => ['left', 'right'].map((s) => limb(k, s, pose[k], w, color, opts))).join('')

const thread = (a, b, w) => `<line x1="${n(a[0])}" y1="${n(a[1])}" x2="${n(b[0])}" y2="${n(b[1])}" stroke="${C.thread}" stroke-width="${w}" stroke-linecap="round"/>`
const bead = (x, y, w) => `<circle cx="${x}" cy="${y}" r="5" fill="#ffb300" stroke="${INK}" stroke-width="${w}"/>`

/** Вид сзади: туловище, поверх него — руки и ноги и нитки. */
function backView(w, { pull = false } = {}) {
  const pose = REST
  const aL = threadPoint('arm', 'left', pose.arm)
  const aR = threadPoint('arm', 'right', pose.arm)
  const lL = threadPoint('leg', 'left', pose.leg)
  const lR = threadPoint('leg', 'right', pose.leg)
  let out = body(w, false, { back: true }) + limbs(pose, w, false, { holes: true })
  out += ['arm', 'leg'].flatMap((k) => ['left', 'right'].map((s) => {
    const P = (k === 'arm' ? SHOULDERS : HIPS)[s === 'left' ? 0 : 1]
    return `<circle cx="${P[0]}" cy="${P[1]}" r="2.4" fill="${C.brad}" stroke="${INK}" stroke-width="${w * 0.6}"/><line x1="${P[0] - 5}" y1="${P[1] + 1.5}" x2="${P[0] + 5}" y2="${P[1] + 1.5}" stroke="#c99a2e" stroke-width="${w * 1.2}" stroke-linecap="round"/>`
  })).join('')
  out += thread(aL, aR, w * 1.1) + thread(lL, lR, w * 1.1)
  if (pull) {
    const m1 = [(aL[0] + aR[0]) / 2, (aL[1] + aR[1]) / 2]
    const m2 = [(lL[0] + lR[0]) / 2, (lL[1] + lR[1]) / 2]
    out += thread(m1, m2, w * 1.1) + thread(m2, [50, 236], w * 1.1) + `<circle cx="${n(m1[0])}" cy="${n(m1[1])}" r="1.8" fill="${C.thread}"/><circle cx="${n(m2[0])}" cy="${n(m2[1])}" r="1.8" fill="${C.thread}"/>` + bead(50, 240, w)
  }
  return out
}

function front(pose, w, { pullTo = null } = {}) {
  let out = ''
  if (pullTo) out += thread([50, 140], [50, pullTo], w * 1.1) + bead(50, pullTo + 4, w)
  return out + limbs(pose, w, true, { brad: true }) + body(w, true)
}

// --- Холст схем: k пикселей на миллиметр ---
const at = (k, inner, dy = 0) => `<g transform="translate(${150 - 50 * k} ${dy}) scale(${k})">${inner}</g>`

// --- Шаблон ---

const TPL = 0.4
const partsLayout = [
  ['arm', 'left', 150, 36, 'рука'],
  ['arm', 'right', 180, 36, 'рука'],
  ['leg', 'left', 222, 36, 'нога'],
  ['leg', 'right', 266, 36, 'нога'],
]

function templateParts() {
  let out = `<g transform="translate(18 20)">${body(TPL, false)}${[...SHOULDERS, ...HIPS].map(([x, y]) => hole(x, y, 1.8)).join('')}${hole(50, 4, 1.2)}</g>`
  for (const [kind, side, x, y, name] of partsLayout) {
    const H = kind === 'arm' ? ARM_HOLE : LEG_HOLE
    const E = side === 'left' ? H : mirrorX(H)
    const shape = kind === 'arm' ? arm(TPL, false, side) : leg(TPL, false, side)
    out += `<g transform="translate(${x} ${y})">${shape}${hole(0, 0, 1.8)}${hole(E[0], E[1], 1.2)}</g>`
    out += `<text x="${x}" y="${y + (kind === 'arm' ? 86 : 98)}" font-size="3.4" text-anchor="middle" fill="#555">${name}</text>`
  }
  out += `<text x="68" y="190" font-size="3.4" text-anchor="middle" fill="#555">туловище</text>`
  out += `<g font-size="3.2" fill="#555"><text x="150" y="160">Большой кружок — для брадса (ось). Маленький — для нитки.</text>`
  out += `<text x="150" y="166">Нужно: 4 брадса, крепкая нитка ~1 м, бусина.</text></g>`
  return out
}

const sheet = page({ title: 'Марионетка-дёргунчик · 1 лист · печатать на плотной бумаге или картоне', legend: ['cut', 'hole'] }, templateParts())

const finished = svg(at(1.05, front(UP, 2 / 1.05, { pullTo: 238 }), 8), arrow(208, 218, 208, 268, { bend: 0, width: 3.5 }))

export default {
  id: 'paper-jumping-jack',
  title: 'Марионетка-дёргунчик',
  technique: 'paper',
  difficulty: 2,
  age: '7+',
  time: '40–50 минут',
  description:
    'Клоун на брадсах: дёрнешь за бусину, и он машет руками и ногами. Знакомство с осью и рычагом: почему нитка, прицепленная рядом с осью, поднимает всю руку.',
  materials: [
    'Распечатанный шаблон (1 лист А4, лучше плотная бумага или тонкий картон)',
    'Фломастеры, карандаши или цветная бумага для украшения',
    '4 брадса (гвоздики для скрапбукинга)',
    'Крепкая нитка (ирис, мулине) около 1 м и бусина',
    'Шило или толстая игла (работает взрослый)',
    'Ножницы, клей-карандаш',
  ],
  cover: finished,
  template: [sheet],
  steps: [
    {
      text: 'Распечатай шаблон на плотной бумаге. Раскрась клоуна или обклей его цветной бумагой, пока детали ещё на листе.',
      svg: svg(thumbnail(20, 60, 260, sheet), emoji(250, 50, '🖍️', 44)),
    },
    {
      text: 'Вырежи туловище, две руки и две ноги.',
      tip: 'Одна рука и одна нога зеркальные, у них отверстия для нитки с другой стороны. Не перепутайте!',
      svg: svg(
        `<g transform="translate(40 30) scale(1.05)">${body(1.9, true)}</g>`,
        `<g transform="translate(200 50) scale(0.95)">${arm(2, true, 'left')}</g>`,
        `<g transform="translate(240 50) scale(0.95)">${arm(2, true, 'right')}</g>`,
        `<g transform="translate(200 170) scale(0.95) ">${leg(2, true, 'left')}</g>`,
        `<g transform="translate(252 170) scale(0.95)">${leg(2, true, 'right')}</g>`,
        emoji(60, 260, '✂️', 40),
      ),
    },
    {
      text: 'Взрослый прокалывает шилом отверстия: 4 на туловище (плечи и бёдра) и по 2 на каждой руке и ноге. Ещё одно, маленькое, на помпоне шапки, для подвеса.',
      tip: 'Подложите под деталь ластик или кусок пенопласта, тогда шило не повредит стол.',
      svg: svg(
        `<g transform="translate(40 30) scale(1.05)">${body(1.9, true)}${[...SHOULDERS, ...HIPS].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#fff" stroke="#e0325f" stroke-width="1.6"/>`).join('')}<circle cx="50" cy="4" r="2" fill="#fff" stroke="#e0325f" stroke-width="1.4"/></g>`,
        ...[['arm', 'left', 200, 50], ['arm', 'right', 240, 50], ['leg', 'left', 200, 170], ['leg', 'right', 252, 170]].map(([k, s, x, y]) => {
          const H = k === 'arm' ? ARM_HOLE : LEG_HOLE
          const E = s === 'left' ? H : mirrorX(H)
          return `<g transform="translate(${x} ${y}) scale(0.95)">${k === 'arm' ? arm(2, true, s) : leg(2, true, s)}<circle r="3" fill="#fff" stroke="#e0325f" stroke-width="1.6"/><circle cx="${E[0]}" cy="${E[1]}" r="2.2" fill="#fff" stroke="#e0325f" stroke-width="1.4"/></g>`
        }),
      ),
    },
    {
      text: 'Приложи руки и ноги к туловищу сзади и закрепи брадсами через большие отверстия. Ножки брадсов разведи, но не прижимай туго: детали должны свободно качаться.',
      svg: svg(at(1.05, front(REST, 2 / 1.05), 18)),
    },
    {
      text: 'Переверни клоуна. Опусти руки вниз и свяжи их ниткой через маленькие отверстия: нитка должна быть натянута. Так же свяжи ноги.',
      tip: 'Узел завязывайте, когда руки и ноги висят вниз. Если нитка провисает, клоун будет дёргаться вяло.',
      svg: svg(at(1.05, backView(2 / 1.05), 18)),
    },
    {
      text: 'Привяжи длинную нитку к середине верхней нитки, потом к середине нижней. Конец оставь висеть ниже ног и привяжи бусину.',
      svg: svg(at(1.05, backView(2 / 1.05, { pull: true }), 18)),
    },
    {
      text: 'Готово! Держи клоуна за петельку на шапке и тяни за бусину вниз. Отпусти, и руки с ногами опустятся.',
      tip: 'Почему это работает? Нитка привязана чуть в стороне от оси. Когда её тянут вниз, рука поворачивается вокруг брадса, как качели.',
      svg: finished,
    },
  ],
  teacherTips: [
    'Перед занятием сделайте один образец и дайте детям подёргать: так все поймут, что получится, ещё до начала работы.',
    'Самая частая ошибка — перепутать руки, и тогда отверстия для нитки оказываются снаружи. Перед тем как скреплять, проверьте: маленькие отверстия должны смотреть к середине тела.',
    'Хороший вопрос для старших: что будет, если перенести отверстие для нитки дальше от оси? (Руки поднимутся меньше, но тянуть будет легче. Это и есть рычаг.)',
  ],
  variations: [
    'Нарисовать своего персонажа: рыцаря, балерину, робота или Бабу-ягу. Шаблон рук и ног тот же.',
    'Новогодний дёргунчик-Дед Мороз как подарок на ёлку.',
    'Дёргунчик-лягушка: лапы короткие и толстые, оси ближе к углам туловища.',
  ],
}
