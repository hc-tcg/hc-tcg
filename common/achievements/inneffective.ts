import {achievement} from './defaults'
import {Achievement} from './types'

const Inneffective: Achievement = {
	...achievement,
	numericId: 16,
	id: 'inneffective',
	levels: [
		{
			name: 'Inneffective',
			description: 'Win 10 games without using single use effect cards.',
			steps: 10,
		},
	],
	onGameStart(game, player, component, observer) {
		let usedBannedCard = false

		observer.subscribe(player.hooks.onAttach, (card) => {
			if (!['single_use'].includes(card.props.category)) return
			usedBannedCard = true
		})

		observer.subscribe(game.hooks.onGameEnd, (outcome) => {
			if (usedBannedCard) return
			if (outcome.type === 'player-won' && outcome.winner === player.entity) {
				component.incrementGoalProgress({goal: 0})
			}
		})
	},
}

export default Inneffective
