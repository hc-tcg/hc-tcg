import {CARDS_LIST} from '../cards'
import {CardComponent} from '../components'
import {achievement} from './defaults'
import {Achievement} from './types'

const defaultCards = CARDS_LIST.filter((card) => card.expansion === 'default')
defaultCards.sort((cardA, cardB) => cardA.numericId - cardB.numericId)

const AllCards: Achievement = {
	...achievement,
	id: 'all_cards',
	numericId: 0,
	name: 'Jack of all cards',
	description: 'Use every card from the base set',
	steps: defaultCards.length,
	onGameStart(component, observer) {
		const {game} = component
		const playerComponent = game.components.get(component.player)
		if (!playerComponent) return

		const playedCards: CardComponent[] = []

		observer.subscribe(playerComponent.hooks.onAttach, (card) => {
			if (playedCards.includes(card)) return
			playedCards.push(card)
			const position = defaultCards.indexOf(card.props)
			if (position < 0) return
			component.incrementGoalProgress(position)
		})
	},
}

export default AllCards
