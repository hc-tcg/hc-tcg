import {PlayerStatusEffect, StatusEffectProps, systemStatusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {query, slot} from '../components/query'
import {hasEnoughEnergy} from '../utils/attacks'
import {
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

			const activeHermit = player.getActiveHermit()
			if (!activeHermit) return

			const energy =
				(activeHermit.slot.inRow() &&
					activeHermit.slot.row.getItems()?.flatMap((item) => {
						if (item?.isItem()) return item.props.type
						return []
					})) ||
				[]

			// Return if no energy
			if (
				!activeHermit.isHermit() ||
				(!hasEnoughEnergy(energy, activeHermit.props.primary.cost) &&
					!hasEnoughEnergy(energy, activeHermit.props.secondary.cost))
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
		observer.subscribe(player.hooks.getAttackRequests, (_activeInstance, hermitAttackType) => {
			// Only pick if there is afk to pick
			if (!game.components.exists(SlotComponent, pickCondition)) return

			game.addPickRequest({
				playerId: player.id,
				id: effect.entity,
				message: 'Pick one of your AFK Hermits',
				canPick: pickCondition,
				onResult(pickedSlot) {
					pickedAfkHermit = pickedSlot
				},
				onTimeout() {
					observer.unsubscribe(player.hooks.getAttackRequests)
					const firstAfk = game.components.find(SlotComponent, pickCondition)
					if (!firstAfk) return
					pickedAfkHermit = firstAfk
				},
			})
		})

		observer.subscribe(player.hooks.beforeAttack, (attack) => {
			if (!attack.isType('primary', 'secondary')) return
			observer.unsubscribe(player.hooks.beforeAttack)

			if (pickedAfkHermit !== null && pickedAfkHermit.inRow()) {
				attack.setTarget(effect.entity, pickedAfkHermit.row.entity)
			}

			// They attacked now, they can end turn or change hermits with Chorus Fruit
			game.removeBlockedActions(this.props.id, 'CHANGE_ACTIVE_HERMIT', 'END_TURN')
		})

		observer.subscribe(player.hooks.afterAttack, () => {
			effect.remove()
		})

		observer.subscribe(player.hooks.onTurnEnd, () => {
			effect.remove()
		})
	}
}

export default Betrayed
