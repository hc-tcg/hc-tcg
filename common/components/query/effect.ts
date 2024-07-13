import {CardComponent, StatusEffectComponent} from '..'
import {ComponentQuery} from '.'
import StatusEffect, {StatusEffectProps} from '../../status-effects/status-effect'

let STATUS_EFFECTS: Record<any, StatusEffect>
import('../../status-effects').then((mod) => (STATUS_EFFECTS = mod.STATUS_EFFECTS))

export function id(id: string): ComponentQuery<StatusEffectComponent> {
	return (_game, statusEffect) => statusEffect.props.id === id
}

export function is(effect: new () => StatusEffect): ComponentQuery<StatusEffectComponent> {
	return (_game, statusEffect) => STATUS_EFFECTS[effect.name].props.id == statusEffect.props.id
}

export function target(
	target: ComponentQuery<CardComponent>
): ComponentQuery<StatusEffectComponent> {
	return (game, statusEffect) => statusEffect.target !== null && target(game, statusEffect.target)
}

export function type(type: StatusEffectProps['type']): ComponentQuery<StatusEffectComponent> {
	return (_game, statusEffect) => statusEffect.props.type === type
}
