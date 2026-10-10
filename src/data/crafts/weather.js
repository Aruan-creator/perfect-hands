import { svg, arrow, emoji, outlined, INK } from '../../diagrams/kit.js'
import { page, thumbnail } from '../../diagrams/net.js'

// Все размеры — в миллиметрах. Основа — лист А4 (297×210), за ней два круга,
// которые выступают за края листа: за эти края их и вращают.

const CARD_W = 297
const CARD_H = 210
const R = 70
const LEFT = [60, 108]
const RIGHT = [237, 108]

// Окошки — сектор кольца сверху над центром круга
const WEATHER_WIN = { half: 27, r1: 20, r2: 66 }
const SEASON_WIN = { half: 40, r1: 18, r2: 66 }
const ICON_R = 43

const WEATHER = [
  { name: 'солнце', icon: 'sun', bg: '#fff3c4' },
  { name: 'облачно', icon: 'cloudy', bg: '#e3f0fb' },
  { name: 'дождь', icon: 'rain', bg: '#d6e6f5' },
  { name: 'гроза', icon: 'storm', bg: '#d9d4ec' },
  { name: 'снег', icon: 'snow', bg: '#eef6ff' },
  { name: 'ветер', icon: 'wind', bg: '#e4f4ec' },
]
const SEASONS = [
  { name: 'лето', icon: 'summer', bg: '#e6f6d8' },
  { name: 'осень', icon: 'autumn', bg: '#fdebd3' },
  { name: 'зима', icon: 'winter', bg: '#eaf3fb' },
  { name: 'весна', icon: 'spring', bg: '#fbe6ef' },
]

const CARD_COLOR = '#bfe0f5'
const n = (v) => +v.toFixed(2)
const polar = ([cx, cy], r, deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)]

/** Сектор кольца: от угла a1 до a2 (в градусах, 0° — вправо, −90° — вверх). */
function annulus(c, r1, r2, a1, a2) {
  const large = a2 - a1 > 180 ? 1 : 0
  const [x1, y1] = polar(c, r2, a1)
  const [x2, y2] = polar(c, r2, a2)
  const [x3, y3] = polar(c, r1, a2)
  const [x4, y4] = polar(c, r1, a1)
  return `M${n(x1)} ${n(y1)} A${r2} ${r2} 0 ${large} 1 ${n(x2)} ${n(y2)} L${n(x3)} ${n(y3)} A${r1} ${r1} 0 ${large} 0 ${n(x4)} ${n(y4)} Z`
}

function pie(c, r, a1, a2) {
  const [x1, y1] = polar(c, r, a1)
  const [x2, y2] = polar(c, r, a2)
  return `M${c[0]} ${c[1]} L${n(x1)} ${n(y1)} A${r} ${r} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${n(x2)} ${n(y2)} Z`
}

// --- Картинки для аппликации. Нарисованы вокруг точки (0,0), высота ~30 мм ---
// stencil: вместо цветов — белый силуэт с контуром (трафарет для обводки)

