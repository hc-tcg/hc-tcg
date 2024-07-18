import {ComponentQuery} from '.'
import {PlayerEntity} from '../../entities'
import {PlayerComponent} from '../player-component'

export function entity(entity: PlayerEntity): ComponentQuery<PlayerComponent> {
	return (_game, player) => player.entity === entity
}
