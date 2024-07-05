import StatusEffect, {StatusEffectProps} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {getActiveRow, removeStatusEffect} from '../utils/board'
import {RowStateWithHermit, StatusEffectInstance} from '../types/game-state'
import {slot} from '../slot'
import {hasEnoughEnergy} from '../utils/attacks'
import {SlotInfo} from '../types/cards'

class BetrayedStatusEffect extends StatusEffect {
	props: StatusEffectProps = {
		id: 'betrayed',
		name: 'Betrayed',
		description: 'This Hermit must attack an AKF hermit if one exists.',
		damageEffect: false,
	}

	override onApply(game: GameModel, instance: StatusEffectInstance, pos: CardPosModel) {
		const {player} = pos

		game.state.statusEffects.push(instance)

		const pickCondition = slot.every(
			slot.player,
			slot.not(slot.activeRow),
			slot.not(slot.empty),
			slot.hermitSlot
		)

		let pickedAfkHermit: SlotInfo | null = null

		const blockActions = () => {
			// Start by removing blocked actions in case requirements are no longer met
			game.removeBlockedActions(this.props.id, 'CHANGE_ACTIVE_HERMIT', 'END_TURN')

			// Return if the opponent has no AFK Hermits to attack
			if (!game.someSlotFulfills(pickCondition)) return

			const opponentActiveRow = getActiveRow(pos.opponentPlayer)
			if (!opponentActiveRow) return

			const energy = opponentActiveRow.itemCards.flatMap((item) => {
				if (item) return item.props.type
				return []
			})

			// Return if no energy
			if (
				!opponentActiveRow.hermitCard.isHermit() ||
				(!hasEnoughEnergy(energy, opponentActiveRow.hermitCard.props.primary.cost) &&
					!hasEnoughEnergy(energy, opponentActiveRow.hermitCard.props.secondary.cost))
			) {
				return
			}

			// Don't prevent change hermit if opponent is blocked from attacking for other reason
			if (game.isActionBlocked('PRIMARY_ATTACK') && game.isActionBlocked('SECONDARY_ATTACK')) {
				return
			}

			// The opponent needs to attack in this case, so prevent them switching or ending turn
			game.addBlockedActions(this.props.id, 'CHANGE_ACTIVE_HERMIT', 'END_TURN')
		}

		player.hooks.onTurnStart.add(instance, blockActions)
		player.hooks.onAttach.add(instance, blockActions)
		player.hooks.onDetach.add(instance, blockActions)

		// Add a pick request for opponent to pick an afk hermit to attack
		player.hooks.getAttackRequests.add(instance, (activeInstance, hermitAttackType) => {
			// Only pick if there is afk to pick
			if (!game.someSlotFulfills(pickCondition)) return

			game.addPickRequest({
				playerId: player.id,
				id: this.props.id,
				message: 'Pick one of your AFK Hermits',
				canPick: pickCondition,
				onResult(pickedSlot) {
					const rowIndex = pickedSlot.rowIndex
					if (!pickedSlot.card || !rowIndex === null) return
					player.hooks.getAttackRequests.remove(instance)
					pickedAfkHermit = pickedSlot
				},
				onTimeout() {
					player.hooks.getAttackRequests.remove(instance)
					const firstAfk = game.filterSlots(pickCondition)[0]
					if (!firstAfk) return
					pickedAfkHermit = firstAfk
				},
			})
		})

		player.hooks.beforeAttack.add(instance, (attack) => {
			if (!attack.isType('primary', 'secondary')) return
			player.hooks.beforeAttack.remove(instance)

			if (
				pickedAfkHermit !== null &&
				pickedAfkHermit.card &&
				pickedAfkHermit.row &&
				pickedAfkHermit.rowIndex !== null
			) {
				attack.setTarget(this.props.id, {
					player: player,
					rowIndex: pickedAfkHermit.rowIndex,
					// This cast is safe because we verified in the if statement that the hermit card in the row exists.
					row: pickedAfkHermit.row as RowStateWithHermit,
				})
			}

			// They attacked now, they can end turn or change hermits with Chorus Fruit
			game.removeBlockedActions(this.props.id, 'CHANGE_ACTIVE_HERMIT', 'END_TURN')
		})

		player.hooks.afterAttack.add(instance, () => {
			removeStatusEffect(game, pos, instance)
		})
	}

	override onRemoval(game: GameModel, instance: StatusEffectInstance, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onTurnStart.remove(instance)
		player.hooks.onAttach.remove(instance)
		player.hooks.onDetach.remove(instance)
		player.hooks.getAttackRequests.remove(instance)
		player.hooks.beforeAttack.remove(instance)
		player.hooks.afterAttack.remove(instance)
	}
}

export default BetrayedStatusEffect
