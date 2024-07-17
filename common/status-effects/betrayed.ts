import {PlayerStatusEffect, StatusEffectProps, systemStatusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {query, slot} from '../components/query'
import {hasEnoughEnergy} from '../utils/attacks'
import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../components'

class Betrayed extends PlayerStatusEffect {
	props: StatusEffectProps = {
		...systemStatusEffect,
		id: 'betrayed',
		name: 'Betrayed',
		description:
			'You must attack an AFK hermit if one exists and your active hermit has the neccesary items attached to attack.',
	}

	override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent
	) {
		const pickCondition = query.every(
			slot.currentPlayer,
			query.not(slot.activeRow),
			query.not(slot.empty),
			slot.hermitSlot
		)

		let pickedAfkHermit: SlotComponent | null = null

		const blockActions = () => {
			// Start by removing blocked actions in case requirements are no longer met
			game.removeBlockedActions(this.props.id, 'CHANGE_ACTIVE_HERMIT', 'END_TURN')

			// Return if the opponent has no AFK Hermits to attack
			if (!game.components.exists(SlotComponent, pickCondition)) return

			const opponentActiveRow = getActiveRow(pos.opponentPlayer)
			if (!opponentActiveRow) return

			const energy = opponentActiveRow.itemCards.flatMap((item) => {
				if (item?.isItem()) return item.props.type
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

		observer.subscribe(player.hooks.onTurnStart, blockActions)
		observer.subscribe(player.hooks.onAttach, blockActions)
		observer.subscribe(player.hooks.onDetach, blockActions)

		// Add a pick request for opponent to pick an afk hermit to attack
		observer.subscribe(player.hooks.getAttackRequests, (activeInstance, hermitAttackType) => {
			// Only pick if there is afk to pick
			if (!game.components.exists(SlotComponent, pickCondition)) return

			game.addPickRequest({
				playerId: player.id,
				id: this.props.id,
				message: 'Pick one of your AFK Hermits',
				canPick: pickCondition,
				onResult(pickedSlot) {
					const rowIndex = pickedSlot.rowIndex
					if (!pickedSlot.cardId || !rowIndex === null) return
					player.hooks.getAttackRequests.remove(effect)
					pickedAfkHermit = pickedSlot
				},
				onTimeout() {
					player.hooks.getAttackRequests.remove(effect)
					const firstAfk = game.filterSlots(pickCondition)[0]
					if (!firstAfk) return
					pickedAfkHermit = firstAfk
				},
			})
		})

		player.hooks.beforeAttack.add(effect, (attack) => {
			if (!attack.isType('primary', 'secondary')) return
			player.hooks.beforeAttack.remove(effect)

			if (
				pickedAfkHermit !== null &&
				pickedAfkHermit.cardId &&
				pickedAfkHermit.rowId &&
				pickedAfkHermit.rowIndex !== null
			) {
				attack.setTarget(this.props.id, {
					player: player,
					rowIndex: pickedAfkHermit.rowIndex,
					// This cast is safe because we verified in the if statement that the hermit card in the row exists.
					row: pickedAfkHermit.rowId as RowStateWithHermit,
				})
			}

			// They attacked now, they can end turn or change hermits with Chorus Fruit
			game.removeBlockedActions(this.props.id, 'CHANGE_ACTIVE_HERMIT', 'END_TURN')
		})

		player.hooks.afterAttack.add(effect, () => {
			removeStatusEffect(game, pos, effect)
		})
	}

	override onRemoval(game: GameModel, instance: StatusEffectComponent, pos: CardPosModel) {
		const {player} = component

		player.hooks.onTurnStart.remove(instance)
		player.hooks.onAttach.remove(instance)
		player.hooks.onDetach.remove(instance)
		player.hooks.getAttackRequests.remove(instance)
		player.hooks.beforeAttack.remove(instance)
		player.hooks.afterAttack.remove(instance)
	}
}

export default Betrayed
