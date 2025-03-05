import {achievement} from './defaults'
import {Achievement} from './types'

const IBuy: Achievement = {
	...achievement,
	numericId: 47,
	id: 'ibuy',
	levels: [
		{
			name: 'iBuy',
			description:
				'Chest a card, then draw the same card on at the end of your turn.',
			steps: 1,
		},
	],
	onGameStart(_game, _player, _component, _observer) {},
}

export default IBuy
