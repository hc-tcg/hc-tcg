import RendogRare from '../cards/hermits/rendog-rare'
import ZombieCleoRare from '../cards/hermits/zombiecleo-rare'
import {achievement} from './defaults'
import {Achievement} from './types'

const MasterOfPuppets: Achievement = {
	...achievement,
	numericId: 47,
	id: 'master-of-puppets',
	levels: [
		{
			name: 'Master of Puppets',
			description: "Use both Rendog and Cleo to mimic a Hermit's attack.",
			steps: 1,
		},
	],
	onGameStart(game, player, component, observer) {
		let attacksUsedThisTurn = 0

		observer.subscribe(player.hooks.onTurnStart, () => {
			attacksUsedThisTurn = 0
		})

		observer.subscribe(game.hooks.onPickRequestResolve, (request, _slot) => {
			if (request.player !== player.entity) return

			let requester = game.components.get(request.id)
			console.log(requester?.props.id)

			if (
				requester?.props.id !== RendogRare.id &&
				requester?.props.id !== ZombieCleoRare.id
			)
				return

			attacksUsedThisTurn += 1

			if (attacksUsedThisTurn === 2) {
				component.incrementGoalProgress({goal: 0})
			}
		})
	},
}

export default MasterOfPuppets
