import RendogRare from '../cards/hermits/rendog-rare'
import ZombieCleoRare from '../cards/hermits/zombiecleo-rare'
import {afterAttack} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const MasterOfPuppets: Achievement = {
	...achievement,
	numericId: 47,
	id: 'master-of-puppets',
	levels: [
		{
			name: 'Master of Puppets',
			description:
				"Use both Rendog and Cleo to mimic a Hermit's attack.",
			steps: 1,
		},
	],
	onGameStart(game, player, component, observer) {
		let attacksUsedThisTurn = new Set()

		observer.subscribe(player.hooks.onTurnStart, () => {
			attacksUsedThisTurn = new Set()
		})

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.ACHIEVEMENTS,
			(attack) => {
				if (attack.player.entity !== player.entity) return
				if (attack.type !== 'primary') return

				if (
					attack.attacker &&
					[RendogRare.id, ZombieCleoRare.id].includes(attack.attacker?.props.id)
				) {
					return
				}

				attacksUsedThisTurn.add(attack.attacker?.props.id)

				if (attacksUsedThisTurn.size == 2) {
					component.incrementGoalProgress({goal: 0})
				}
			},
		)
	},
}

export default MasterOfPuppets
