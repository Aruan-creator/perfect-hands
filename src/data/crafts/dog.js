import { svg, box, poly, valley, arrow, dot, eye, path, intersect, reflect, WHITE_SIDE } from '../../diagrams/kit.js'

const COLOR = '#e89a4f'
const FLAP = '#c97a35'

// Треугольник длинной стороной вверх
const L = [40, 95]
const R = [260, 95]
const B = [150, 205]

// Ушки: линия сгиба идёт под углом 35° от верхнего края
const angle = (35 * Math.PI) / 180
const A = [105, 95]
const AL = intersect(A, [A[0] - Math.cos(angle), A[1] + Math.sin(angle)], L, B)
const earL = reflect(L, A, AL)
const Ar = [300 - A[0], A[1]]
const AR = [300 - AL[0], AL[1]]
const earR = [300 - earL[0], earL[1]]

// Носик: загибаем нижний уголок по линии y = 180
const noseY = 176
const NL = [L[0] + (noseY - L[1]), noseY]
const NR = [300 - NL[0], noseY]
const noseTip = reflect(B, NL, NR)

const head = (withNose) =>
  withNose
    ? poly([A, Ar, AR, NR, NL, AL], COLOR) + poly([NL, NR, noseTip], FLAP)
    : poly([A, Ar, AR, B, AL], COLOR)

const ears = poly([A, AL, earL], FLAP) + poly([Ar, AR, earR], FLAP)

const face =
  eye(124, 118, 10) +
  eye(176, 118, 10) +
  `<ellipse cx="150" cy="${noseTip[1] + 8}" rx="10" ry="7" fill="#3a2a20"/>` +
  path(`M138 ${noseTip[1] + 18} Q144 ${noseTip[1] + 24} 150 ${noseTip[1] + 17} Q156 ${noseTip[1] + 24} 162 ${noseTip[1] + 18}`, { width: 2.5 })

const Z = '35 20 230 230'
const finished = box(Z, head(true), ears, face)

export default {
  id: 'origami-dog',
  title: 'Собачка',
  technique: 'origami',
  difficulty: 1,
  age: '6+',
  time: '10–15 минут',
  description: 'Самая простая модель оригами: всего три сгиба. Идеальна для первого занятия.',
  materials: ['Квадрат цветной бумаги 15×15 см', 'Фломастер или чёрная ручка'],
  cover: finished,
  steps: [
    {
      text: 'Положи квадрат белой стороной вверх, уголком к себе. Сложи пополам: верхний уголок к нижнему.',
      tip: 'Уголки должны совпасть точно. Сгиб хорошо прогладь ногтем.',
      svg: svg(poly([[150, 40], [260, 150], [150, 260], [40, 150]], WHITE_SIDE), valley(40, 150, 260, 150), arrow(150, 48, 150, 250, { bend: -0.3 })),
    },
    {
      text: 'Получился треугольник. Загни левый и правый уголки вниз — это ушки.',
      tip: 'Пусть кончики ушек чуть-чуть выглядывают за край мордочки.',
      svg: box(
        Z,
        poly([L, R, B], COLOR),
        valley(...A, ...AL),
        valley(...Ar, ...AR),
        arrow(L[0] + 4, L[1] + 4, earL[0] - 4, earL[1] - 2, { bend: 0.3 }),
        arrow(R[0] - 4, R[1] + 4, earR[0] + 4, earR[1] - 2, { bend: -0.3 }),
      ),
    },
    {
      text: 'Загни нижний уголок вверх — получится носик.',
      svg: box(Z, head(false), ears, valley(...NL, ...NR), arrow(B[0] + 3, B[1] - 3, noseTip[0] + 3, noseTip[1] + 3, { bend: 0.7 })),
    },
    {
      text: 'Нарисуй фломастером глазки, носик и ротик. Собачка готова!',
      svg: finished,
    },
  ],
  teacherTips: [
    'Покажите сгиб на большом листе (например, А4, обрезанном до квадрата) — детям так виднее.',
    'Если у ребёнка уголки «разъехались», ничего страшного: у каждой собачки свой характер.',
    'Сделайте заранее одну готовую собачку и покажите её в начале занятия.',
  ],
  variations: [
    'Сложите собачек разных цветов и устройте «выставку пород» с придуманными именами.',
    'Наклейте собачку на картон и дорисуйте туловище — получится открытка.',
    'Попросите детей придумать, о чём думает их собачка, и подписать это «облачком».',
  ],
}
