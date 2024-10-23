import {Card} from '../cards/base/types'
import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {onTurnEnd} from '../types/priorities'
import {Counter, systemStatusEffect} from './status-effect'

// @todo Only disable the proper slots. This is not doable until bloced actions are reworked.

export const MultiturnPrimaryAttackDisabledEffect: Counter<CardComponent> = {
	...systemStatusEffect,
	id: 'multiturn-primary-attack-disabled',
	icon: 'primary-attack-disabled',
	counter: 1,
	counterType: 'turns',
	name: 'Primary Attack Disabled',
	description: (_component) =>
		"This hermit's primary attack is disabled for this turn.",
	applyCondition: (_game, value) => {
		return (
			value instanceof CardComponent &&
			!value.getStatusEffect(MultiturnPrimaryAttackDisabledEffect)
		)
	},
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent<Card>,
		observer: ObserverComponent,
	): void {
		const {player} = target
		if (effect.counter === null) effect.counter = this.counter

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				if (effect.counter === null) return
				if (effect.counter === 0) effect.remove()
				effect.counter--
			},
		)

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (player.getActiveHermit()?.entity === target.entity) {
				game.addBlockedActions(effect.entity, 'PRIMARY_ATTACK')
			}

			observer.subscribe(
				player.hooks.onActiveRowChange,
				(_oldHermit, newHermit) => {
					if (newHermit.entity === target.entity)
						game.addBlockedActions(effect.entity, 'PRIMARY_ATTACK')
					else game.removeBlockedActions(effect.entity, 'PRIMARY_ATTACK')
				},
			)
		})
	},
	onRemoval(game, effect, _target, _observer) {
		game.removeBlockedActions(effect.entity, 'PRIMARY_ATTACK')
	},
}

export const MultiturnSecondaryAttackDisabledEffect: Counter<CardComponent> = {
	...systemStatusEffect,
	id: 'multiturn-secondary-attack-disabled',
	icon: 'secondary-attack-disabled',
	counter: 1,
	counterType: 'turns',
	name: 'Secondary Attack Disabled',
	description: (_component) =>
		"This hermit's secondary attack is disabled for this turn.",
	applyCondition: (_game, value) => {
		return (
			value instanceof CardComponent &&
			!value.getStatusEffect(MultiturnSecondaryAttackDisabledEffect)
		)
	},
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent<Card>,
		observer: ObserverComponent,
	): void {
		const {player} = target
		if (effect.counter === null) effect.counter = this.counter

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				if (effect.counter === null) return
				if (effect.counter === 0) effect.remove()
				effect.counter--
			},
		)

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (player.getActiveHermit()?.entity === target.entity) {
				game.addBlockedActions(effect.entity, 'SECONDARY_ATTACK')
			}

			observer.subscribe(
				player.hooks.onActiveRowChange,
				(_oldHermit, newHermit) => {
					if (newHermit.entity === target.entity)
						game.addBlockedActions(effect.entity, 'SECONDARY_ATTACK')
					else game.removeBlockedActions(effect.entity, 'SECONDARY_ATTACK')
				},
			)
		})
	},
	onRemoval(game, effect, _target, _observer) {
		game.removeBlockedActions(effect.entity, 'SECONDARY_ATTACK')
	},
}
