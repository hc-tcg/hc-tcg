import {achievement} from './defaults'
import {Achievement} from './types'

const TerribleTrades: Achievement = {
	...achievement,
	numericId: 49,
	id: 'terrible-trades',
	levels: [
		{
			name: 'Terrible Trades',
			description:
				'Win 5 games without using a deck that includes cards worth 3 tokens or more.',
			steps: 5,
		},
	],
	onGameStart(game, player, component, observer) {
		let deckHasBannedCards = false

		for (const card of player.getDeck()) {
			if (typeof card.props.tokens === 'number' && card.props.tokens >= 3) {
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

export default TerribleTrades
