import {CardProps} from '../cards/base/types'
import {StatusEffectComponent, CardComponent, ObserverComponent} from '../components'
import {GameModel} from '../models/game-model'
import {
	MultiturnPrimaryAttackDisabledEffect,
	MultiturnSecondaryAttackDisabledEffect,
} from './multiturn-attack-disabled'
import {CardStatusEffect, StatusEffectProps, systemStatusEffect} from './status-effect'

export class AmnesiaEffect extends CardStatusEffect {
	props: StatusEffectProps = {
		...systemStatusEffect,
		icon: 'amnesia',
		name: 'Amnesia',
		description: 'You can not use the attack you used this turn on your next turn.',
	}

	override onApply(
		game: GameModel,
		effect: StatusEffectComponent<CardComponent<CardProps>, StatusEffectProps>,
		target: CardComponent<CardProps>,
		observer: ObserverComponent
	) {
		const {player} = target

		// Add before so health can be checked reliably
		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (attack.type === 'primary') {
				game.components
					.new(StatusEffectComponent, MultiturnPrimaryAttackDisabledEffect)
					.apply(player.getActiveHermit()?.entity)
			} else if (attack.type === 'secondary') {
				game.components
					.new(StatusEffectComponent, MultiturnSecondaryAttackDisabledEffect)
					.apply(player.getActiveHermit()?.entity)
			}
			effect.remove()
		})

		observer.subscribe(player.hooks.onTurnEnd, () => {
			effect.remove()
		})
	}
}
