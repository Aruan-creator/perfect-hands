import { svg, arrow, emoji, label, INK } from '../../diagrams/kit.js'
import { page, hole, thumbnail } from '../../diagrams/net.js'

// Флаг Казахстана с солнцем-вертушкой. Размеры — в миллиметрах.
// Полотнище 1:2. Солнце с 32 лучами вырезается отдельно и крепится брадсом:
// лучики чуть повёрнуты, как лопасти, и солнце крутится от ветра.
// Это детская поделка: орёл и орнамент упрощены, пропорции — по официальному описанию.

const FW = 260
const FH = 130
const SLEEVE = 16
const SUN = { x: 130, y: 50, disk: 22, rays: 40, count: 32 }
const EAGLE = { x: 130, y: 108, s: 1.15 }
const BAND = { x: 8, w: 18, tiles: 6 }

const C = {
  sky: '#00afca',
  gold: '#fec50c',
  goldDark: '#d9a400',
  stick: '#c8a165',
}

const n = (v) => +v.toFixed(2)

/** Солнце: круг и 32 треугольных луча. twist — схема «лопастей». */
function sun(cx, cy, w, { fill = C.gold, stroke = INK, twist = false, lines = false } = {}) {
  const { disk, rays, count } = SUN
  const half = Math.PI / count
  let out = ''
  for (let i = 0; i < count; i++) {
    const a = (i / count) * 2 * Math.PI
    const p = (r, t) => `${n(cx + r * Math.cos(t))},${n(cy + r * Math.sin(t))}`
    out += `<polygon points="${p(disk - 1, a - half * 0.9)} ${p(rays, a)} ${p(disk - 1, a + half * 0.9)}" fill="${fill}" stroke="${stroke}" stroke-width="${w * 0.6}"/>`
    if (twist) out += `<polygon points="${p(disk, a)} ${p(rays, a)} ${p(disk + 1, a + half * 0.9)}" fill="${C.goldDark}"/>`
  }
  out += `<circle cx="${cx}" cy="${cy}" r="${disk}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"/>`
  if (lines) {
    // Подсказка, как разделить круг на 32: пополам, ещё пополам…
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI
      const dx = disk * Math.cos(a)
      const dy = disk * Math.sin(a)
      const lw = i % 8 === 0 ? 0.5 : i % 4 === 0 ? 0.35 : i % 2 === 0 ? 0.25 : 0.15
      out += `<line x1="${n(cx - dx)}" y1="${n(cy - dy)}" x2="${n(cx + dx)}" y2="${n(cy + dy)}" stroke="#999" stroke-width="${lw}"/>`
    }
  }
  return out
}

// Степной орёл с раскрытыми крыльями (упрощённый силуэт), центр в (0,0)
const WING = 'M3 -3 C15 -12 30 -17 47 -16 L41 -11 L45 -8 L37 -5 L40 -2 L31 0 L33 3 L23 3.5 L6 6 Z'
function eagle(cx, cy, s, w, fill = C.gold) {
  const st = `fill="${fill}" stroke="${INK}" stroke-width="${w / s}"`
  return (
    `<g transform="translate(${cx} ${cy}) scale(${s})">` +
    `<path d="${WING}" ${st}/>` +
    `<path d="${WING}" transform="scale(-1 1)" ${st}/>` +
    `<polygon points="-4.5,9 4.5,9 7,17 0,15 -7,17" ${st}/>` +
    `<ellipse cx="0" cy="2" rx="5.5" ry="9" ${st}/>` +
    `<circle cx="0" cy="-8" r="4" ${st}/>` +
    `<polygon points="3.2,-9 8,-7.6 3.4,-6" ${st}/>` +
    `</g>`
  )
}

// Орнамент «қошқар мүйіз» (бараньи рога): одна клетка высотой h
function hornTile(cx, y, h, w, color = C.gold) {
  const k = h / 20
  const side = (m) =>
    `M0 10 C0 4 ${7 * m} 2 ${7 * m} 7 C${7 * m} 10 ${4 * m} 10.5 ${3.6 * m} 8.6 ` +
    `M0 10 C0 16 ${7 * m} 18 ${7 * m} 13 C${7 * m} 10 ${4 * m} 9.5 ${3.6 * m} 11.4`
  return `<g transform="translate(${cx} ${y}) scale(${k})"><path d="${side(1)} ${side(-1)} M0 1 L0 19" fill="none" stroke="${color}" stroke-width="${w / k}" stroke-linecap="round"/></g>`
}

function band(x0, y0, w, h, lw, color) {
  const th = h / BAND.tiles
  return Array.from({ length: BAND.tiles }, (_, i) => hornTile(x0 + w / 2, y0 + i * th, th, lw, color)).join('')
}

// --- Схемы ---

