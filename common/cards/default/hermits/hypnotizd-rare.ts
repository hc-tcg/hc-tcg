import {GameModel} from '../../../models/game-model'
import {slot} from '../../../components/query'
import {HermitAttackType} from '../../../types/attack'
import {SlotComponent} from '../../../types/cards'
import {CardComponent, RowStateWithHermit} from '../../../types/game-state'
import {PickRequest} from '../../../types/server-requests'
import {hasStatusEffect} from '../../../utils/board'
import {discardCard} from '../../../utils/movement'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

/*
- Has to support having two different afk targets (one for hypno, one for su effect like bow)
- If the afk target for Hypno's ability & e.g. bow are the same, don't apply weakness twice
- TODO - Can't use Got 'Em to attack AFK hermits even with Efficiency if Hypno has no item cards to discard
*/
class HypnotizdRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'hypnotizd_rare',
		numericId: 37,
		name: 'Hypno',
		expansion: 'default',
		rarity: 'rare',
		tokens: 3,
		type: 'miner',
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
				"You can choose to attack one of your opponent's AFK Hermits. If you do this, you must discard one item card attached to your active Hermit.",
		},
	}

	override onAttach(game: GameModel, component: CardComponent): void {
		const {player, opponentPlayer} = pos
		let target: SlotComponent | null = null

		player.hooks.beforeAttack.add(component, (attack) => {
			if (attack.id !== this.getInstanceKey(component) || attack.type !== 'secondary') return
			if (!target || target.rowIndex == null || !target.rowId) return

			attack.setTarget(this.props.id, {
				player: opponentPlayer,
				rowIndex: target?.rowIndex,
				row: target?.rowId as RowStateWithHermit,
			})

			target = null
		})

		player.hooks.getAttackRequests.add(component, (activeInstance, hermitAttackType) => {
			if (activeInstance.entity !== component.entity || hermitAttackType !== 'secondary') return

			const pickCondition = slot.every(
				slot.player,
				slot.activeRow,
				slot.itemSlot,
				slot.not(slot.empty)
			)

			// Betrayed ignores the slot that you pick in this pick request, so we skip this pick request
			// to make the game easier to follow.
			if (hasStatusEffect(game, component, 'betrayed')) return

			if (!game.someSlotFulfills(pickCondition)) return
			const itemRequest: PickRequest = {
				playerId: player.id,
				id: this.props.id,
				message: 'Choose an item to discard from your active Hermit.',
				canPick: pickCondition,
				onResult(pickedSlot) {
					if (!pickedSlot.cardId) return
					discardCard(game, pickedSlot.cardId)
				},
				onTimeout() {
					discardCard(game, game.findSlot(pickCondition)?.cardId || null)
				},
			}

			game.addPickRequest({
				playerId: player.id,
				id: this.props.id,
				message: "Pick one of your opponent's Hermits",
				canPick: slot.every(slot.opponent, slot.hermitSlot, slot.not(slot.empty)),
				onResult: (pickedSlot) => {
					// Store the row index to use later
					target = pickedSlot

					const targetingAfk = pickedSlot.rowIndex !== opponentPlayer.board.activeRow

					if (targetingAfk) {
						// Add a second pick request to remove an item
						game.addPickRequest(itemRequest)
					}
				},
			})
		})
	}

	override onDetach(game: GameModel, component: CardComponent): void {
		const {player} = component
		player.hooks.getAttackRequests.remove(component)
	}
}

export default HypnotizdRareHermitCard
