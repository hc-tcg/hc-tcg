import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import {slot} from '../../../components/query'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {CardComponent} from '../../../components'

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
		const {player} = component
		const componentKey = this.getInstanceKey(component)

		player.hooks.onAttack.add(component, (attack) => {
			const attacker = attack.getAttacker()
			if (attack.id !== componentKey || attack.type !== 'secondary' || !attacker) return

			const coinFlip = flipCoin(player, attacker.row.hermitCard, 2)

			const headsAmount = coinFlip.filter((flip) => flip === 'heads').length
			if (headsAmount < 2) return

			applyStatusEffect(
				game,
				'betrayed',
				game.findSlot(slot.opponent, slot.activeRow, slot.hermitSlot)?.cardId
			)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		// Remove hooks
		player.hooks.onAttack.remove(component)
	}
}

export default HumanCleoRare
