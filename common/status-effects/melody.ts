import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {afterAttack} from '../types/priorities'
import {StatusEffect, statusEffect} from './status-effect'

const MelodyEffect: StatusEffect<CardComponent> = {
	...statusEffect,
	id: 'melody',
	icon: 'melody',
	name: "Ollie's Melody",
	description:
		'This Hermit heals 10hp every turn until %CREATOR% is knocked out.',
	applyCondition: (_game, card) =>
		card instanceof CardComponent && !card.getStatusEffect(MelodyEffect),
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = target

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (target.slot.inRow()) target.slot.row.heal(10)
		})

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(attack) => {
				if (
					(!attack.isTargeting(target) || attack.target?.health) &&
					(attack.isTargeting(effect.creator) || attack.target?.health)
				)
					return
				effect.remove()
			},
		)
	},
}

export default MelodyEffect
