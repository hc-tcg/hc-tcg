import {CARDS_LIST} from '../cards'
import {EXPANSIONS} from '../const/expansions'
import {achievement} from './defaults'
import {Achievement} from './types'

const permenantCardCount = CARDS_LIST.filter(
	(card) =>
		EXPANSIONS[card.expansion].disabled === false &&
		[
			'default',
			'alter_egos',
			'alter_egos_ii',
			'season_x',
			'alter_egos_iii',
		].includes(card.expansion),
).length

const AllCards: Achievement = {
	...achievement,
	id: 'all_cards',
	numericId: 0,
	name: 'Jack of all cards',
	description: 'Play every permenant card',
	steps: permenantCardCount,
	bytes: Math.ceil(permenantCardCount / 8),
	onGameStart(game, component, player, observer) {
		const playerComponent = game.components.get(player)
		if (!playerComponent) return

		observer.subscribe(playerComponent.hooks.onAttach, (card) => {
			const byte = Math.floor(card.props.numericId / 8)
			const bit = card.props.numericId % 8
			component.progress[byte] |= 1 << bit
		})
	},
}

export default AllCards
