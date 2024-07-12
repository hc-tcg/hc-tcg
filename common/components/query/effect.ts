import {StatusEffectComponent} from '..'
import {ComponentQuery} from '.'
import {CardEntity} from '../../types/game-state'
import {StatusEffectProps} from '../../status-effects/status-effect'

export function id(id: string): ComponentQuery<StatusEffectComponent> {
	return (_game, statusEffect) => statusEffect.props.id === id
}

export function target(target: CardEntity): ComponentQuery<StatusEffectComponent> {
	return (_game, statusEffect) => statusEffect.target?.entity === target
}

export function type(type: StatusEffectProps['type']): ComponentQuery<StatusEffectComponent> {
	return (_game, statusEffect) => statusEffect.props.type === type
}
