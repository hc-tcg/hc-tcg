import {CardComponent} from '../components'
import query from '../components/query'
import {achievement} from './defaults'
import {Achievement} from './types'

const Inneffective: Achievement = {
	...achievement,
	numericId: 16,
	id: 'inneffective',
	progressionMethod: 'sum',
	levels: [
		{
			name: 'Inneffective',
			description:
				'Win 10 games without having single use effect cards in your deck.',
			steps: 10,
		},
	],
	onGameStart(game, player, component, observer) {
		let deckHasBannedCards = game.components.exists(
			CardComponent,
			query.card.player(player.entity),
			(_game, card) => card.props.category === 'single_use',
		)
		if (deckHasBannedCards) return

		observer.subscribe(game.hooks.onGameEnd, (outcome) => {
			if (outcome.type === 'player-won' && outcome.winner === player.entity) {
				component.updateGoalProgress({goal: 0})
			}
		})
	},
}

export default Inneffective
