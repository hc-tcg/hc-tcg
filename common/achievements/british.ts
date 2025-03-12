import {CardEntity} from '../entities'
import {afterAttack} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const British: Achievement = {
	...achievement,
	numericId: 8,
	id: 'british',
	progressionMethod: 'sum',
	levels: [
		{
			name: "Bri'ish",
			description:
				"Use both Xisuma's Cup of Tea and Spooky Stress' Wa'a against the same Hermit",
			steps: 1,
		},
	],
	onGameStart(game, player, component, observer) {
		const attackedHermits: Record<
			CardEntity,
			'xisumavoid_rare' | 'spookystress_rare' | 'both'
		> = {}

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.ACHIEVEMENTS,
			(attack) => {
				const targetHermit = attack.target?.getHermit()
				if (!targetHermit) return
				if (attack.type !== 'secondary') return
				if (attack.player.entity !== player.entity) return
				const attackerId = attack.attacker?.props.id
				if (
					attackerId !== 'xisumavoid_rare' &&
					attackerId !== 'spookystress_rare'
				)
					return

				if (!attackedHermits[targetHermit.entity]) {
					attackedHermits[targetHermit.entity] = attackerId
					observer.subscribe(targetHermit.hooks.onChangeSlot, (slot) => {
						if (slot.onBoard()) return
						delete attackedHermits[targetHermit.entity]
					})
					return
				} else if (
					attackedHermits[targetHermit.entity] === 'both' ||
					attackedHermits[targetHermit.entity] === attackerId
				) {
					return
				}

				component.updateGoalProgress({goal: 0})
				attackedHermits[targetHermit.entity] = 'both'
			},
		)
	},
}

export default British
