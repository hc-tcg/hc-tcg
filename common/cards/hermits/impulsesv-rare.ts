import {CardComponent, ObserverComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import {Hermit} from '../types'
import BdoubleO100Common from './bdoubleo100-common'
import BdoubleO100Rare from './bdoubleo100-rare'
import TangoTekCommon from './tangotek-common'
import TangoTekRare from './tangotek-rare'

const ImpulseSVRare: Hermit = {
	...hermit,
	id: 'impulsesv_rare',
	numericId: 41,
	name: 'Impulse',
	expansion: 'default',
	rarity: 'rare',
	tokens: 4,
	type: 'redstone',
	health: 250,
	primary: {
		name: 'Bop',
		cost: ['redstone'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Boomer',
		cost: ['redstone', 'any'],
		damage: 70,
		power:
			'For each of your AFK Bdubs or Tangos on the game board, do an additional 40hp damage, up to a maximum of 80hp additional damage.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.MODIFY_DAMAGE,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				const boomerAmount = game.components.filter(
					CardComponent,
					query.card.currentPlayer,
					query.card.attached,
					query.card.is(
						BdoubleO100Common,
						BdoubleO100Rare,
						TangoTekCommon,
						TangoTekRare,
					),
					query.not(query.card.active),
				).length

				attack.addDamage(component.entity, Math.min(boomerAmount, 2) * 40)
			},
		)
	},
}

export default ImpulseSVRare
