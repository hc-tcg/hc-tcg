import {Card} from '../cards/types'
import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {onTurnEnd} from '../types/priorities'
import {StatusEffect, systemStatusEffect} from './status-effect'

// @todo Only disable the proper slots. This is not doable until bloced actions are reworked.

export const PrimaryAttackDisabledEffect: StatusEffect<CardComponent> = {
	...systemStatusEffect,
	id: 'primary-attack-disabled',
	icon: 'primary-attack-disabled',
	name: 'Primary Attack Disabled',
	description: "This hermit's primary attack is disabled for this turn.",
	applyCondition: (_game, value) => {
		return (
			value instanceof CardComponent &&
			!value.getStatusEffect(PrimaryAttackDisabledEffect)
		)
	},
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent<Card>,
		observer: ObserverComponent,
	): void {
		const {player} = target
		const startBlocking = () => {
			if (player.getActiveHermit()?.entity === target.entity) {
				game.addBlockedActions(effect.entity, 'PRIMARY_ATTACK')
			}

			observer.subscribeBefore(
				player.hooks.onActiveRowChange,
				(_oldHermit, newHermit) => {
					if (newHermit.entity === target.entity)
						game.addBlockedActions(effect.entity, 'PRIMARY_ATTACK')
					else game.removeBlockedActions(effect.entity, 'PRIMARY_ATTACK')
				},
			)
		}
		if (game.currentPlayer.entity === player.entity) startBlocking()
		else observer.subscribeBefore(player.hooks.onTurnStart, startBlocking)

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				effect.remove()
			},
		)
	},
	onRemoval(game, effect, _target, _observer) {
		game.removeBlockedActions(effect.entity, 'PRIMARY_ATTACK')
	},
}

export const SecondaryAttackDisabledEffect: StatusEffect<CardComponent> = {
	...systemStatusEffect,
	id: 'secondary-attack-disabled',
	icon: 'secondary-attack-disabled',
	name: 'Secondary Attack Disabled',
	description: "This hermit's secondary attack is disabled for this turn.",
	applyCondition: (_game, value) => {
		return (
			value instanceof CardComponent &&
			!value.getStatusEffect(SecondaryAttackDisabledEffect)
		)
	},
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent<Card>,
		observer: ObserverComponent,
	): void {
		const {player} = target
		const startBlocking = () => {
			if (player.getActiveHermit()?.entity === target.entity) {
				game.addBlockedActions(effect.entity, 'SECONDARY_ATTACK')
			}

			observer.subscribeBefore(
				player.hooks.onActiveRowChange,
				(_oldHermit, newHermit) => {
					if (newHermit.entity === target.entity)
						game.addBlockedActions(effect.entity, 'SECONDARY_ATTACK')
					else game.removeBlockedActions(effect.entity, 'SECONDARY_ATTACK')
				},
			)
		}
		if (game.currentPlayer.entity === player.entity) startBlocking()
		else observer.subscribeBefore(player.hooks.onTurnStart, startBlocking)

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				effect.remove()
			},
		)
	},
	onRemoval(game, effect, _target, _observer) {
		game.removeBlockedActions(effect.entity, 'SECONDARY_ATTACK')
	},
}
