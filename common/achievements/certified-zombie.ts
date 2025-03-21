import ArmorStand from '../cards/attach/armor-stand'
import {onTurnEnd} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const CertifiedZombie: Achievement = {
	...achievement,
	id: 'certified_zombie',
	numericId: 18,
	progressionMethod: 'best',
	levels: [
		{
			name: 'Certified Zombie',
			description:
				'Survive with an armor stand as your active hermit for three rounds.',
			steps: 3,
		},
	],
	onGameStart(_game, player, component, observer) {
		let rounds = 0

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				if (player.getActiveHermit()?.props.id === ArmorStand.id) {
					rounds += 1
				} else {
					rounds = 0
				}
			},
		)

		observer.subscribe(player.hooks.onTurnStart, () => {
			component.updateGoalProgress({goal: 0, progress: rounds})
		})
	},
}

export default CertifiedZombie
