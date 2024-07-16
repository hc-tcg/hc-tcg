import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {CardComponent, StatusEffectComponent} from '../../../components'
import BetrayedStatusEffect from '../../../status-effects/betrayed'

class HumanCleoRare extends Card {
	props: Hermit = {
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
		health: 270,
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
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = component

		player.hooks.onAttack.add(component, (attack) => {
			if (attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			const coinFlip = flipCoin(player, component, 2)

			const headsAmount = coinFlip.filter((flip) => flip === 'heads').length
			if (headsAmount < 2) return

			game.components
				.new(StatusEffectComponent, BetrayedStatusEffect)
				.apply(opponentPlayer.getActiveHermit()?.entity)
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.onAttack.remove(component)
	}
}

export default HumanCleoRare
