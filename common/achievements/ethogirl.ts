import EthosLabCommon from '../cards/hermits/ethoslab-common'
import EthosLabRare from '../cards/hermits/ethoslab-rare'
import EthosLabUltraRare from '../cards/hermits/ethoslab-ultra-rare'
import ShadEECommon from '../cards/hermits/shadee-common'
import ShadeEERare from '../cards/hermits/shadeee-rare'
import {Hermit} from '../cards/types'
import {SlotComponent} from '../components'
import query from '../components/query'
import {achievement} from './defaults'
import {Achievement} from './types'

const ETHO_CARDS = [
	EthosLabCommon,
	EthosLabRare,
	EthosLabUltraRare,
	ShadEECommon,
	ShadeEERare,
]

const Ethogirl: Achievement = {
	...achievement,
	numericId: 2,
	id: 'ethogirl',
	name: 'Ethogirl',
	description:
		'Place all 3 Etho cards and both Shade-e cards on your board at the same time',
	steps: 5,
	onGameStart(component, observer) {
		const {game, player} = component
		const playerComponent = game.components.get(player)
		if (!playerComponent) return

		observer.subscribe(playerComponent.hooks.onAttach, (card) => {
			if (!ETHO_CARDS.includes(card.props as Hermit)) return
			const boardCards = game.components.filter(
				SlotComponent,
				query.slot.player(player),
				query.slot.hermit,
				(_game, slot) => ETHO_CARDS.includes(slot.getCard()?.props as Hermit),
			)
			if (!component.goals[0]) component.goals[0] = 0
			component.goals[0] = Math.max(component.goals[0], boardCards.length)
		})
	},
}

export default Ethogirl
