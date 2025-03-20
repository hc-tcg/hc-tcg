import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../components'
import {GameModel} from '../../models/game-model'
import BetrayedEffect from '../../status-effects/betrayed'
import {beforeAttack} from '../../types/priorities'
import {flipCoin} from '../../utils/coinFlips'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const HumanCleoRare: Hermit = {
	...hermit,
	id: 'humancleo_rare',
	numericId: 132,
	name: 'Human Cleo',
	expansion: 'alter_egos',
	palette: 'alter_egos',
	background: 'alter_egos',
	rarity: 'rare',
	tokens: 2,
	type: 'pvp',
	health: 290,
	primary: {
		name: 'Humanity',
		cost: ['pvp'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Betrayed',
		cost: ['pvp', 'pvp'],
		damage: 70,
		power:
			'Flip a coin twice.\nIf both are heads, your opponent must attack one of their own AFK Hermits on their next turn. Your opponent must have the necessary item cards attached to execute an attack.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.HERMIT_APPLY_ATTACK,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return
				if (opponentPlayer.hasStatusEffect(BetrayedEffect)) return

				const coinFlip = flipCoin(game, player, component, 2)

				const headsAmount = coinFlip.filter((flip) => flip === 'heads').length
				if (headsAmount < 2) return

				game.components
					.new(StatusEffectComponent, BetrayedEffect, component.entity)
					.apply(opponentPlayer.entity)
			},
		)
	},
}

export default HumanCleoRare
