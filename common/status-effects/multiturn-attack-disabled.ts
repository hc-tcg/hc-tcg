import {Card} from '../cards/base/types'
import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {Counter, StatusEffect, systemStatusEffect} from './status-effect'

// @todo Only disable the proper slots. This is not doable until bloced actions are reworked.

export const MultiturnPrimaryAttackDisabledEffect: Counter<CardComponent> = {
	...systemStatusEffect,
	icon: 'primary-attack-disabled',
	counter: 1,
	counterType: 'turns',
	name: 'Primary Attack Disabled',
	description: "This hermit's primary attack is disabled for this turn.",
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent<Card>,
		observer: ObserverComponent,
	): void {
		const {player} = target
		if (effect.counter === null) effect.counter = this.counter

		observer.subscribe(player.hooks.onTurnEnd, () => {
			if (effect.counter === null) return
			if (effect.counter === 0) effect.remove()
			effect.counter--
		})

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (player.getActiveHermit()?.entity === target.entity) {
				game.addBlockedActions(effect.entity, 'PRIMARY_ATTACK')
			}
		})
	},
}

export const MultiturnSecondaryAttackDisabledEffect: Counter<CardComponent> = {
	...systemStatusEffect,
	icon: 'secondary-attack-disabled',
	counter: 1,
	counterType: 'turns',
	name: 'Secondary Attack Disabled',
	description: "This hermit's secondary attack is disabled for this turn.",
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent<Card>,
		observer: ObserverComponent,
	): void {
		const {player} = target
		if (effect.counter === null) effect.counter = this.counter

		observer.subscribe(player.hooks.onTurnEnd, () => {
			if (effect.counter === null) return
			if (effect.counter === 0) effect.remove()
			effect.counter--
		})

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (player.getActiveHermit()?.entity === target.entity) {
				game.addBlockedActions(effect.entity, 'SECONDARY_ATTACK')
			}
		})
	},
}
