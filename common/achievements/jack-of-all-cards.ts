import {CARDS_LIST} from '../cards'
import {achievement} from './defaults'
import {Achievement} from './types'

const defaultCards = CARDS_LIST.filter((card) => card.expansion === 'default')
defaultCards.sort((cardA, cardB) => cardA.numericId - cardB.numericId)

const AllCards: Achievement = {
	...achievement,
	id: 'all_cards',
	numericId: 0,
	name: 'Jack of all cards',
	description: 'Play every original card',
	steps: defaultCards.length,
	goals: defaultCards.length,
	onGameStart(component, observer) {
		const {game} = component
		const playerComponent = game.components.get(component.player)
		if (!playerComponent) return

		observer.subscribe(playerComponent.hooks.onAttach, (card) => {
			const position = defaultCards.indexOf(card.props)
			component.goals[position] += 1
		})
	},
}

export default AllCards
