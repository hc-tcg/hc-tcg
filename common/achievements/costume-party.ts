import {CardComponent} from '../components'
import query from '../components/query'
import {achievement} from './defaults'
import {Achievement} from './types'

const CostumeParty: Achievement = {
	...achievement,
	numericId: 62,
	id: 'costume-party',
	progressionMethod: 'sum',
	levels: [
		{
			name: 'Costume Party',
			description:
				'Win 5 games using only cards from the alter egos expansions.',
			steps: 5,
		},
	],
	onGameStart(game, player, component, observer) {
		const playerDeck = game.components
			.filter(CardComponent, query.card.player(player.entity))
			.map((card) => card.props.expansion)

		const allAlter = playerDeck.every((expansion) =>
			['alter_egos', 'alter_egos_ii', 'alter_egos_iii'].includes(expansion),
		)

		if (!allAlter) return

		observer.subscribe(game.hooks.onGameEnd, (outcome) => {
			if (outcome.type !== 'player-won') return
			if (outcome.winner !== player.entity) return
			component.updateGoalProgress({goal: 0})
		})
	},
}

export default CostumeParty
