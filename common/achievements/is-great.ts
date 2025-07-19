import {CardComponent} from '../components'
import query from '../components/query'
import {achievement} from './defaults'
import {Achievement} from './types'

const IsGreat: Achievement = {
	...achievement,
	numericId: 45,
	id: 'is_great',
	progressionMethod: 'sum',
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
			game.components.find(
				CardComponent,
				query.card.player(player.entity),
				(_game, x) => x.isHermit() && x.props.secondary.cost.length === 2,
			) == undefined

		if (!validDeck) {
			return
		}

		observer.subscribe(game.hooks.onGameEnd, (outcome) => {
			if (outcome.type !== 'player-won' || outcome.winner !== player.entity)
				return
			component.updateGoalProgress({goal: 0})
		})
	},
}

export default IsGreat