function flagScene({ ornament = true, bird = true, sunOn = true, twist = false, stick = true, k = 1.0 } = {}) {
  const ox = 150 - (FW * k) / 2 + 6
  const oy = 150 - (FH * k) / 2 - 20
  const w = 2 / k
  let inner = stick ? '' : `<rect x="${-SLEEVE}" y="0" width="${SLEEVE}" height="${FH}" fill="#d9d9d9" stroke="${INK}" stroke-width="${w}"/>`
  inner += `<rect x="0" y="0" width="${FW}" height="${FH}" fill="${C.sky}" stroke="${INK}" stroke-width="${w}"/>`
  if (ornament) inner += band(BAND.x, 0, BAND.w, FH, 2.2, C.gold)
  if (bird) inner += eagle(EAGLE.x, EAGLE.y, EAGLE.s, w)
  if (sunOn) inner += sun(SUN.x, SUN.y, w, { twist }) + `<circle cx="${SUN.x}" cy="${SUN.y}" r="3.2" fill="${C.goldDark}" stroke="${INK}" stroke-width="${w * 0.7}"/>`
  else inner += `<circle cx="${SUN.x}" cy="${SUN.y}" r="2" fill="${INK}"/>`
  let out = ''
  if (stick) out += `<rect x="${ox - 8}" y="${oy - 8}" width="7" height="${FH * k + 105}" rx="3" fill="${C.stick}" stroke="${INK}" stroke-width="2"/>`
  out += `<g transform="translate(${ox} ${oy}) scale(${k})">${inner}</g>`
  return { out, ox, oy, k }
}

function spinArrows(s) {
  const cx = s.ox + SUN.x * s.k
  const cy = s.oy + SUN.y * s.k
  const r = (SUN.rays + 8) * s.k
  return (
    arrow(cx + r * 0.2, cy - r, cx + r, cy - r * 0.15, { bend: -0.3, width: 3.5, color: '#e0325f' }) +
    arrow(cx - r * 0.2, cy + r, cx - r, cy + r * 0.15, { bend: -0.3, width: 3.5, color: '#e0325f' })
  )
}

// --- Шаблон ---

const TPL = 0.4

const sheet1 = page(
  { title: 'Флаг с солнцем · лист 1 из 2 · полотнище (лучше печатать на голубой бумаге)', legend: ['cut', 'fold', 'glue', 'hole'] },
  `<g transform="translate(${(297 - FW - SLEEVE) / 2 + SLEEVE} 40)">` +
    `<rect x="${-SLEEVE}" y="0" width="${SLEEVE}" height="${FH}" fill="#d9d9d9"/>` +
    `<rect x="0" y="0" width="${FW}" height="${FH}" fill="#e6f7fa"/>` +
    `<rect x="${-SLEEVE}" y="0" width="${FW + SLEEVE}" height="${FH}" fill="none" stroke="#222" stroke-width="${TPL}"/>` +
    `<line x1="0" y1="0" x2="0" y2="${FH}" stroke="#2f6fd1" stroke-width="${TPL}" stroke-dasharray="2 1.2"/>` +
    `<rect x="${BAND.x}" y="0" width="${BAND.w}" height="${FH}" fill="none" stroke="#999" stroke-width="0.3" stroke-dasharray="1.5 1"/>` +
    `<circle cx="${SUN.x}" cy="${SUN.y}" r="${SUN.rays}" fill="none" stroke="#999" stroke-width="0.3" stroke-dasharray="1.5 1"/>` +
    hole(SUN.x, SUN.y, 1.4) +
    `<rect x="${EAGLE.x - 55}" y="${EAGLE.y - 20}" width="110" height="42" fill="none" stroke="#999" stroke-width="0.3" stroke-dasharray="1.5 1"/>` +
    `<text x="${-SLEEVE / 2}" y="${FH / 2}" font-size="3" fill="#555" text-anchor="middle" transform="rotate(-90 ${-SLEEVE / 2} ${FH / 2})">обернуть вокруг палочки</text>` +
    `<text x="${BAND.x + BAND.w / 2}" y="${FH + 5}" font-size="3" fill="#555" text-anchor="middle">орнамент</text>` +
    `<text x="${SUN.x}" y="${SUN.y + 4 + 4}" font-size="3" fill="#555" text-anchor="middle">солнце</text>` +
    `<text x="${EAGLE.x}" y="${EAGLE.y + 27}" font-size="3" fill="#555" text-anchor="middle">орёл</text>` +
    `</g>`,
)

const sheet2 = page(
  { title: 'Флаг с солнцем · лист 2 из 2 · солнце, орёл, орнамент (печатать на жёлтой или золотой бумаге)', legend: ['cut', 'hole'] },
  sun(62, 70, TPL, { fill: '#fff', stroke: '#222', lines: true }),
  hole(62, 70, 2.2),
  `<text x="62" y="122" font-size="3.2" text-anchor="middle" fill="#555">солнце: 32 луча. Отверстие в центре сделай пошире</text>`,
  eagle(185, 70, EAGLE.s, TPL, '#fff'),
  `<text x="185" y="100" font-size="3.2" text-anchor="middle" fill="#555">орёл</text>`,
  `<rect x="262" y="20" width="${BAND.w}" height="${FH}" fill="#fff" stroke="#222" stroke-width="${TPL}"/>`,
  band(262, 20, BAND.w, FH, 0.5, '#555'),
  `<text x="271" y="${20 + FH + 6}" font-size="3.2" text-anchor="middle" fill="#555">орнамент</text>`,
)

