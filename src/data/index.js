import dog from './crafts/dog.js'
import cup from './crafts/cup.js'
import tulip from './crafts/tulip.js'
import whale from './crafts/whale.js'
import lantern from './crafts/lantern.js'
import hedgehog from './crafts/hedgehog.js'
import snail from './crafts/snail.js'
import tank from './crafts/tank.js'

export const techniques = {
  origami: { name: 'Оригами', icon: '🦢', color: '#4d9de0' },
  applique: { name: 'Аппликация', icon: '✂️', color: '#8d5a3b' },
  paper: { name: 'Бумагопластика', icon: '🏮', color: '#e84a5f' },
  clay: { name: 'Лепка', icon: '🐌', color: '#5cb85c' },
}

export const difficulties = {
  1: 'Легко',
  2: 'Средне',
  3: 'Сложно',
}

export const crafts = [dog, cup, tulip, whale, lantern, hedgehog, snail, tank]

export function getCraft(id) {
  return crafts.find((c) => c.id === id)
}
