import {GameModel} from '../../../models/game-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {flipCoin} from '../../../utils/coinFlips'
import {applyStatusEffect} from '../../../utils/board'
import {slot} from '../../../slot'
import Card, {Hermit, hermit} from '../../base/card'
import {CardInstance} from '../../../types/game-state'

class HumanCleoRareHermitCard extends Card {
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

	override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos
		const instanceKey = this.getInstanceKey(instance)

		player.hooks.onAttack.add(instance, (attack) => {
			const attacker = attack.getAttacker()
			if (attack.id !== instanceKey || attack.type !== 'secondary' || !attacker) return

			const coinFlip = flipCoin(player, attacker.row.hermitCard, 2)

			const headsAmount = coinFlip.filter((flip) => flip === 'heads').length
			if (headsAmount < 2) return

			applyStatusEffect(
				game,
				'betrayed',
				game.findSlot(slot.every(slot.opponent, slot.activeRow, slot.hermitSlot))?.card
			)
		})
	}

	override onDetach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos
		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}
}

export default HumanCleoRareHermitCard
