import Docm77Common from '../cards/hermits/docm77-common'
import Docm77Rare from '../cards/hermits/docm77-rare'
import FalseSymmetryCommon from '../cards/hermits/falsesymmetry-common'
import FalseSymmetryRare from '../cards/hermits/falsesymmetry-rare'
import ImpulseSVCommon from '../cards/hermits/impulsesv-common'
import ImpulseSVRare from '../cards/hermits/impulsesv-rare'
import RendogCommon from '../cards/hermits/rendog-common'
import RendogRare from '../cards/hermits/rendog-rare'
import WelsknightCommon from '../cards/hermits/welsknight-common'
import WelsknightRare from '../cards/hermits/welsknight-rare'
import XisumavoidCommon from '../cards/hermits/xisumavoid-common'
import XisumavoidRare from '../cards/hermits/xisumavoid-rare'
import {CardComponent} from '../components'
import query from '../components/query'
import {achievement} from './defaults'
import {Achievement} from './types'

const Docm77Cards = [Docm77Common, Docm77Rare]
const WelsknightCards = [WelsknightCommon, WelsknightRare]
const FalseSymmetryCards = [FalseSymmetryCommon, FalseSymmetryRare]
const ImpulseCards = [ImpulseSVCommon, ImpulseSVRare]
const XisumavoidCards = [XisumavoidCommon, XisumavoidRare]
const RendogCards = [RendogCommon, RendogRare]

const members = [
	Docm77Cards,
	WelsknightCards,
	FalseSymmetryCards,
	ImpulseCards,
	XisumavoidCards,
	RendogCards,
].map((member) => member.map((memberCard) => memberCard.id))

const TeamStar: Achievement = {
	...achievement,
	numericId: 12,
	id: 'team_star',
	progressionMethod: 'sum',
	levels: [
		{
			name: 'Hermit Gang',
			description:
				'Win 5 games using a deck that includes at least 1 Docm77, Wels, False, Impulse, Xisuma and Rendog card.',
			steps: 5,
		},
	],
	onGameStart(game, player, component, observer) {
		const playerDeck = game.components
			.filter(CardComponent, query.card.player(player.entity))
			.map((card) => card.props.id)
		const containsAllMembers = members.every((member) =>
			member.some((id) => playerDeck.includes(id)),
		)
		if (!containsAllMembers) return

		observer.subscribe(game.hooks.onGameEnd, (outcome) => {
			if (outcome.type !== 'player-won') return
			if (outcome.winner !== player.entity) return
			component.updateGoalProgress({goal: 0})
		})
	},
}

export default TeamStar
