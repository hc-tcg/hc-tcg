import {STARTER_DECKS} from '../cards/starter-decks'
import {achievement} from './defaults'
import {Achievement} from './types'

const STARTER_DECK_IDS = STARTER_DECKS.map((deck) =>
	deck.cards.map((card) => card.id),
)

const Designer: Achievement = {
	...achievement,
	numericId: 24,
	id: 'designer',
	levels: [
		{
			name: 'Hermits and Crafting',
			description: "Win a game using a deck that isn't a starter deck.",
			steps: 1,
		},
	],
	onGameEnd(game, playerEntity, component, outcome) {
		const player = game.components.get(playerEntity)
		if (!player) return
		if (outcome.type !== 'player-won') return
		if (outcome.winner !== playerEntity) return

		if (
			STARTER_DECK_IDS.includes(player.getDeck().map((card) => card.props.id))
		)
			return
		component.incrementGoalProgress({goal: 0})
	},
}

export default Designer
