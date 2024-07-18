import {CardProps} from '../cards/base/types'
import {StatusEffectComponent, CardComponent, ObserverComponent} from '../components'
import {GameModel} from '../models/game-model'
import {CardStatusEffect, StatusEffectProps, hiddenStatusEffect} from './status-effect'

// @todo Only disable the proper slots. This is not doable until bloced actions are reworked.

export class PrimaryAttackDisabledEffect extends CardStatusEffect {
	props: StatusEffectProps = {
		...hiddenStatusEffect,
		id: 'primary-attack-disabled',
		name: 'Primary Attack Disabled',
		description: "This hermit's primary attack is disabled for this turn.",
	}

	public override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent<CardProps>,
		observer: ObserverComponent
	): void {
		const {player} = target
		observer.subscribe(player.hooks.onTurnStart, () => {
			if (player.getActiveHermit()?.entity === target.entity) {
				game.addBlockedActions(effect.entity, 'PRIMARY_ATTACK')
			}
		})
		observer.subscribe(player.hooks.onTurnEnd, () => {
			effect.remove()
		})
	}
}

export class SecondaryAttackDisabledEffect extends CardStatusEffect {
	props: StatusEffectProps = {
		...hiddenStatusEffect,
		id: 'secondary-attack-disabled',
		name: 'Secondary Attack Disabled',
		description: "This hermit's secondary attack is disabled for this turn.",
	}

	public override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent<CardProps>,
		observer: ObserverComponent
	): void {
		const {player} = target
		observer.subscribe(player.hooks.onTurnStart, () => {
			if (player.getActiveHermit()?.entity === target.entity) {
				game.addBlockedActions(effect.entity, 'SECONDARY_ATTACK')
			}
		})
		observer.subscribe(player.hooks.onTurnEnd, () => {
			effect.remove()
		})
	}
}
