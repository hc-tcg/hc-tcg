import {CardComponent} from '../components'
import {afterAttack} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const Untouchable: Achievement = {
	...achievement,
	numericId: 11,
	id: 'untouchabble',
	name: 'Untouchable',
	icon: '',
	description: 'Take 0 damage from 3 consecutive opponent attacks',
	steps: 3,
	onGameStart(game, playerEntity, component, observer) {
		const player = game.components.get(playerEntity)
		if (!player) return

		let missedAttacks = 0

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.ACHIEVEMENTS,
			(attack) => {
				if (!(attack.attacker instanceof CardComponent)) return
				if (attack.attacker.player !== player.opponentPlayer) return
				if (attack.target?.player !== player) return
				if (attack.calculateDamage() > 0) {
					missedAttacks = 0
				}
				missedAttacks += 1
				component.bestGoalProgress({goal: 0, progress: missedAttacks})
			},
		)
	},
}

export default Untouchable
