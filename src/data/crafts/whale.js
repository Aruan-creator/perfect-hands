import { svg, box, poly, valley, mountain, crease, arrow, intersect, reflect, eye, path, WHITE_SIDE } from '../../diagrams/kit.js'

const COLOR = '#5b8fd9'
const FLAP = '#3f6fb8'
const WATER = '#4fc3f7'

const L = [40, 150]
const T = [150, 40]
const R = [260, 150]
const Bt = [150, 260]

// «Воздушный змей»: стороны у левого уголка кладём на среднюю линию
const a = (22.5 * Math.PI) / 180
const P1 = intersect(L, [L[0] + Math.cos(a), L[1] - Math.sin(a)], T, R)
const P2 = [P1[0], 300 - P1[1]]
const T2 = reflect(T, L, P1)
const R2 = reflect(R, P1, P2)

// Хвостик
const Q1 = [100, 150]
const Q2 = intersect(Q1, [Q1[0] - 0.5, Q1[1] - 0.866], L, P1)
const tail = reflect(L, Q1, Q2)

const kite = poly([L, P1, R, P2], WHITE_SIDE) + poly([L, P1, T2], COLOR) + poly([L, P2, T2], COLOR)
const headTop = poly([P1, T2, R2], FLAP)

const Z = '20 25 220 220'

const fountain =
  path(`M182 82 Q170 50 140 52`, { stroke: WATER, width: 5 }) +
  path(`M184 80 Q186 44 205 40`, { stroke: WATER, width: 5 }) +
  path(`M186 82 Q205 58 228 66`, { stroke: WATER, width: 5 })

const finished = box(
  Z,
  `<path d="M30 175 Q60 162 90 175 T150 175 T210 175 T270 175" fill="none" stroke="${WATER}" stroke-width="4" stroke-linecap="round"/>`,
  poly([Q2, P1, T2, Q1], COLOR),
  headTop,
  poly([Q1, Q2, tail], FLAP),
  eye(168, 128, 8),
  path('M155 142 Q168 150 180 141', { width: 2.5 }),
  fountain,
)

export default {
  id: 'origami-whale',
  title: 'Кит',
  technique: 'origami',
  difficulty: 2,
  age: '7+',
  time: '20 минут',
  description: 'Знакомство с базовой формой «воздушный змей», из которой потом складываются многие другие модели.',
  materials: ['Квадрат синей или голубой бумаги 15×15 см', 'Фломастер'],
  cover: finished,
  steps: [
    {
      text: 'Положи квадрат белой стороной вверх, уголком к себе. Сложи пополам, верхний уголок к нижнему, и разверни обратно.',
      tip: 'Получится линия посередине, она понадобится в следующем шаге.',
      svg: svg(poly([L, T, R, Bt], WHITE_SIDE), valley(...L, ...R), arrow(150, 48, 150, 250, { bend: -0.3 }), arrow(150, 250, 150, 48, { bend: -0.3, dash: '6 6', width: 3 })),
    },
    {
      text: 'Загни верхнюю и нижнюю стороны к средней линии. Сгибы начинаются от левого уголка.',
      tip: 'Эта фигура называется «воздушный змей». Её стоит запомнить!',
      svg: svg(poly([L, T, R, Bt], WHITE_SIDE), crease(...L, ...R), valley(...L, ...P1), valley(...L, ...P2), arrow(T[0] - 4, T[1] + 6, T2[0] - 10, T2[1] - 10, { bend: 0.3 }), arrow(Bt[0] - 4, Bt[1] - 6, T2[0] - 10, T2[1] + 10, { bend: -0.3 })),
    },
    {
      text: 'Правый уголок загни влево, по линии, где заканчиваются клапаны.',
      svg: svg(kite, valley(...P1, ...P2), arrow(R[0] - 4, R[1] - 4, R2[0] + 6, R2[1] - 6, { bend: 0.4 })),
    },
    {
      text: 'Сложи фигуру пополам: нижнюю половину отогни назад, от себя.',
      svg: svg(kite, poly([P1, P2, R2], FLAP), mountain(L[0] - 8, L[1], P1[0] + 8, L[1]), arrow(120, 222, 120, 162, { bend: 0.5, dash: '8 6' })),
    },
    {
      text: 'Отогни хвостик вверх.',
      tip: 'Чем ближе к краю сгиб, тем меньше хвостик. Пусть дети попробуют разные варианты.',
      svg: box(Z, poly([L, P1, T2], COLOR), headTop, valley(...Q1, ...Q2), arrow(L[0] + 4, L[1] - 4, tail[0] - 2, tail[1] + 4, { bend: -0.5 })),
    },
    {
      text: 'Нарисуй глазик и улыбку, а сверху фонтанчик. Кит готов!',
      svg: finished,
    },
  ],
  teacherTips: [
    'Шаг 4 («отогнуть назад») дети часто путают со сгибом к себе. Покажите медленно, держа фигуру к ним лицом.',
    'Если хвостик не держится, можно капнуть клея.',
  ],
  variations: [
    'Морская поляна: наклейте китов на голубой картон и дорисуйте волны, рыбок, водоросли.',
    'Сложите большого кита-маму из листа 20×20 см и маленького кита-малыша из 10×10 см.',
  ],
}
