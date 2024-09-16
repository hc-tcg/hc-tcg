import {ComponentQuery} from '.'
import query from '.'
import {CardComponent, PlayerComponent, StatusEffectComponent} from '..'
import {CardEntity, PlayerEntity} from '../../entities'
import {StatusEffect} from '../../status-effects/status-effect'

export function id(id: string): ComponentQuery<StatusEffectComponent> {
	return (_game, statusEffect) => statusEffect.props.icon === id
}

export function is(
	...effect: Array<StatusEffect>
): ComponentQuery<StatusEffectComponent> {
	return (_game, statusEffect) =>
		effect.some((e) => e.name === statusEffect.props.name)
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

export function targetEntity(
	target: CardEntity | PlayerEntity | null | undefined,
): ComponentQuery<StatusEffectComponent> {
	return (_game, statusEffect) =>
		target !== undefined && target == statusEffect.targetEntity
}

export function type(
	...types: Array<StatusEffect['type']>
): ComponentQuery<StatusEffectComponent> {
	return (_game, statusEffect) => types.includes(statusEffect.props.type)
}
