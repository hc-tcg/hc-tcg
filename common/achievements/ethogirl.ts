import EthosLabCommon from '../cards/hermits/ethoslab-common'
import EthosLabRare from '../cards/hermits/ethoslab-rare'
import EthosLabUltraRare from '../cards/hermits/ethoslab-ultra-rare'
import ShadEECommon from '../cards/hermits/shadee-common'
import ShadeEERare from '../cards/hermits/shadeee-rare'
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
	progressionMethod: 'best',
	levels: [
		{
			name: 'Ethogirl',
			description: 'Win a game after playing four unique Etho cards.',
			steps: 4,
		},
	],
	onGameStart(game, player, component, observer) {
		const variants = new Set()
		observer.subscribe(player.hooks.onAttach, (card) => {
			if (!ETHO_CARDS.includes(card.props.id)) return
			variants.add(card.props.id)
		})
		observer.subscribe(game.hooks.onGameEnd, (outcome) => {
			if (variants.size === 0) return
			if (outcome.type !== 'player-won' || outcome.winner !== player.entity)
				return
			component.updateGoalProgress({goal: 0, progress: variants.size})
		})
	},
}

export default Ethogirl