function icons(w, stencil) {
  const f = (c) => (stencil ? '#fff' : c)
  const st = `stroke="${INK}" stroke-width="${w}"`
  const cloud = (dx, dy, s, fill) =>
    outlined(
      ['<circle cx="-7" cy="2" r="6"/>', '<circle cx="0" cy="-3" r="8"/>', '<circle cx="8" cy="2" r="6"/>', '<rect x="-13" y="2" width="26" height="7" rx="3.5"/>'],
      f(fill),
      { width: w / s, transform: `translate(${dx} ${dy}) scale(${s})` },
    )
  const sun = (dx, dy, s) => {
    const rays = Array.from({ length: 8 }, (_, k) => {
      const a = (k * 45 * Math.PI) / 180
      const d = (14 * Math.PI) / 180
      const p = (r, t) => `${n(r * Math.cos(t))},${n(r * Math.sin(t))}`
      return `<polygon points="${p(14, a)} ${p(9, a - d)} ${p(9, a + d)}" fill="${f('#ffb300')}" ${st}/>`
    }).join('')
    return `<g transform="translate(${dx} ${dy}) scale(${s})">${rays}<circle r="8" fill="${f('#ffd54f')}" ${st}/></g>`
  }
  const drop = (x, y) => `<path d="M${x} ${y - 3.5} Q${x + 3} ${y + 1} ${x} ${y + 3} Q${x - 3} ${y + 1} ${x} ${y - 3.5} Z" fill="${f('#4a90d9')}" ${st}/>`
  const crown = (fill) =>
    outlined(['<circle cx="0" cy="-9" r="11"/>', '<circle cx="-9" cy="-2" r="8"/>', '<circle cx="9" cy="-2" r="8"/>'], f(fill), { width: w })
  const trunk = `<rect x="-2.5" y="2" width="5" height="16" rx="1" fill="${f('#8d5a3b')}" ${st}/>`
  const dots = (list, fill, r = 1.8) => list.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f(fill)}" ${st}/>`).join('')
  const leaf = (x, y, rot, fill) => `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="1.4" transform="rotate(${rot} ${x} ${y})" fill="${f(fill)}" ${st}/>`
  const flake = (x, y, s) =>
    `<g transform="translate(${x} ${y}) scale(${s})" stroke="${stencil ? INK : '#2f6fd1'}" stroke-width="${(w * 1.6) / s}" stroke-linecap="round">` +
    [0, 60, 120].map((a) => `<line x1="-10" y1="0" x2="10" y2="0" transform="rotate(${a})"/>`).join('') +
    [0, 60, 120, 180, 240, 300].map((a) => `<path d="M6 -3 L8 0 L6 3" fill="none" transform="rotate(${a})"/>`).join('') +
    `</g>`

  return {
    sun: () => sun(0, 0, 1),
    cloudy: () => sun(6, -6, 0.7) + cloud(-1, 2, 1, '#ffffff'),
    rain: () => cloud(0, -5, 1, '#e8eef4') + drop(-8, 10) + drop(0, 13) + drop(8, 10),
    storm: () =>
      cloud(0, -6, 1, '#9aa5b1') +
      `<polygon points="1,3 -5,11 -1,11 -4,19 6,8 2,8 5,3" fill="${f('#ffd400')}" ${st}/>`,
    snow: () => flake(0, 0, 1.2),
    wind: () =>
      ['M-13 -7 L5 -7 Q11 -7 11 -11 Q11 -15 6 -14', 'M-13 0 L9 0 Q15 0 15 4 Q15 8 10 7', 'M-13 7 L2 7 Q7 7 7 11 Q7 14 3 13']
        .map((d) => `<path d="${d}" fill="none" stroke="${stencil ? INK : '#5aa9e6'}" stroke-width="${w * 2.2}" stroke-linecap="round"/>`)
        .join(''),
    summer: () => trunk + crown('#57b947') + dots([[-6, -8], [5, -12], [9, 0], [-9, 2], [1, -2]], '#e53935'),
    autumn: () => trunk + crown('#f59f2a') + leaf(-14, 12, 30, '#e65100') + leaf(13, 9, -40, '#ffca28') + leaf(-9, 17, 70, '#ffca28'),
    winter: () => trunk + crown('#ffffff') + `<rect x="-16" y="16" width="32" height="4" rx="2" fill="${f('#ffffff')}" ${st}/>` + flake(-14, -14, 0.25) + flake(14, -12, 0.25),
    spring: () => trunk + crown('#a5d66f') + dots([[-6, -10], [4, -14], [9, -3], [-9, 0], [1, -4], [5, 3]], '#f48fb1', 1.6),
  }
}

/**
 * Круг. items — сектора по часовой стрелке, начиная с верхнего.
 * turn — на сколько секторов повёрнут круг (какой сектор сейчас наверху).
 */
