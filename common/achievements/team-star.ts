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

	levels: [
		{
			name: 'Hermit Gang',
			description:
				'Win 5 games using a deck that includes at least 1 Docm77, Wels, False, Impulse, Xisuma and Rendog card.',
			steps: 5,
		},
	],
	onGameEnd(game, playerEntity, component, outcome) {
		const player = game.components.get(playerEntity)
		if (!player) return

		if (outcome.type !== 'player-won') return
		if (outcome.winner !== playerEntity) return

		const playerDeck = player.getDeck().map((card) => card.props.id)
		let containsAllMembers = true
		members.forEach((member) => {
			let containsMember = false
			member.forEach((card) => {
				if (!playerDeck.includes(card)) return
				containsMember = true
			})
			containsAllMembers &&= containsMember
		})
		if (!containsAllMembers) return
		component.incrementGoalProgress({goal: 0})
	},
}

export default TeamStar
