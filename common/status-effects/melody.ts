import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {
	CardStatusEffect,
	StatusEffectProps,
	statusEffect,
} from './status-effect'

class MelodyEffect extends CardStatusEffect {
	props: StatusEffectProps = {
		...statusEffect,
		icon: 'melody',
		name: "Ollie's Melody",
		description:
			'This Hermit heals 10hp every turn until %CREATOR% is knocked out.',
		applyCondition: (_game, card) =>
			card instanceof CardComponent && !card.getStatusEffect(MelodyEffect),
	}

	override onApply(
		_game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = target

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (target.slot.inRow()) target.slot.row.heal(10)
		})

		observer.subscribe(player.hooks.afterDefence, (attack) => {
			if (!attack.isTargeting(target) || attack.target?.health) return
			effect.remove()
		})

		observer.subscribe(effect.creator.player.hooks.afterDefence, (attack) => {
			if (!attack.isTargeting(effect.creator) || attack.target?.health) return
			effect.remove()
		})
	}
}

export default MelodyEffect