function wheel(c, items, w, { turn = 0, template = false, win } = {}) {
  const step = 360 / items.length
  const ic = icons(w, false)
  let out = `<g transform="rotate(${-turn * step} ${c[0]} ${c[1]})">`
  out += `<circle cx="${c[0]}" cy="${c[1]}" r="${R}" fill="#fff" stroke="${INK}" stroke-width="${w}"/>`
  items.forEach((it, i) => {
    const mid = -90 + i * step
    if (!template) out += `<path d="${pie(c, R, mid - step / 2, mid + step / 2)}" fill="${it.bg}"/>`
  })
  items.forEach((_, i) => {
    const [x, y] = polar(c, R, -90 + i * step + step / 2)
    out += `<line x1="${c[0]}" y1="${c[1]}" x2="${n(x)}" y2="${n(y)}" stroke="#9a8f84" stroke-width="${w * 0.6}"/>`
  })
  if (template) {
    // Зона окошка: картинку нужно уместить между этими дугами
    for (const r of [win.r1, win.r2]) {
      out += `<circle cx="${c[0]}" cy="${c[1]}" r="${r}" fill="none" stroke="#2f6fd1" stroke-width="${w * 0.6}" stroke-dasharray="2 1.5"/>`
    }
    items.forEach((it, i) => {
      const [x, y] = polar(c, R - 3.5, -90 + i * step)
      out += `<text x="${n(x)}" y="${n(y)}" font-size="3.2" fill="#777" text-anchor="middle" transform="rotate(${i * step} ${n(x)} ${n(y)})" dominant-baseline="middle">${it.name}</text>`
    })
  } else {
    items.forEach((it, i) => {
      out += `<g transform="rotate(${i * step} ${c[0]} ${c[1]}) translate(${c[0]} ${c[1] - ICON_R}) scale(1.1)">${ic[it.icon]()}</g>`
    })
  }
  out += `<circle cx="${c[0]}" cy="${c[1]}" r="${R}" fill="none" stroke="${INK}" stroke-width="${w}"/>`
  out += centerMark(c, w)
  return out + '</g>'
}

const centerMark = ([x, y], w) =>
  `<line x1="${x - 3}" y1="${y}" x2="${x + 3}" y2="${y}" stroke="${INK}" stroke-width="${w * 0.6}"/><line x1="${x}" y1="${y - 3}" x2="${x}" y2="${y + 3}" stroke="${INK}" stroke-width="${w * 0.6}"/>`

const windowPath = (c, win) => annulus(c, win.r1, win.r2, -90 - win.half, -90 + win.half)

function cardTitle(x, y, text, w, filled) {
  return `<text x="${x}" y="${y}" font-size="11" font-weight="800" text-anchor="middle" letter-spacing="0.6" fill="${filled ? '#e8590c' : 'none'}" stroke="${filled ? 'none' : '#888'}" stroke-width="${w * 0.6}">${text}</text>`
}

function house(w) {
  return (
    `<rect x="132" y="150" width="34" height="28" fill="#f2c18d" stroke="${INK}" stroke-width="${w}"/>` +
    `<polygon points="127,151 149,132 171,151" fill="#d9534f" stroke="${INK}" stroke-width="${w}"/>` +
    `<rect x="143" y="162" width="11" height="16" fill="#8d5a3b" stroke="${INK}" stroke-width="${w}"/>`
  )
}

