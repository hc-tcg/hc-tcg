import {achievement} from './defaults'
import {Achievement} from './types'

const IsGreat: Achievement = {
	...achievement,
	numericId: 42,
	id: 'is_great',
	levels: [
		{
			name: '...is Great!',
			description:
				'Win a game with a deck that only contains 3-cost secondary Hermits.',
			steps: 1,
		},
	],
	onGameStart(game, player, component, observer) {
		const validDeck =
			player
				.getDeck()
				.find((x) => x.isHermit() && x.props.secondary.cost.length === 2) ===
			null

		if (!validDeck) {
			return
		}

		observer.subscribe(game.hooks.onGameEnd, (outcome) => {
			if (outcome.type !== 'player-won' || outcome.winner !== player.entity)
				return
			if (player.getDeck()) {
			}
			component.incrementGoalProgress({goal: 0})
		})
	},
}

export default IsGreat
