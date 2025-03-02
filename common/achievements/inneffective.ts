import {achievement} from './defaults'
import {Achievement} from './types'

const Inneffective: Achievement = {
	...achievement,
	numericId: 16,
	id: 'inneffective',
	levels: [
		{
			name: 'Inneffective',
			description:
				'Win 10 games without having single use effect cards in your deck.',
			steps: 10,
		},
	],
	onGameStart(game, player, component, observer) {
		let deckHasBannedCards = false

		for (const card of player.getDeck()) {
			if (card.props.category.includes('single_use')) {
				deckHasBannedCards = true
			}
		}

		observer.subscribe(game.hooks.onGameEnd, (outcome) => {
			if (deckHasBannedCards) return
			if (outcome.type === 'player-won' && outcome.winner === player.entity) {
				component.incrementGoalProgress({goal: 0})
			}
		})
	},
}

export default Inneffective
