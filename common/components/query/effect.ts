import {StatusEffectComponent} from '..'
import {ComponentQuery} from '.'
import {CardEntity} from '../../types/game-state'

export const damageEffect: ComponentQuery<StatusEffectComponent> = (game, effect) =>
	effect.props.damageEffect == false

export function id(id: string): ComponentQuery<StatusEffectComponent> {
	return (game, statusEffect) => statusEffect.props.id === id
}

export function target(target: CardEntity): ComponentQuery<StatusEffectComponent> {
	return (game, statusEffect) => statusEffect.targetEntity === target
}
