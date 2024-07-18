import {CardComponent, PlayerComponent, StatusEffectComponent} from '..'
import {ComponentQuery} from '.'
import {CardStatusEffect, StatusEffect, StatusEffectProps} from '../../status-effects/status-effect'
import {CardEntity, PlayerEntity} from '../../entities'
import * as query from '.'

let STATUS_EFFECTS: Record<any, CardStatusEffect>
import('../../status-effects').then((mod) => (STATUS_EFFECTS = mod.STATUS_EFFECTS))

export function id(id: string): ComponentQuery<StatusEffectComponent> {
	return (_game, statusEffect) => statusEffect.props.id === id
}

export function is(
	...effect: Array<new () => StatusEffect>
): ComponentQuery<StatusEffectComponent> {
	return (_game, statusEffect) =>
		effect.some((e) => STATUS_EFFECTS[e.name].props.id === statusEffect.props.id)
}

export function targetIsPlayerAnd(
	...predicates: Array<ComponentQuery<PlayerComponent>>
): ComponentQuery<StatusEffectComponent> {
	return (game, statusEffect) =>
		statusEffect.target instanceof PlayerComponent &&
		statusEffect.target !== null &&
		query.every(...predicates)(game, statusEffect.target)
}

export function targetIsCardAnd(
	...predicates: Array<ComponentQuery<CardComponent>>
): ComponentQuery<StatusEffectComponent> {
	return (game, statusEffect) =>
		statusEffect.target instanceof CardComponent &&
		statusEffect.target !== null &&
		query.every(...predicates)(game, statusEffect.target)
}

export function targetIs(
	target: CardEntity | PlayerEntity | null | undefined
): ComponentQuery<StatusEffectComponent> {
	return (_game, statusEffect) =>
		statusEffect.targetEntity !== null &&
		target !== null &&
		target !== undefined &&
		target == statusEffect.targetEntity
}

export function type(
	...types: Array<StatusEffectProps['type']>
): ComponentQuery<StatusEffectComponent> {
	return (_game, statusEffect) => types.includes(statusEffect.props.type)
}