/** Основа. cut — окошки уже вырезаны (сквозь них видны круги). */
function card(w, { cut = true, decorated = true } = {}) {
  const outer = `M0 0 H${CARD_W} V${CARD_H} H0 Z`
  const holes = cut ? ' ' + windowPath(LEFT, WEATHER_WIN) + ' ' + windowPath(RIGHT, SEASON_WIN) : ''
  let out = `<path d="${outer}${holes}" fill="${CARD_COLOR}" fill-rule="evenodd" stroke="${INK}" stroke-width="${w}"/>`
  if (!cut) {
    out += [windowPath(LEFT, WEATHER_WIN), windowPath(RIGHT, SEASON_WIN)]
      .map((d) => `<path d="${d}" fill="#fff" stroke="${INK}" stroke-width="${w}" stroke-dasharray="3 2"/>`)
      .join('')
  }
  if (decorated) {
    out +=
      `<path d="M0 186 Q40 176 80 186 T160 186 T240 186 T297 184 V210 H0 Z" fill="#8bc34a" stroke="${INK}" stroke-width="${w}"/>` +
      house(w) +
      cardTitle(LEFT[0], 30, 'ПОГОДА', w, true) +
      cardTitle(RIGHT[0], 30, 'ВРЕМЯ ГОДА', w, true)
  }
  for (const c of [LEFT, RIGHT]) {
    out += cut
      ? `<circle cx="${c[0]}" cy="${c[1]}" r="4" fill="#e0b84c" stroke="${INK}" stroke-width="${w}"/>`
      : centerMark(c, w)
  }
  return out
}

// --- Схемы шагов (холст 300×300). k — сколько пикселей схемы в одном миллиметре ---

const at = (x, y, k, inner) => `<g transform="translate(${x} ${y}) scale(${k})">${inner}</g>`

function scene(k, opts = {}) {
  const w = 2.2 / k
  const { weather = 0, season = 0 } = opts
  return at(
    16,
    150 - (CARD_H * k) / 2,
    k,
    wheel(LEFT, WEATHER, w, { turn: weather }) + wheel(RIGHT, SEASONS, w, { turn: season }) + card(w, opts),
  )
}

const turnArrows = (k) => {
  const y0 = 150 - (CARD_H * k) / 2
  const lx = 16 - 9 * k
  const rx = 16 + (CARD_W + 9) * k
  const cy = y0 + LEFT[1] * k
  return (
    arrow(lx - 2, cy + 34, lx - 2, cy - 34, { bend: -0.35, width: 3.5, color: '#2f6fd1' }) +
    arrow(rx + 2, cy - 34, rx + 2, cy + 34, { bend: -0.35, width: 3.5, color: '#2f6fd1' })
  )
}

const bigWheel = (items, opts) => {
  const k = 2
  const w = 2.2 / k
  return svg(at(150 - LEFT[0] * k, 150 - LEFT[1] * k, k, wheel(LEFT, items, w, opts)))
}

function cutWindows() {
  const k = 0.9
  const w = 2.2 / k
  return svg(at(16, 55, k, card(w, { cut: false, decorated: false })), emoji(150, 245, '✂️', 44), emoji(60, 240, '🧑‍🏫', 40))
}

function assemble() {
  // Фрагмент: левый круг за основой, брадс подлетает к центру
  const cx = 150
  const cy = 150
  const card2 = `<rect x="100" y="16" width="200" height="270" fill="${CARD_COLOR}" stroke="${INK}" stroke-width="2.2"/>`
  return svg(
    `<circle cx="${cx}" cy="${cy}" r="${R * 1.6}" fill="${WEATHER[0].bg}" stroke="${INK}" stroke-width="2.2"/>`,
    card2,
    `<circle cx="${cx}" cy="${cy}" r="3" fill="${INK}"/>`,
    // брадс: шляпка и две ножки
    `<g transform="translate(225 70) rotate(-35)"><circle r="12" fill="#e0b84c" stroke="${INK}" stroke-width="2.2"/><rect x="-3" y="10" width="2.6" height="34" fill="#c99a2e" stroke="${INK}" stroke-width="1.5"/><rect x="0.4" y="10" width="2.6" height="34" fill="#c99a2e" stroke="${INK}" stroke-width="1.5"/></g>`,
    arrow(214, 104, 156, 144, { bend: 0.2 }),
    // вид сзади: ножки разведены
    `<g transform="translate(55 258)"><rect x="-44" y="-24" width="88" height="48" rx="8" fill="#fff" stroke="#9a8f84" stroke-width="2"/><text x="0" y="-10" font-size="13" text-anchor="middle" fill="#7d6a5a">сзади</text><circle r="5" fill="#c99a2e" stroke="${INK}" stroke-width="1.5"/><rect x="-30" y="4" width="26" height="4" rx="1" fill="#c99a2e" stroke="${INK}" stroke-width="1.5"/><rect x="4" y="4" width="26" height="4" rx="1" fill="#c99a2e" stroke="${INK}" stroke-width="1.5"/></g>`,
  )
}

