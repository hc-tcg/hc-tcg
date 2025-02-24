import {CardEntity} from '../entities'
import {afterAttack} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const British: Achievement = {
	...achievement,
	numericId: 8,
	id: 'british',
	levels: [
		{
			name: "Bri'ish",
			description:
				"Use both Xisuma's Cup of Tea and Spooky Stress' Wa'a against the same Hermit",
			steps: 1,
		},
	],
	onGameStart(game, playerEntity, component, observer) {
		const player = game.components.get(playerEntity)
		if (!player) return

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
				const attackerId = attack.attacker?.props.id
				if (
					attackerId !== 'xisumavoid_rare' &&
					attackerId !== 'spookystress_rare'
				)
					return

				if (!attackedHermits[targetHermit.entity]) {
					attackedHermits[targetHermit.entity] = attackerId
					return
				} else if (attackedHermits[targetHermit.entity] === 'both') {
					return
				}

				component.incrementGoalProgress({goal: 0})
				attackedHermits[targetHermit.entity] = 'both'
			},
		)
	},
}

export default British
