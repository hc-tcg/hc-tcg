import {Predicate, card, slot} from '.'
import {RowComponent} from '../types/components'
import {CardEntity, PlayerEntity} from '../types/game-state'

export const active: Predicate<RowComponent> = (game, row) =>
	[game.currentPlayer.activeRowEntity, game.opponentPlayer.activeRowEntity].includes(row.entity)

export function player(player: PlayerEntity | null): Predicate<RowComponent> {
	return (game, row) => {
		if (!player) return false
		return row.playerId === player
	}
}

export const currentPlayer: Predicate<RowComponent> = (game, pos) =>
	player(game.currentPlayer.entity)(game, pos)

export const opponentPlayer: Predicate<RowComponent> = (game, pos) =>
	player(game.opponentPlayer.entity)(game, pos)

export const hasHermit: Predicate<RowComponent> = (game, row) =>
	game.ecs.somethingFulfills(card.hermit, card.slotFulfills(slot.row(row.entity)))

export function hasCard(cardEntity: CardEntity): Predicate<RowComponent> {
	return (game, row) => {
		let card = game.ecs.get(cardEntity)
		if (!card?.slot?.onBoard()) return false
		return card.slot.rowEntity === row.entity
	}
}
