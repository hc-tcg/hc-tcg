import Feather from '../cards/advent-of-tcg/single-use/feather'
import {STARTER_DECKS} from '../cards/starter-decks'
import {CardComponent} from '../components'
import query from '../components/query'
import {achievement} from './defaults'
import {Achievement} from './types'

const STARTER_DECK_IDS = STARTER_DECKS.map((deck) =>
	deck.cards.map((card) => card.id).sort(),
)

const HermitsAndCrafting: Achievement = {
	...achievement,
	numericId: 25,
	id: 'designer',
	progressionMethod: 'sum',
	levels: [
		{
			name: 'Hermits and Crafting',
			description: "Win a game using a deck that isn't a starter deck.",
			steps: 1,
		},
	],
	onGameStart(game, player, component, observer) {
		const equippedDeckIds = game.components
			.filter(
				CardComponent,
				query.card.player(player.entity),
				query.not(query.card.is(Feather)),
			)
			.map((card) => card.props.id)
			.sort()

		if (
			STARTER_DECK_IDS.some(
				(starterIds) =>
					starterIds.length === equippedDeckIds.length &&
					starterIds.every((id, index) => id === equippedDeckIds[index]),
			)
		)
			return

		observer.subscribe(game.hooks.onGameEnd, (outcome) => {
			if (outcome.type !== 'player-won') return
			if (outcome.winner !== player.entity) return
			component.updateGoalProgress({goal: 0})
		})
	},
}

export default HermitsAndCrafting
