import {CARDS_LIST} from '../cards'
import {Card} from '../cards/types'
import {achievement} from './defaults'
import {Achievement} from './types'

const defaultCards = CARDS_LIST.filter((card) => card.expansion === 'default')
defaultCards.sort((cardA, cardB) => cardA.numericId - cardB.numericId)

const AllCards: Achievement = {
	...achievement,
	id: 'all_cards',
	numericId: 0,
	name: 'Jack of All Cards',
	description: 'Win a game using every card from the base set',
	steps: defaultCards.length,
	getProgress(goals) {
		return Object.values(goals).filter((goal) => goal > 0).length
	},
	icon: 'old_menu',
	onGameStart(game, playerEntity, component, observer) {
		const player = game.components.get(playerEntity)
		if (!player) return

		const playedCards: Set<Card['numericId']> = new Set()

		observer.subscribe(player.hooks.onAttach, (card) => {
			if (card.props.expansion !== 'default') return
			playedCards.add(card.props.numericId)
		})

		observer.subscribe(game.hooks.onGameEnd, (outcome) => {
			if (outcome.type !== 'player-won' || outcome.winner !== playerEntity)
				return
			for (const card of playedCards.values()) {
				component.bestGoalProgress({goal: card, progress: 1})
			}
		})
	},
}

export default AllCards
