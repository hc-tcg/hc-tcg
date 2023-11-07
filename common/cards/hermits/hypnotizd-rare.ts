import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {HermitAttackType} from '../../types/attack'
import {PickedSlots} from '../../types/pick-process'
import {createWeaknessAttack} from '../../utils/attacks'
import {discardCard} from '../../utils/movement'
import {getActiveRow} from '../../utils/board'
import HermitCard from '../base/hermit-card'
import {PickRequest} from '../../types/server-requests'
import {ITEM_CARDS} from '..'

/*
- Has to support having two different afk targets (one for hypno, one for su effect like bow)
- If the afk target for Hypno's ability & e.g. bow are the same, don't apply weakness twice
- TODO - Can't use Got 'Em to attack AFK hermits even with Efficiency if Hypno has no item cards to discard
*/
class HypnotizdRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'hypnotizd_rare',
			numericId: 37,
			name: 'Hypno',
			rarity: 'rare',
			hermitType: 'miner',
			health: 270,
			primary: {
				name: 'MmHmm',
				cost: ['miner'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: "Got 'Em",
				cost: ['miner', 'any'],
				damage: 70,
				power:
					"You can choose to attack an opponent's AFK Hermit.\n\nIf AFK Hermit is attacked, you must discard 1 attached item card.",
			},
		})
	}

	// @NOWTODO - the switch needed is simple in essence - the client needs to send an attack request to the server, and the server must have the freedom to send whatever back
	// in this case I see it as the server returning success for the attack message and then the state sent back is a pick request
	// the thing is once the picks are all complete the attack loop needs to actually run.

	//override getPickRequests(
	//	game: GameModel,
	//	instance: string,
	//	pos: CardPosModel,
	//	hermitAttackType: HermitAttackType
	//): Array<PickRequest> {
	//	if (hermitAttackType !== 'secondary') return []
	//
	//	const {player, opponentPlayer} = pos
	//
	//	const targetKey = this.getInstanceKey(instance, 'target')
	//
	//	// Requests an item that will be removed from the active Hermit. Should never be called if there are no items.
	//	const itemRequest: PickRequest = {
	//		id: this.getKey('itemRequest'),
	//		message: 'Choose an item to discard from your active Hermit.',
	//		onResult(pickResult) {
	//			if (pickResult.playerId !== player.id) return 'FAILURE_WRONG_PLAYER'
	//
	//			const rowIndex = pickResult.rowIndex
	//			if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
	//			if (rowIndex !== player.board.activeRow) return 'FAILURE_INVALID_SLOT'
	//
	//			if (pickResult.slot.type !== 'item') return 'FAILURE_INVALID_SLOT'
	//			if (!pickResult.card) return 'FAILURE_INVALID_SLOT'
	//
	//			const itemCard = ITEM_CARDS[pickResult.card.cardId]
	//			if (!itemCard) return 'FAILURE_INVALID_SLOT'
	//
	//			discardCard(game, pickResult.card)
	//
	//			return 'SUCCESS'
	//		},
	//	}
	//
	//	return [
	//		{
	//			playerId: player.id,
	//			id: this.getKey('targetRequest'),
	//			message: 'Choose an opposing Hermit to attack.',
	//			onResult(pickResult) {
	//				if (pickResult.playerId !== opponentPlayer.id) return 'FAILURE_WRONG_PLAYER'
	//
	//				const rowIndex = pickResult.rowIndex
	//				if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
	//
	//				if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
	//				if (!pickResult.card) return 'FAILURE_INVALID_SLOT'
	//
	//				player.custom[targetKey] = rowIndex
	//
	//				const isItemToDiscard = getActiveRow(player)?.itemCards.some((card) => {
	//					if (!card) return false
	//					if (!ITEM_CARDS[card.cardId]) return false
	//					return true
	//				})
	//				const targetingAfk = rowIndex !== opponentPlayer.board.activeRow
	//
	//				if (isItemToDiscard && targetingAfk) {
	//					// Add a second pick request to remove an item
	//					player.pickRequests.push(itemRequest)
	//				}
	//
	//				return 'SUCCESS'
	//			},
	//		},
	//	]
	//}

	override getAttacks(
		game: GameModel,
		instance: string,
		pos: CardPosModel,
		hermitAttackType: HermitAttackType,
		pickedSlots: PickedSlots
	) {
		const {player, opponentPlayer} = pos
		const attacks = super.getAttacks(game, instance, pos, hermitAttackType, pickedSlots)

		if (attacks[0].type !== 'secondary') return attacks

		const hermitAttack = attacks[0]

		const targetKey = this.getInstanceKey(instance, 'target')
		const targetIndex: number | undefined = player.custom[targetKey]
		if (targetIndex === undefined) return attacks
		if (targetIndex === opponentPlayer.board.activeRow) return attacks

		const targetRow = opponentPlayer.board.rows[targetIndex]
		if (!targetRow.hermitCard) return attacks

		// Change attack target
		hermitAttack.target = {
			player: opponentPlayer,
			rowIndex: targetIndex,
			row: targetRow,
		}

		const newAttacks = [hermitAttack]

		const weaknessAttack = createWeaknessAttack(hermitAttack)
		if (weaknessAttack) newAttacks.push(weaknessAttack)

		return newAttacks
	}
}

export default HypnotizdRareHermitCard
