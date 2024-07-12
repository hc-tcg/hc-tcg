import {StatusEffectComponent} from '..'
import {ComponentQuery} from '.'
import {CardEntity} from '../../types/game-state'

export const normal: ComponentQuery<StatusEffectComponent> = (_game, effect) =>
	effect.props.type == 'normal'

export const damage: ComponentQuery<StatusEffectComponent> = (_game, effect) =>
	effect.props.type == 'damage'

export const system: ComponentQuery<StatusEffectComponent> = (_game, effect) =>
	effect.props.type == 'system'

export const hiddenSystem: ComponentQuery<StatusEffectComponent> = (_game, effect) =>
	effect.props.type == 'hiddenSystem'

export function id(id: string): ComponentQuery<StatusEffectComponent> {
	return (_game, statusEffect) => statusEffect.props.id === id
}

export function target(target: CardEntity): ComponentQuery<StatusEffectComponent> {
	return (_game, statusEffect) => statusEffect.target?.entity === target
}
