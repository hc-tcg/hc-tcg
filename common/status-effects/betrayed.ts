import {
	ObserverComponent,
	PlayerComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../components'
import query from '../components/query'
import {GameModel} from '../models/game-model'
import {beforeAttack, onTurnEnd} from '../types/priorities'
import {hasEnoughEnergy} from '../utils/attacks'
import {StatusEffect, systemStatusEffect} from './status-effect'

const BetrayedEffect: StatusEffect<PlayerComponent> = {
	...systemStatusEffect,
	id: 'betrayed',
	icon: 'betrayed',
	name: 'Betrayed',
	description:
		'If your active hermit has the necessary items attached to attack and you have AFK Hermits, you must choose to attack one. Lasts until you attack.',
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	) {
		const pickCondition = query.every(
			query.slot.currentPlayer,
			query.not(query.slot.active),
			query.not(query.slot.empty),
			query.slot.hermit,
		)

		let pickedAfkHermit: SlotComponent | null = null

		const blockActions = () => {
			// Start by removing blocked actions in case requirements are no longer met
			game.removeBlockedActions(
				this.icon,
				'CHANGE_ACTIVE_HERMIT',
				'SINGLE_USE_ATTACK',
				'END_TURN',
			)

			// Return if the opponent has no AFK Hermits to attack
			if (!game.components.exists(SlotComponent, pickCondition)) return

			const activeHermit = player.getActiveHermit()
			if (!activeHermit) return

			const energy =
				(activeHermit.slot.inRow() &&
					player.hooks.availableEnergy.call(
						activeHermit.slot.row.getItems(true).flatMap((item) => {
							if (item.isItem()) return item.props.energy
							return []
						}),
					)) ||
				[]

			// Return if no energy
			// Don't prevent change hermit if opponent is blocked from attacking for other reason
			if (!activeHermit.isHermit()) return
			if (
				(!hasEnoughEnergy(
					energy,
					activeHermit.getAttackCost('primary'),
					game.settings.noItemRequirements,
				) ||
					activeHermit.props.primary.passive ||
					game.isActionBlocked('PRIMARY_ATTACK')) &&
				(!hasEnoughEnergy(
					energy,
					activeHermit.getAttackCost('secondary'),
					game.settings.noItemRequirements,
				) ||
					activeHermit.props.secondary.passive ||
					game.isActionBlocked('SECONDARY_ATTACK'))
			) {
				return
			}

			// The opponent needs to attack in this case, so prevent them switching, using only a single use attack, or ending turn
			game.addBlockedActions(
				this.icon,
				'CHANGE_ACTIVE_HERMIT',
				'SINGLE_USE_ATTACK',
				'END_TURN',
			)
		}

		observer.subscribe(player.hooks.onTurnStart, blockActions)
		observer.subscribe(player.hooks.onActiveRowChange, (oldHermit) => {
			if (game.currentPlayerEntity !== player.entity) return
			if (oldHermit === null) {
				blockActions()
			} else {
				game.removeBlockedActions(
					this.icon,
					'CHANGE_ACTIVE_HERMIT',
					'SINGLE_USE_ATTACK',
					'END_TURN',
				)
			}
		})
		observer.subscribe(player.hooks.afterApply, blockActions)
		observer.subscribe(player.hooks.onAttach, blockActions)
		observer.subscribe(player.hooks.onDetach, blockActions)

		// Add a pick request for opponent to pick an afk hermit to attack
		observer.subscribe(
			player.hooks.getAttackRequests,
			(_activeInstance, _hermitAttackType) => {
				// Only pick if there is afk to pick
				if (!game.components.exists(SlotComponent, pickCondition)) {
					pickedAfkHermit = null
					return
				}

				game.addPickRequest({
					player: player.entity,
					id: effect.entity,
					message: 'Pick one of your AFK Hermits',
					canPick: pickCondition,
					onResult(pickedSlot) {
						pickedAfkHermit = pickedSlot
					},
					onTimeout() {
						const firstAfk = game.components.find(SlotComponent, pickCondition)
						if (!firstAfk) return
						pickedAfkHermit = firstAfk
					},
				})
			},
		)

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.BETRAYED_CHANGE_TARGET,
			(attack) => {
				if (attack.player.entity !== player.entity) return
				if (!attack.isType('primary', 'secondary')) return

				if (pickedAfkHermit === null || !pickedAfkHermit.inRow()) return
				attack.setTarget(effect.entity, pickedAfkHermit.row.entity)

				// They attacked now, they can end turn or change hermits with Chorus Fruit
				game.removeBlockedActions(
					this.icon,
					'CHANGE_ACTIVE_HERMIT',
					'SINGLE_USE_ATTACK',
					'END_TURN',
				)
				effect.remove()
			},
		)

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				effect.remove()
			},
		)
	},
}

export default BetrayedEffect
