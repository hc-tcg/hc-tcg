import {ComponentQuery} from '.'
import {PlayerEntity} from '../../entities'
import {StatusEffect} from '../../status-effects/status-effect'
import {PlayerComponent} from '../player-component'

export function entity(entity: PlayerEntity): ComponentQuery<PlayerComponent> {
	return (_game, player) => player.entity === entity
}

export const currentPlayer: ComponentQuery<PlayerComponent> = (game, player) =>
	player.entity === game.currentPlayerEntity

export function hasStatusEffect(
	statusEffect: new () => StatusEffect
): ComponentQuery<PlayerComponent> {
	return (_game, player) => {
		return !!player.hasStatusEffect(statusEffect)
	}
}

export function id(id: string): ComponentQuery<PlayerComponent> {
	return (_game, player) => {
		return player.id === id
	}
}