import {CardComponent} from '../components'
import {afterAttack} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const HotTake: Achievement = {
	...achievement,
	numericId: 9,
	id: 'server_lag',
	levels: [
		{
			name: 'Server Lag',
			description:
				'Deal the final blow of the game using a Hermit you got as a prize card',
			steps: 1,
		},
	],
	icon: '',
	onGameStart(game, playerEntity, component, observer) {
		const player = game.components.get(playerEntity)
		if (!player) return

		let latestAttackerPrize = false

		observer.subscribe(game.hooks.onGameEnd, () => {
			if (!latestAttackerPrize) return
			component.incrementGoalProgress({goal: 0})
		})

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.ACHIEVEMENTS,
			(attack) => {
				if (
					attack.player.entity === playerEntity &&
					attack.attacker instanceof CardComponent &&
					attack.attacker.prizeCard
				) {
					latestAttackerPrize = true
					return
				}
				latestAttackerPrize = false
			},
		)
	},
}

export default HotTake
