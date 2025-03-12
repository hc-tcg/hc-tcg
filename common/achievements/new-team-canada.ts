import EthosLabCommon from '../cards/hermits/ethoslab-common'
import EthosLabRare from '../cards/hermits/ethoslab-rare'
import EthosLabUltraRare from '../cards/hermits/ethoslab-ultra-rare'
import FarmerBeefCommon from '../cards/hermits/farmerbeef-common'
import FarmerBeefRare from '../cards/hermits/farmerbeef-rare'
import GeminiTayCommon from '../cards/hermits/geminitay-common'
import GeminiTayRare from '../cards/hermits/geminitay-rare'
import LlamadadCommmon from '../cards/hermits/llamadad-common'
import LlamadadRare from '../cards/hermits/llamadad-rare'
import PrincessGemCommon from '../cards/hermits/princessgem-common'
import PrincessGemRare from '../cards/hermits/princessgem-rare'
import ShadEECommon from '../cards/hermits/shadee-common'
import ShadeEERare from '../cards/hermits/shadeee-rare'
import VintageBeefCommon from '../cards/hermits/vintagebeef-common'
import VintageBeefRare from '../cards/hermits/vintagebeef-rare'
import VintageBeefUltraRare from '../cards/hermits/vintagebeef-ultra-rare'
import {CardComponent} from '../components'
import query from '../components/query'
import {achievement} from './defaults'
import {Achievement} from './types'

const gem = [
	GeminiTayCommon,
	GeminiTayRare,
	PrincessGemCommon,
	PrincessGemRare,
].map((memberCard) => memberCard.id)
const etho = [
	EthosLabCommon,
	EthosLabRare,
	EthosLabUltraRare,
	ShadEECommon,
	ShadeEERare,
].map((memberCard) => memberCard.id)
const beef = [
	VintageBeefCommon,
	VintageBeefRare,
	VintageBeefUltraRare,
	LlamadadCommmon,
	LlamadadRare,
	FarmerBeefCommon,
	FarmerBeefRare,
].map((memberCard) => memberCard.id)

const NewTeamCanada: Achievement = {
	...achievement,
	numericId: 53,
	id: 'new_team_canada',
	progressionMethod: 'sum',
	levels: [
		{
			name: 'New Team Canada',
			description:
				'Win 5 games with a deck that includes at least one Beef, Etho, and Gem card and no other hermits.',
			steps: 5,
		},
	],
	onGameStart(game, player, component, observer) {
		const playerDeck = game.components
			.filter(
				CardComponent,
				query.card.player(player.entity),
				query.card.isHermit,
			)
			.map((card) => card.props.id)

		const hasBeef = playerDeck.find((x) => beef.includes(x))
		const hasEtho = playerDeck.find((x) => etho.includes(x))
		const hasGem = playerDeck.find((x) => gem.includes(x))

		if (!hasBeef || !hasEtho || !hasGem) return

		const containsOthers = !!playerDeck.find(
			(x) => !beef.includes(x) && !etho.includes(x) && !gem.includes(x),
		)

		if (containsOthers) return

		observer.subscribe(game.hooks.onGameEnd, (outcome) => {
			if (outcome.type !== 'player-won') return
			if (outcome.winner !== player.entity) return
			component.updateGoalProgress({goal: 0})
		})
	},
}

export default NewTeamCanada
