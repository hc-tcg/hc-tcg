import Trident from '../cards/single-use/trident'
import {CardEntity} from '../entities'
import {afterAttack} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const LoyaltyIII: Achievement = {
	...achievement,
	numericId: 23,
	id: 'loyalty-iii',
	progressionMethod: 'best',
	levels: [
		{
			name: 'Loyalty III',
			description: 'Use the same Trident card three times in a row.',
			steps: 3,
		},
	],
	onGameStart(game, player, component, observer) {
		let lastTrident: CardEntity | null = null
		let steps = 0
		let usedTridentThisTurn = false

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (!usedTridentThisTurn) {
				steps = 0
			}

			usedTridentThisTurn = false
		})

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.ACHIEVEMENTS,
			(attack) => {
				if (attack.player.entity !== player.entity) return
				if (attack.attacker?.props.id !== Trident.id) {
					return
				}
				usedTridentThisTurn = true

				if (lastTrident === attack.attackerEntity) {
					steps += 1
				} else {
					lastTrident = attack.attackerEntity as CardEntity | null
					steps = 1
				}

				component.updateGoalProgress({goal: 0, progress: steps})
			},
		)
	},
}

export default LoyaltyIII
