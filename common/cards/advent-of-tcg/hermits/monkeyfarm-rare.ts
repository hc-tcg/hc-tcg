import {CardComponent} from '../../components'
import {slot} from '../../components/query'
import {GameModel} from '../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import CardOld from '../../base/card'
import {hermit} from '../defaults'
import {Hermit} from '../types'

class MonkeyfarmRare extends CardOld {
	props: Hermit = {
		...hermit,
		id: 'monkeyfarm_rare',
		numericId: 212,
		name: 'Monkeyfarm',
		expansion: 'advent_of_tcg',
		palette: 'advent_of_tcg',
		background: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 1,
		type: 'farm',
		health: 250,
		primary: {
			name: 'Skull',
			cost: ['farm'],
			damage: 40,
			power: null,
		},
		secondary: {
			name: 'Monkeystep',
			cost: ['farm', 'farm'],
			damage: 80,
			power:
				"Flip a coin. If heads, discard 1 attached item card from an opponent's AFK Hermit.",
		},
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: Observer,
	) {
		const {player, opponentPlayer} = pos

		player.hooks.afterAttack.add(component, (attack) => {
			const attacker = attack.getAttacker()
			if (
				attack.id !== this.getInstanceKey(component) ||
				attack.type !== 'secondary' ||
				!attacker
			)
				return

			const coinFlip = flipCoin(player, attacker.row.hermitCard)
			if (coinFlip[0] !== 'heads') return

			const pickCondition = slot.every(
				slot.opponent,
				slot.item,
				slot.not(slot.empty),
			)

			if (!game.someSlotFulfills(pickCondition)) return

			game.addPickRequest({
				player: player.entity,
				id: this.props.id,
				message: "Pick one of your opponent's AFK Hermit's item cards",
				canPick: pickCondition,
				onResult(pickedSlot) {
					const rowIndex = pickedSlot.rowIndex
					if (!pickedSlot.cardId || rowIndex === null) return

					const row = opponentPlayer.board.rows[rowIndex]
					if (!row.hermitCard) return

					// Apply the card
					discardCard(game, pickedSlot.cardId)
				},
			})
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		// Remove hooks
		player.hooks.afterAttack.remove(component)
	}
}

export default MonkeyfarmRare
