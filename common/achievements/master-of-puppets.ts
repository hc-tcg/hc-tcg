import {achievement} from './defaults'
import {Achievement} from './types'

const MasterOfPuppets: Achievement = {
	...achievement,
	numericId: 47,
	id: 'master-of-puppets',
	progressionMethod: 'sum',
	levels: [
		{
			name: 'Master of Puppets',
			description: "Use both Rendog and Cleo to mimic a Hermit's attack.",
			steps: 1,
		},
	],
	onGameStart(game, player, component, observer) {
		let mimicryHermitsUsed: 'Rendog' | 'Cleo' | 'both' | null = null

		observer.subscribe(player.hooks.getAttackRequests, () => {
			mimicryHermitsUsed = null
		})

		observer.subscribe(game.hooks.onModalRequestResolve, (request, _result) => {
			if (request.player !== player.entity) return
			if (request.modal.type !== 'copyAttack') return

			const requester = request.modal.name.split(':')[0]

			if (requester !== 'Rendog' && requester !== 'Cleo') return

			if (mimicryHermitsUsed === null) {
				mimicryHermitsUsed = requester
				return
			} else if (
				mimicryHermitsUsed === 'both' ||
				mimicryHermitsUsed === requester
			) {
				return
			}
			mimicryHermitsUsed = 'both'
		})

		observer.subscribe(player.hooks.getAttack, () => {
			if (mimicryHermitsUsed === 'both') component.updateGoalProgress({goal: 0})

			mimicryHermitsUsed = null
			return null
		})
	},
}

export default MasterOfPuppets
