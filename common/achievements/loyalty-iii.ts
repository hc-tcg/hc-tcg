import assert from 'assert'
import Trident from '../cards/single-use/trident'
import {CardEntity} from '../entities'
import {afterAttack} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const LoyaltyIII: Achievement = {
	...achievement,
	numericId: 26,
	id: 'loyalty-iii',
	levels: [
		{
			name: 'Loyalty III',
			description: 'Use the same Trident card three times in a row.',
			steps: 3,
		},
	],
	icon: '',
	onGameStart(game, playerEntity, component, observer) {
		let player = game.components.get(playerEntity)
		assert(player)
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
				if (attack.player.entity !== playerEntity) return
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

				component.bestGoalProgress({goal: 0, progress: steps})
			},
		)
	},
}

export default LoyaltyIII
