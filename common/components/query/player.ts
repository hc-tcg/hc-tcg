import {ComponentQuery} from '.'
import {PlayerEntity} from '../../entities'
import {StatusEffect} from '../../status-effects/status-effect'
import {PlayerComponent} from '../player-component'

export function entity(entity: PlayerEntity): ComponentQuery<PlayerComponent> {
	return (_game, player) => player.entity === entity
}

export function uuid(uuid: string): ComponentQuery<PlayerComponent> {
	return (_game, player) => player.uuid === uuid
}

export const currentPlayer: ComponentQuery<PlayerComponent> = (game, player) =>
	player.entity === game.currentPlayerEntity

export function hasStatusEffect(
	statusEffect: StatusEffect,
): ComponentQuery<PlayerComponent> {
	return (_game, player) => {
		return !!player.hasStatusEffect(statusEffect)
	}
}
