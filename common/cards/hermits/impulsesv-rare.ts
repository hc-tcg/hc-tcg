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
	tokens: 3,
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
			'If you have a base set AFK Bdubs or Tangos on the game board, do an additional 40hp damage, or 80 additional damage if you have both.',
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

				const hasBdubs = game.components.exists(
					CardComponent,
					query.card.currentPlayer,
					query.card.is(BdoubleO100Common, BdoubleO100Rare),
					query.card.attached,
				)
				const hasTango = game.components.exists(
					CardComponent,
					query.card.currentPlayer,
					query.card.is(TangoTekCommon, TangoTekRare),
					query.card.attached,
				)

				if (hasBdubs) attack.addDamage(component.entity, 40)
				if (hasTango) attack.addDamage(component.entity, 40)
			},
		)
	},
}

export default ImpulseSVRare
