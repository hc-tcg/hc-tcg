import assert from 'assert'
import ArmorStand from '../cards/attach/armor-stand'
import {onTurnEnd} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const CertifiedZombie: Achievement = {
	...achievement,
	id: 'certified_zombie',
	numericId: 18,
	levels: [
		{
			name: 'Certified Zombie',
			description:
				'Survive with an armor stand as your active hermit for three rounds.',
			steps: 3,
		},
	],
	icon: 'certified_zombie',
	onGameStart(game, playerEntity, component, observer) {
		let player = game.components.get(playerEntity)
		assert(player, 'Player should be in the ECS')

		let rounds = 0

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				if (player.getActiveHermit()?.props.id === ArmorStand.id) {
					rounds += 1
					component.bestGoalProgress({goal: 0, progress: rounds})
				} else {
					rounds = 0
				}
			},
		)
	},
}

export default CertifiedZombie
