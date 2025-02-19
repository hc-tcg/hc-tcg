import {achievement} from './defaults'
import {Achievement} from './types'

const Innefective: Achievement = {
	...achievement,
	numericId: 16,
	id: 'innefective',
	name: 'Innefective',
	icon: '',
	description: 'Win 10 games using no effect cards.',
	steps: 10,
	onGameStart(game, playerEntity, component, observer) {
		const player = game.components.get(playerEntity)
		if (!player) return

		let usedBannedCard = false

		observer.subscribe(player.hooks.onAttach, (card) => {
			if (!['attach', 'single_use'].includes(card.props.category)) return
			usedBannedCard = true
		})

		observer.subscribe(game.hooks.onGameEnd, () => {
			if (usedBannedCard) return
			component.incrementGoalProgress({goal: 0})
		})
	},
}

export default Innefective
