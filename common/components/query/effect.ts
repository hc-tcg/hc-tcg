import {StatusEffectComponent} from '../components'
import {Predicate} from '.'
import {CardEntity} from '../../types/game-state'

export const damageEffect: Predicate<StatusEffectComponent> = (game, effect) =>
	effect.props.damageEffect == false

export function id(id: string): Predicate<StatusEffectComponent> {
	return (game, statusEffect) => statusEffect.props.id === id
}

export function target(target: CardEntity): Predicate<StatusEffectComponent> {
	return (game, statusEffect) => statusEffect.targetEntity === target
}
