import { svg, valley, line, arrow, path, label, emoji } from '../../diagrams/kit.js'

const COLOR = '#e84a5f'
const DARK = '#b8303f'
const LIGHT = '#ffd54f'
const PENCIL = '#7a7a7a'

const sheet = (x, y, w, h, fill = COLOR) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#4a3424" stroke-width="2.5"/>`

const slitXs = Array.from({ length: 13 }, (_, i) => 55 + i * 15)
const slits = (y1, y2) => slitXs.map((x) => line(x, y1, x, y2, { width: 2.5 })).join('')

// Фонарик: две сплошные полосы-кольца и выгнутые полоски между ними
function lantern(withHandle) {
  const cx = 150
  const r = 60
  const top = 92
  const bottom = 208
  const strips = [-72, -48, -24, 0, 24, 48, 72]
    .map((deg) => {
      const s1 = Math.sin(((deg - 9) * Math.PI) / 180)
      const s2 = Math.sin(((deg + 9) * Math.PI) / 180)
      const x1 = cx + r * s1
      const x2 = cx + r * s2
      return path(
        `M${x1} ${top} Q${cx + 110 * s1} 150 ${x1} ${bottom} L${x2} ${bottom} Q${cx + 110 * s2} 150 ${x2} ${top} Z`,
        { fill: COLOR, width: 2 },
      )
    })
    .join('')
  const handle = withHandle ? path(`M${cx - 52} 80 C${cx - 52} 10 ${cx + 52} 10 ${cx + 52} 80`, { stroke: DARK, width: 12 }) : ''
  return (
    handle +
    `<rect x="${cx - r}" y="${top}" width="${2 * r}" height="${bottom - top}" fill="${LIGHT}"/>` +
    strips +
    `<rect x="${cx - r}" y="72" width="${2 * r}" height="${top - 72}" fill="${COLOR}" stroke="#4a3424" stroke-width="2.5"/>` +
    `<rect x="${cx - r}" y="${bottom}" width="${2 * r}" height="20" fill="${COLOR}" stroke="#4a3424" stroke-width="2.5"/>`
  )
}

const finished = svg(lantern(true))

export default {
  id: 'paper-lantern',
  title: 'Бумажный фонарик',
  technique: 'paper',
  difficulty: 2,
  age: '7+',
  time: '25–30 минут',
  description: 'Классический фонарик из одного листа. Отлично подходит для новогоднего украшения группы.',
  materials: ['Лист цветной бумаги А4', 'Полоска бумаги 2×20 см для ручки', 'Ножницы', 'Клей-карандаш', 'Простой карандаш и линейка'],
  cover: finished,
  steps: [
    {
      text: 'Сложи лист пополам вдоль: нижний длинный край к верхнему.',
      svg: svg(sheet(40, 80, 220, 140), valley(40, 150, 260, 150), arrow(150, 214, 150, 86, { bend: -0.3 })),
    },
    {
      text: 'Сгиб внизу. Проведи карандашом линию на расстоянии двух пальцев от верхнего края. Дальше этой линии резать нельзя!',
      svg: svg(sheet(40, 115, 220, 70), line(40, 135, 260, 135, { stroke: PENCIL, width: 3 }), line(40, 185, 260, 185, { width: 5 }), label(150, 212, 'сгиб', { size: 18 }), label(150, 105, 'открытые края', { size: 16 })),
    },
    {
      text: 'Делай надрезы от сгиба до линии через каждые 1,5–2 сантиметра.',
      tip: 'Ножницы держим остриём от себя. Малышам можно заранее расчертить линии надрезов.',
      svg: svg(sheet(40, 115, 220, 70), line(40, 135, 260, 135, { stroke: PENCIL, width: 3 }), slits(135, 185), emoji(150, 240, '✂️', 44)),
    },
    {
      text: 'Разверни лист. Надрезы получились посередине.',
      svg: svg(sheet(40, 80, 220, 140), slits(100, 200)),
    },
    {
      text: 'Сверни лист в трубочку, надрезами вдоль, и склей короткие края. Чуть-чуть прижми фонарик сверху, и полоски выгнутся.',
      svg: svg(lantern(false), arrow(150, 40, 150, 66, { bend: 0, width: 3.5 })),
    },
    {
      text: 'Приклей сверху полоску-ручку. Фонарик готов!',
      svg: finished,
    },
  ],
  teacherTips: [
    'Самое частое затруднение — ребёнок режет «до конца» и лист распадается. Линия-ограничитель и напоминание «стоп у линии» решают проблему.',
    'Внутрь можно вклеить трубочку из жёлтой бумаги, тогда фонарик будет как будто светиться.',
  ],
  variations: [
    'Гирлянда: проденьте нитку через ручки нескольких фонариков.',
    'Попробуйте узкие и широкие надрезы и сравните, какой фонарик получится пышнее.',
  ],
}