// --- Шаблон для печати ---

const TPL_W = 0.4

// Лист 1: основа — это сам лист А4, печатать прямо на цветном картоне
const sheetCard =
  `<svg width="297mm" height="210mm" viewBox="0 0 297 210" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif">` +
  `<rect width="297" height="210" fill="#fff"/>` +
  [windowPath(LEFT, WEATHER_WIN), windowPath(RIGHT, SEASON_WIN)].map((d) => `<path d="${d}" fill="#eee" stroke="#222" stroke-width="${TPL_W}"/>`).join('') +
  centerMark(LEFT, TPL_W * 1.5) +
  centerMark(RIGHT, TPL_W * 1.5) +
  cardTitle(LEFT[0], 30, 'ПОГОДА', TPL_W, false) +
  cardTitle(RIGHT[0], 30, 'ВРЕМЯ ГОДА', TPL_W, false) +
  `<text x="${LEFT[0]}" y="${LEFT[1] + 12}" font-size="3" text-anchor="middle" fill="#888">прокол</text>` +
  `<text x="${RIGHT[0]}" y="${RIGHT[1] + 12}" font-size="3" text-anchor="middle" fill="#888">прокол</text>` +
  `<text x="148.5" y="205" font-size="3.2" text-anchor="middle" fill="#888">Календарь погоды · лист 1 из 3 · основа: печатать на картоне, вырезать только серые окошки</text>` +
  `</svg>`

const sheetWheels = page(
  { title: 'Календарь погоды · лист 2 из 3 · круги (резать по сплошной линии, рисунки клеить между синими дугами)', legend: ['cut'] },
  wheel([78, 105], WEATHER, TPL_W, { template: true, win: WEATHER_WIN }),
  wheel([219, 105], SEASONS, TPL_W, { template: true, win: SEASON_WIN }),
)

const stencilIcons = icons(TPL_W / 1.1, true)
const sheetStencils = page(
  { title: 'Календарь погоды · лист 3 из 3 · трафареты: вырежи, обведи на цветной бумаге и вырежи ещё раз', legend: ['cut'] },
  ...[...WEATHER, ...SEASONS].map((it, i) => {
    const col = i % 5
    const row = Math.floor(i / 5)
    const x = 35 + col * 56
    const y = 50 + row * 80
    return (
      `<g transform="translate(${x} ${y}) scale(1.1)">${stencilIcons[it.icon]()}</g>` +
      `<text x="${x}" y="${y + 32}" font-size="3.6" text-anchor="middle" fill="#555">${it.name}</text>`
    )
  }),
)

const finished = svg(scene(0.9), turnArrows(0.9))

