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
	name: 'Designer',
	icon: '',
	description: "Use a deck that isn't a starter deck in a game.",
	steps: 1,
	onGameEnd(game, playerEntity, component) {
		const player = game.components.get(playerEntity)
		if (!player) return

		if (
			STARTER_DECK_IDS.includes(player.getDeck().map((card) => card.props.id))
		)
			return
		component.incrementGoalProgress({goal: 0})
	},
}

export default Designer
