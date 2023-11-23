import {ITEM_CARDS} from '..'
import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {HermitAttackType} from '../../types/attack'
import {PickRequest} from '../../types/server-requests'
import {createWeaknessAttack} from '../../utils/attacks'
import {getActiveRow, getNonEmptyRows} from '../../utils/board'
import {discardCard} from '../../utils/movement'
import HermitCard from '../base/hermit-card'

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

	override getAttacks(
		game: GameModel,
		instance: string,
		pos: CardPosModel,
		hermitAttackType: HermitAttackType
	) {
		const {player, opponentPlayer} = pos
		const attacks = super.getAttacks(game, instance, pos, hermitAttackType)

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

		// Delete the target info now
		delete player.custom[targetKey]

		return newAttacks
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel): void {
		const {player, opponentPlayer} = pos
		const targetKey = this.getInstanceKey(instance, 'target')

		player.hooks.getAttackRequests.add(instance, (activeInstance, hermitAttackType) => {
			if (activeInstance !== instance || hermitAttackType !== 'secondary') return

			const inactiveRows = getNonEmptyRows(opponentPlayer, false)
			if (inactiveRows.length === 0) return

			const itemRequest: PickRequest = {
				playerId: player.id,
				id: this.id,
				message: 'Choose an item to discard from your active Hermit.',
				onResult(pickResult) {
					if (pickResult.playerId !== player.id) return 'FAILURE_WRONG_PLAYER'

					const rowIndex = pickResult.rowIndex
					if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
					if (rowIndex !== player.board.activeRow) return 'FAILURE_INVALID_SLOT'

					if (pickResult.slot.type !== 'item') return 'FAILURE_INVALID_SLOT'
					if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

					const itemCard = ITEM_CARDS[pickResult.card.cardId]
					if (!itemCard) return 'FAILURE_INVALID_SLOT'

					discardCard(game, pickResult.card)

					return 'SUCCESS'
				},
				onTimeout() {
					// Discard the first available item card
					const activeRow = getActiveRow(player)
					if (!activeRow) return
					const itemCard = activeRow.itemCards.find((card) => !!card)
					if (!itemCard) return
					discardCard(game, itemCard)
				},
			}

			game.addPickRequest({
				playerId: player.id,
				id: this.id,
				message: "Pick one of your opponent's Hermits",
				onResult(pickResult) {
					if (pickResult.playerId !== opponentPlayer.id) return 'FAILURE_WRONG_PLAYER'

					const rowIndex = pickResult.rowIndex
					if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'

					if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
					if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

					// Store the row index to use later
					player.custom[targetKey] = rowIndex

					const isItemToDiscard = getActiveRow(player)?.itemCards.some((card) => {
						if (!card) return false
						if (!ITEM_CARDS[card.cardId]) return false
						return true
					})
					const targetingAfk = rowIndex !== opponentPlayer.board.activeRow

					if (isItemToDiscard && targetingAfk) {
						// Add a second pick request to remove an item
						game.addPickRequest(itemRequest)
					}

					return 'SUCCESS'
				},
				onTimeout() {
					// We didn't choose anyone so we will just attack as normal
				},
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel): void {
		const {player} = pos
		player.hooks.getAttackRequests.remove(instance)
	}
}

export default HypnotizdRareHermitCard