export default {
  id: 'applique-weather-calendar',
  title: 'Календарь погоды',
  technique: 'applique',
  difficulty: 3,
  age: '8+',
  time: '2 занятия по 40 минут',
  description:
    'Аппликация с двумя вращающимися кругами. Каждое утро дети поворачивают круги: в окошках видно, какая сегодня погода и какое время года. Попутно учимся делить круг на равные части.',
  materials: [
    'Распечатанный шаблон: 3 листа А4',
    'Цветной картон А4 для основы (шаблон основы печатаем прямо на него)',
    'Белый картон или плотная бумага для двух кругов',
    'Цветная бумага для картинок',
    'Ножницы и клей-карандаш',
    '2 брадса (гвоздики для скрапбукинга). Можно заменить пуговицами, пришитыми ниткой насквозь',
    'Шило или толстая игла (работает взрослый)',
    'Циркуль (для старших, по желанию)',
  ],
  cover: finished,
  template: [sheetCard, sheetWheels, sheetStencils],
  steps: [
    {
      text: 'Распечатай три листа шаблона: основу — на цветном картоне, круги — на белом картоне, трафареты — на обычной бумаге.',
      tip: 'Масштаб печати 100%. Если принтер не берёт картон, распечатайте на бумаге и наклейте на картон.',
      svg: svg(thumbnail(14, 30, 150, sheetCard), thumbnail(136, 112, 150, sheetWheels), thumbnail(40, 190, 150, sheetStencils)),
    },
    {
      text: 'Вырежи оба круга по сплошной линии.',
      tip: 'Круг вырезают так: ножницы стоят на месте, а поворачивается бумага. Так край получается ровным.',
      svg: svg(at(150 - 78 * 1.9, 150 - 105 * 1.9, 1.9, wheel([78, 105], WEATHER, 2.2 / 1.9, { template: true, win: WEATHER_WIN })), emoji(258, 258, '✂️', 44)),
    },
    {
      text: 'Вырежи в основе два окошка (они отмечены серым). Взрослый помогает: проколи окошко посередине и вырезай от прокола к краям.',
      tip: 'Окошко — это кусочек кольца. Сначала режем по прямым сторонам, потом по дугам.',
      svg: cutWindows(),
    },
    {
      text: 'Круг погоды: вырежи по трафаретам из цветной бумаги солнце, облака, капли, молнию, снежинку и ветер. Наклей по одной картинке в каждый сектор, между синими дугами.',
      tip: 'Перед тем как клеить, приложите круг к основе и проверьте, что картинка целиком видна в окошке.',
      svg: bigWheel(WEATHER),
    },
    {
      text: 'Круг времён года: четыре дерева — летнее зелёное с яблоками, осеннее оранжевое, зимнее в снегу и весеннее в цветах.',
      tip: 'Ствол у всех деревьев одинаковый. Можно вырезать сразу четыре, сложив бумагу гармошкой.',
      svg: bigWheel(SEASONS),
    },
    {
      text: 'Укрась основу: раскрась надписи, наклей травку и домик. Окошки и места прокола не заклеивай!',
      svg: svg(scene(0.9, { cut: true })),
    },
    {
      text: 'Взрослый прокалывает шилом центр круга и отмеченную точку на основе. Положи круг за основу, вставь брадс спереди, а сзади разведи его ножки в стороны.',
      tip: 'Не прижимайте брадс слишком туго, иначе круг не будет крутиться.',
      svg: assemble(),
    },
    {
      text: 'Календарь готов! Поворачивай круги за края: какая сегодня погода? Какое время года?',
      tip: 'Повесьте календари на стену и начинайте каждое занятие с вопроса: «Что сегодня за окном?»',
      svg: svg(scene(0.9, { weather: 2, season: 1 }), turnArrows(0.9)),
    },
  ],
  teacherTips: [
    'Удобно разделить на два занятия: на первом — вырезать круги и окошки, на втором — аппликация и сборка.',
    'Окошки в картоне малышам вырезать трудно. Можно заранее сделать надрезы канцелярским ножом.',
    'Геометрия для старших: попросите разделить круг самим. На 6 частей — циркулем, отложив радиус по окружности 6 раз. На 4 части — двумя перпендикулярными диаметрами.',
    'Если брадсов нет: проденьте через центры нитку с пуговицами с обеих сторон и завяжите.',
  ],
  variations: [
    'Третий круг «Что надеть?»: шапка, зонт, панама, сапоги.',
    'Круг настроения со смайликами — для утреннего круга в группе.',
    'Колесо дней недели: 7 секторов. Задачка: как разделить круг на 7 частей? (Транспортиром, примерно по 51°.)',
  ],
}
