import {CardPosModel, getCardPos} from './common/models/card-pos-model'
import {GameModel} from './common/models/game-model'
import {StatusEffectInstance} from './common/types/game-state'
import {removeStatusEffect} from './common/utils/board'
import StatusEffect, {
	StatusEffectProps,
	followActiveHermit,
	statusEffect,
} from './common/status-effects/status-effect'

export class InvisibilityPotionHeadsStatusEffect extends StatusEffect {
	props: StatusEffectProps = {
		...statusEffect,
		id: 'invisibility-potion-heads',
		name: 'Invisibility Potion - Heads',
		description: 'Your next attack will miss.',
	}

	public override onApply(
		game: GameModel,
		instance: StatusEffectInstance<StatusEffectProps>,
		pos: CardPosModel
	): void {
		const {player} = pos
		player.hooks.onActiveRowChange.add(instance, followActiveHermit(game, instance))

		player.hooks.beforeAttack.add(instance, (attack) => {
			if (attack.isType('weakness', 'effect', 'status-effect')) return
			attack.multiplyDamage(this.props.id, 0)
		})

		player.hooks.afterAttack.add(instance, () => {
			removeStatusEffect(game, getCardPos(game, instance.target), instance)
		})
	}

	public override onRemoval(
		game: GameModel,
		instance: StatusEffectInstance<StatusEffectProps>,
		pos: CardPosModel
	): void {
		const {player} = pos
		player.hooks.onActiveRowChange.remove(instance)
		player.hooks.afterAttack.remove(instance)
		player.hooks.beforeAttack.remove(instance)
	}
}

export class InvisibilityPotionTailsStatusEffect extends StatusEffect {
	props: StatusEffectProps = {
		...statusEffect,
		id: 'invisibility-potion-tails',
		name: 'Invisibility Potion - Tails',
		description: 'Your next attack will deal double damage.',
	}

	public override onApply(
		game: GameModel,
		instance: StatusEffectInstance<StatusEffectProps>,
		pos: CardPosModel
	): void {
		const {player} = pos
		player.hooks.onActiveRowChange.add(instance, followActiveHermit(game, instance))

		player.hooks.beforeAttack.add(instance, (attack) => {
			if (attack.isType('weakness', 'effect', 'status-effect')) return
			attack.multiplyDamage(this.props.id, 2)
		})

		player.hooks.afterAttack.add(instance, () => {
			removeStatusEffect(game, getCardPos(game, instance.target), instance)
		})
	}

	public override onRemoval(
		game: GameModel,
		instance: StatusEffectInstance<StatusEffectProps>,
		pos: CardPosModel
	): void {
		const {player} = pos
		player.hooks.onActiveRowChange.remove(instance)
	}
}
