import Docm77Common from '../cards/hermits/docm77-common'
import Docm77Rare from '../cards/hermits/docm77-rare'
import EthosLabCommon from '../cards/hermits/ethoslab-common'
import EthosLabRare from '../cards/hermits/ethoslab-rare'
import EthosLabUltraRare from '../cards/hermits/ethoslab-ultra-rare'
import FalseSymmetryCommon from '../cards/hermits/falsesymmetry-common'
import FalseSymmetryRare from '../cards/hermits/falsesymmetry-rare'
import FarmerBeefCommon from '../cards/hermits/farmerbeef-common'
import FarmerBeefRare from '../cards/hermits/farmerbeef-rare'
import GeminiTayCommon from '../cards/hermits/geminitay-common'
import GeminiTayRare from '../cards/hermits/geminitay-rare'
import ImpulseSVCommon from '../cards/hermits/impulsesv-common'
import ImpulseSVRare from '../cards/hermits/impulsesv-rare'
import RendogCommon from '../cards/hermits/rendog-common'
import RendogRare from '../cards/hermits/rendog-rare'
import VintageBeefCommon from '../cards/hermits/vintagebeef-common'
import VintageBeefRare from '../cards/hermits/vintagebeef-rare'
import VintageBeefUltraRare from '../cards/hermits/vintagebeef-ultra-rare'
import WelsknightCommon from '../cards/hermits/welsknight-common'
import WelsknightRare from '../cards/hermits/welsknight-rare'
import XisumavoidCommon from '../cards/hermits/xisumavoid-common'
import XisumavoidRare from '../cards/hermits/xisumavoid-rare'
import {CardComponent} from '../components'
import query from '../components/query'
import {achievement} from './defaults'
import {Achievement} from './types'

const members = [
	GeminiTayCommon,
	GeminiTayRare,
	EthosLabCommon,
	EthosLabRare,
	EthosLabUltraRare,
	VintageBeefCommon,
	VintageBeefRare,
	VintageBeefUltraRare,
	FarmerBeefCommon,
	FarmerBeefRare,
].map((memberCard) => memberCard.id)

const NewTeamCanada: Achievement = {
	...achievement,
	numericId: 53,
	id: 'team_star',
	levels: [
		{
			name: 'New Team Canada',
			description:
				'Win 5 games with a deck that only contains Beef, Etho, and Gem cards.',
			steps: 5,
		},
	],
	onGameStart(game, player, component, observer) {
		const playerDeck = game.components
			.filter(CardComponent, query.card.player(player.entity))
			.map((card) => card.props.id)

		if (playerDeck.find((x) => members.includes(x))) return

		observer.subscribe(game.hooks.onGameEnd, (outcome) => {
			if (outcome.type !== 'player-won') return
			if (outcome.winner !== player.entity) return
			component.incrementGoalProgress({goal: 0})
		})
	},
}

export default NewTeamCanada
