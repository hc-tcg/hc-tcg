import {CardComponent, StatusEffectComponent} from '../components'
import {GameModel} from '../models/game-model'
import {CardStatusEffect, StatusEffectProps, statusEffect} from './status-effect'

export class InvisibilityPotionHeads extends CardStatusEffect {
	props: StatusEffectProps = {
		...statusEffect,
		id: 'invisibility-potion-heads',
		name: 'Invisibility Potion - Heads',
		description: 'Your next attack will miss.',
	}

	public override onApply(
		game: GameModel,
		instance: StatusEffectComponent,
		pos: CardComponent
	): void {
		const {player} = pos
		player.hooks.beforeAttack.add(instance, (attack) => {
			if (attack.isType('weakness', 'effect', 'status-effect')) return
			attack.multiplyDamage(this.props.id, 0)
		})

		player.hooks.afterAttack.add(instance, () => {
			removeStatusEffect(game, getCardPos(game, instance.targetInstance), instance)
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

export class InvisibilityPotionTails extends CardStatusEffect {
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
			removeStatusEffect(game, getCardPos(game, instance.targetInstance), instance)
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
