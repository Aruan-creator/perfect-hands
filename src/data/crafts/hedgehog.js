import { svg, outlined, eye, dot, path, emoji } from '../../diagrams/kit.js'

const SPINES = '#8d5a3b'
const SPINES_LIGHT = '#a8714d'
const BODY = '#f5d6a8'
const APPLE = '#e53935'

// Ладошка «пальцами вверх», запястье в точке (0,0)
const handShapes = [
  '<rect x="-32" y="-72" width="64" height="74" rx="20"/>',
  '<rect x="-32" y="-104" width="14" height="50" rx="7"/>',
  '<rect x="-16" y="-124" width="14" height="66" rx="7"/>',
  '<rect x="0" y="-128" width="14" height="70" rx="7"/>',
  '<rect x="16" y="-116" width="14" height="60" rx="7"/>',
  '<rect x="22" y="-66" width="15" height="46" rx="7.5" transform="rotate(38 29 -20)"/>',
]

const hand = (x, y, { scale = 1, rotate = 0, fill = SPINES } = {}) =>
  outlined(handShapes, fill, { transform: `translate(${x} ${y}) rotate(${rotate}) scale(${scale})` })

const body = path('M262 212 C235 172 130 158 112 200 C100 238 215 250 262 212 Z', { fill: BODY })

const fan = (count) =>
  [-95, -62, -29, 4]
    .slice(0, count)
    .map((rot, i) => hand(140, 205, { scale: 0.95, rotate: rot, fill: i % 2 ? SPINES_LIGHT : SPINES }))
    .join('')

const face = eye(212, 198, 8) + dot(262, 212, 7) + path('M232 222 Q240 228 248 222', { width: 2.5 })

const finished = svg(fan(4), body, face, `<circle cx="125" cy="95" r="17" fill="${APPLE}" stroke="#4a3424" stroke-width="2.5"/>`, path('M125 78 L128 68', { width: 3 }))

export default {
  id: 'applique-hedgehog',
  title: 'Ёжик из ладошек',
  technique: 'applique',
  difficulty: 1,
  age: '6+',
  time: '30 минут',
  description: 'Осенняя аппликация, в которой иголки — это ладошки самого ребёнка. Каждый ёжик получается неповторимым.',
  materials: ['Коричневая бумага (2–3 оттенка)', 'Бежевая бумага для мордочки', 'Картон-основа', 'Простой карандаш', 'Ножницы', 'Клей-карандаш', 'Фломастеры'],
  cover: finished,
  steps: [
    {
      text: 'Положи ладошку на коричневую бумагу, пальцы чуть расставь. Обведи карандашом. Сделай так 4 раза.',
      tip: 'Удобно, когда обводит сосед по парте. Заодно дети учатся помогать друг другу.',
      svg: svg(hand(150, 250, { scale: 1.45, fill: '#fff' }), emoji(235, 85, '✏️', 44)),
    },
    {
      text: 'Вырежи ладошки по контуру.',
      tip: 'Между пальцами можно не вырезать точно, хватит уголка.',
      svg: svg(hand(150, 250, { scale: 1.45 }), emoji(240, 240, '✂️', 44)),
    },
    {
      text: 'Из бежевой бумаги вырежи туловище-капельку с острым носиком.',
      svg: svg(path('M262 162 C235 112 100 100 82 152 C70 198 215 210 262 162 Z', { fill: BODY })),
    },
    {
      text: 'Приклей ладошки на картон веером, пальцами наружу. Это иголки!',
      svg: svg(fan(4)),
    },
    {
      text: 'Сверху приклей туловище. Нарисуй глазик, носик и ротик.',
      svg: svg(fan(4), body, face),
    },
    {
      text: 'Добавь на иголки яблочко, грибок или листик. Ёжик готов!',
      svg: finished,
    },
  ],
  teacherTips: [
    'Ладошки разных оттенков коричневого делают ёжика «пушистее».',
    'Шаблон-капельку для туловища лучше заготовить заранее: младшим детям его трудно нарисовать.',
  ],
  variations: [
    'Из ладошек получаются и другие звери: павлин (разноцветные ладошки веером) или солнышко (жёлтые ладошки по кругу).',
    'Семья ежей: большие ладошки взрослого и маленькие ладошки ребёнка.',
  ],
}
