import { svg, box, poly, valley, arrow, intersect, reflect, emoji, WHITE_SIDE } from '../../diagrams/kit.js'

const COLOR = '#ef5d8a'
const FLAP = '#d43d6c'
const GREEN = '#5cb85c'
const GREEN_DARK = '#3f8f3f'

const A = [40, 200]
const B = [260, 200]
const C = [150, 90]
const M = [150, 200]

// Уголок загибаем по линии из середины нижней стороны под углом 40°
const angle = (40 * Math.PI) / 180
const G = intersect(M, [M[0] - Math.cos(angle), M[1] - Math.sin(angle)], A, C)
const tipL = reflect(A, M, G)
const G2 = [300 - G[0], G[1]]
const tipR = [300 - tipL[0], tipL[1]]

const Z = '25 30 250 250'

const flower = poly([G, C, G2, M], COLOR) + poly([M, G, tipL], FLAP) + poly([M, G2, tipR], FLAP)

const leaf = (cx, cy, rot) =>
  `<path d="M${cx - 38} ${cy} Q${cx} ${cy - 22} ${cx + 38} ${cy} Q${cx} ${cy + 22} ${cx - 38} ${cy} Z" fill="${GREEN}" stroke="#2f4f2f" stroke-width="2.5" transform="rotate(${rot} ${cx} ${cy})"/>`

const stem = `<rect x="144" y="140" width="12" height="140" rx="4" fill="${GREEN_DARK}" stroke="#2f4f2f" stroke-width="2.5"/>`

const finished = svg(stem, leaf(118, 228, -30), leaf(182, 248, 30), `<g transform="translate(37.5 -10) scale(0.75)">${flower}</g>`)

export default {
  id: 'origami-tulip',
  title: 'Тюльпан',
  technique: 'origami',
  difficulty: 1,
  age: '6+',
  time: '20 минут',
  description: 'Нежный цветок для открытки к 8 Марта или Дню матери. Бутон складывается из квадрата, стебель вырезается из полоски.',
  materials: ['Квадрат розовой или красной бумаги 15×15 см', 'Зелёная бумага для стебля и листиков', 'Ножницы', 'Клей-карандаш', 'Картон для открытки (по желанию)'],
  cover: finished,
  steps: [
    {
      text: 'Положи квадрат белой стороной вверх, уголком к себе. Сложи пополам: нижний уголок к верхнему.',
      svg: svg(poly([[150, 40], [260, 150], [150, 260], [40, 150]], WHITE_SIDE), valley(40, 150, 260, 150), arrow(150, 252, 150, 50, { bend: -0.3 })),
    },
    {
      text: 'Левый уголок загни вверх так, чтобы его кончик чуть выглядывал слева от верхушки.',
      tip: 'Сгиб начинается точно от середины нижней стороны.',
      svg: box(Z, poly([A, B, C], COLOR), valley(...M, ...G), arrow(A[0] + 4, A[1] - 4, tipL[0] - 2, tipL[1] + 4, { bend: -0.3 })),
    },
    {
      text: 'Так же загни правый уголок вверх. Получился бутон!',
      svg: box(Z, poly([G, C, B, M], COLOR), poly([M, G, tipL], FLAP), valley(...M, ...G2), arrow(B[0] - 4, B[1] - 4, tipR[0] + 2, tipR[1] + 4, { bend: 0.3 })),
    },
    {
      text: 'Из зелёной бумаги вырежи полоску-стебелёк и два листика.',
      tip: 'Листик легко вырезать, если сложить бумагу пополам и вырезать «половинку капельки».',
      svg: svg(`<rect x="60" y="60" width="16" height="190" rx="4" fill="${GREEN_DARK}" stroke="#2f4f2f" stroke-width="2.5"/>`, leaf(180, 110, -20), leaf(190, 200, 20), emoji(115, 160, '✂️', 44)),
    },
    {
      text: 'Приклей стебелёк, листики и бутон на картон. Тюльпан готов!',
      svg: finished,
    },
  ],
  teacherTips: [
    'Бутон можно сложить заранее вместе, а стебли и листики дети вырезают сами: так удобно разделить занятие на две части.',
    'Если делаете открытку, приклеивайте сначала стебель, а бутон в самом конце, поверх стебля.',
  ],
  variations: [
    'Букет: три-пять тюльпанов разных цветов на одной открытке.',
    'Приклейте бутон на трубочку для коктейля вместо бумажного стебля, получится цветок «в вазу».',
    'Коллективная работа: каждый делает один тюльпан, и все вместе собирают «весеннюю поляну» на ватмане.',
  ],
}