const finalScene = flagScene({ twist: true })
const finished = svg(finalScene.out, spinArrows(finalScene))

export default {
  id: 'kz-flag-spinning-sun',
  title: 'Флаг с солнцем-вертушкой',
  technique: 'applique',
  difficulty: 2,
  age: '7+',
  time: '40 минут',
  description:
    'Флаг Казахстана ко Дню Республики. Солнце с 32 лучами вырезано отдельно и крутится, если на него подуть. Попутно решаем задачу: как разделить круг на 32 равные части?',
  materials: [
    'Распечатанный шаблон: 2 листа А4 (лист 1 — на голубой бумаге, лист 2 — на жёлтой или золотой)',
    'Брадс (1 шт.)',
    'Деревянная палочка или шпажка без острия для древка',
    'Ножницы, клей-карандаш',
    'Жёлтый или золотой фломастер, если бумага белая',
  ],
  cover: finished,
  template: [sheet1, sheet2],
  steps: [
    {
      text: 'Распечатай полотнище на голубой бумаге, а солнце, орла и орнамент — на жёлтой. Если бумага белая, раскрась.',
      tip: 'Цвет флага — небесно-голубой, солнце и орёл — золотые.',
      svg: svg(thumbnail(15, 50, 190, sheet1), thumbnail(95, 160, 190, sheet2), emoji(250, 60, '🖨️', 44)),
    },
    {
      text: 'Вырежи полотнище вместе с серой полоской слева, это «рукав» для древка.',
      svg: svg(flagScene({ ornament: false, bird: false, sunOn: false, stick: false }).out, emoji(150, 255, '✂️', 40)),
    },
    {
      text: 'Вырежи полоску с орнаментом «қошқар мүйіз» (бараньи рога) и наклей её вдоль левого края флага.',
      tip: 'Орнамент повторяется сверху вниз. Это один и тот же рисунок, сдвинутый на одну клетку.',
      svg: svg(flagScene({ bird: false, sunOn: false, stick: false }).out),
    },
    {
      text: 'Вырежи орла и наклей его под меткой солнца.',
      svg: svg(flagScene({ sunOn: false, stick: false }).out),
    },
    {
      text: 'Вырежи солнце с лучами. Сколько лучей? Посчитай: их 32!',
      tip: 'Задача для старших: как разделить круг на 32 равные части? Пополам — 2, ещё пополам — 4, потом 8, 16, 32. Тонкие линии на шаблоне показывают эти шаги.',
      svg: svg(`<g transform="translate(150 150) scale(3.2) translate(-62 -70)">${sun(62, 70, 0.6, { lines: true })}</g>`),
    },
    {
      text: 'Каждый лучик чуть-чуть поверни пальцами, все в одну сторону, как лопасти вентилятора.',
      tip: 'Поворачиваем совсем немного. Если перекрутить, лучик сломается.',
      svg: svg(`<g transform="translate(150 150) scale(3.2) translate(-62 -70)">${sun(62, 70, 0.6, { twist: true })}</g>`, arrow(250, 70, 262, 120, { bend: -0.4, width: 3.5 })),
    },
    {
      text: 'Прикрепи солнце брадсом к отмеченной точке. Ножки брадса разведи сзади, но не прижимай: солнце должно свободно крутиться.',
      svg: svg(flagScene({ stick: false, twist: true }).out),
    },
    {
      text: 'Оберни рукав вокруг палочки и приклей. Флаг готов! Подуй на солнце, и оно закрутится.',
      tip: 'Если солнце крутится туго, расширьте отверстие в нём карандашом.',
      svg: finished,
    },
  ],
  teacherTips: [
    'Расскажите, что означают символы флага: голубой цвет — небо и мир, солнце — жизнь и богатство, орёл — свобода, орнамент — культура народа.',
    'Сверьте готовый образец с официальным изображением флага: в детской поделке орёл и орнамент упрощены, это стоит проговорить с детьми.',
    'Лучше брать тонкую бумагу для солнца: лёгкое солнце крутится от слабого дуновения.',
  ],
  variations: [
    'Гирлянда из маленьких флажков для украшения кабинета к празднику.',
    'Солнце-вертушка на палочке отдельно от флага: лучей можно сделать 16, чтобы они были шире.',
    'Орнамент «қошқар мүйіз» — для украшения юрты из поделки «Юрта с раздвижной решёткой».',
  ],
}
