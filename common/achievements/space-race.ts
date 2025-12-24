import RenbobRare from '../cards/hermits/renbob-rare'
import {CardEntity, StatusEffectEntity} from '../entities'
import {afterAttack} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const SpaceRace: Achievement = {
	...achievement,
	numericId: 70,
	id: 'space-race',
	progressionMethod: 'best',
	levels: [
		{
			name: 'Space Race',
			description: 'Knockout 2 Hermits using the same Renbob Rare card',
			steps: 2,
		},
	],
	onGameStart(game, player, component, observer) {
		const kos: Record<
			CardEntity | StatusEffectEntity, // We will only track renbob, but for type safety...
			number
		> = {}

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.ACHIEVEMENTS,
			(attack) => {
				if (attack.player.entity !== player.entity) return
				if (!['secondary', 'primary'].includes(attack.type)) return
				if (!attack.target) return
				let targetHermit = attack.target?.getHermit()
				if (!targetHermit) return
				if (!targetHermit.isHermit()) return // Should this also include berry bush, armor stand etc.?

				const attacker = attack.attacker
				if (!attacker) return
				if (attacker.props !== RenbobRare) return

				if (attack.target.health) return

				if (!kos[attacker.entity]) {
					kos[attacker.entity] = 0
				}
				kos[attacker.entity] += 1
				component.updateGoalProgress({goal: 0, progress: kos[attacker.entity]})
			},
		)
	},
}

export default SpaceRace
