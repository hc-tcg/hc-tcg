import {Card} from '../cards/base/types'
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
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent<Card>,
		observer: ObserverComponent,
	): void {
		const {player} = target
		observer.subscribe(player.hooks.onTurnStart, () => {
			if (player.getActiveHermit()?.entity === target.entity) {
				game.addBlockedActions(effect.entity, 'PRIMARY_ATTACK')
			}
		})
		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				effect.remove()
			},
		)
	},
}

export const SecondaryAttackDisabledEffect: StatusEffect<CardComponent> = {
	...systemStatusEffect,
	id: 'secondary-attack-disabled',
	icon: 'secondary-attack-disabled',
	name: 'Secondary Attack Disabled',
	description: "This hermit's secondary attack is disabled for this turn.",
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent<Card>,
		observer: ObserverComponent,
	): void {
		const {player} = target
		observer.subscribe(player.hooks.onTurnStart, () => {
			if (player.getActiveHermit()?.entity === target.entity) {
				game.addBlockedActions(effect.entity, 'SECONDARY_ATTACK')
			}
		})
		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				effect.remove()
			},
		)
	},
}
