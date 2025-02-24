import EthosLabCommon from '../cards/hermits/ethoslab-common'
import EthosLabRare from '../cards/hermits/ethoslab-rare'
import EthosLabUltraRare from '../cards/hermits/ethoslab-ultra-rare'
import ShadEECommon from '../cards/hermits/shadee-common'
import ShadeEERare from '../cards/hermits/shadeee-rare'
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
].map((card) => card.id)

const Ethogirl: Achievement = {
	...achievement,
	numericId: 2,
	id: 'ethogirl',
	levels: [
		{
			name: 'Ethogirl',
			description:
				'Place all 3 Etho cards and both Shade-E-E cards on your board at the same time.',
			steps: 5,
		},
	],
	onGameStart(game, playerEntity, component, observer) {
		const player = game.components.get(playerEntity)
		if (!player) return

		observer.subscribe(player.hooks.onAttach, (card) => {
			if (!ETHO_CARDS.includes(card.props.id)) return
			const boardCards = game.components.filter(
				SlotComponent,
				query.slot.player(playerEntity),
				query.slot.hermit,
				(_game, slot) =>
					ETHO_CARDS.includes(slot.getCard()?.props.id as string),
			)
			component.bestGoalProgress({goal: 0, progress: boardCards.length})
		})
	},
}

export default Ethogirl
