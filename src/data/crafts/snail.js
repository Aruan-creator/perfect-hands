import { svg, sausage, circle, eye, path, arrow } from '../../diagrams/kit.js'

const SHELL = '#ffb74d'
const BODY = '#81c784'

// Спираль-домик: колбаска, свёрнутая в улитку
function spiral(cx, cy, turns = 2.4, r0 = 6, r1 = 62) {
  const end = turns * 2 * Math.PI
  const steps = 120
  let d = ''
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * end
    const r = r0 + ((r1 - r0) * t) / end
    const x = cx + r * Math.cos(t)
    const y = cy + r * Math.sin(t)
    d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
  }
  return d
}

const bodyPath = 'M50 232 L212 232 Q244 232 244 196'
const horns =
  path('M236 182 L226 150', { width: 6 }) +
  path('M250 182 L262 152', { width: 6 }) +
  eye(225, 146, 9) +
  eye(263, 148, 9)
const smile = path('M234 206 Q242 214 252 206', { width: 2.5 })

const finished = svg(sausage(bodyPath, BODY, 32), sausage(spiral(140, 165), SHELL, 21), horns, smile)

export default {
  id: 'clay-snail',
  title: 'Улитка из пластилина',
  technique: 'clay',
  difficulty: 1,
  age: '6+',
  time: '20 минут',
  description: 'Лепка из «колбасок» отлично развивает мелкую моторику. Улитка получается даже у тех, кто лепит впервые.',
  materials: ['Пластилин двух цветов (для домика и тела)', 'Дощечка для лепки', 'Стека (по желанию)'],
  cover: finished,
  steps: [
    {
      text: 'Разомни кусочек пластилина для домика и раскатай ладонями длинную колбаску.',
      tip: 'Тёплый пластилин слушается лучше. Пусть дети сначала погреют его в руках.',
      svg: svg(sausage('M40 150 L260 150', SHELL, 22), arrow(90, 95, 210, 95, { bend: 0, width: 3.5 }), arrow(210, 205, 90, 205, { bend: 0, width: 3.5 })),
    },
    {
      text: 'Начни с одного конца и сверни колбаску в тугую спираль.',
      svg: svg(sausage(spiral(150, 150), SHELL, 21), arrow(235, 110, 200, 60, { bend: 0.3, width: 3.5 })),
    },
    {
      text: 'Из другого цвета раскатай колбаску потолще — это тело. Один конец загни вверх — получится голова.',
      svg: svg(sausage(bodyPath, BODY, 32), arrow(270, 240, 270, 190, { bend: 0.3, width: 3.5 })),
    },
    {
      text: 'Посади домик на спинку улитки и слегка прижми.',
      svg: svg(sausage(bodyPath, BODY, 32), sausage(spiral(140, 135), SHELL, 21), arrow(60, 110, 60, 175, { bend: 0, width: 3.5 })),
    },
    {
      text: 'Скатай две тонкие колбаски-рожки и два шарика-глазика. Прилепи их на голову. Улитка готова!',
      svg: finished,
    },
  ],
  teacherTips: [
    'Если колбаска рвётся при сворачивании, она слишком тонкая или холодная. Скатайте её потолще.',
    'Домик можно скрутить из двух колбасок разного цвета, сложенных вместе, получится полосатая спираль.',
  ],
  variations: [
    'Сделайте «семью улиток» разного размера.',
    'Слепите улитку на листе картона и добавьте травку и цветочки из пластилина. Получится пластилинография.',
  ],
}
