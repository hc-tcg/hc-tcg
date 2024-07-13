import {ComponentQuery, card, slot} from '.'
import {CardComponent, RowComponent} from '..'
import {CardEntity, PlayerEntity, RowEntity} from '../../types/game-state'

export const active: ComponentQuery<RowComponent> = (game, row) =>
	[game.currentPlayer.activeRowEntity, game.opponentPlayer.activeRowEntity].includes(row.entity)

export function player(player: PlayerEntity | null): ComponentQuery<RowComponent> {
	return (game, row) => {
		if (!player) return false
		return row.playerId === player
	}
}

export const currentPlayer: ComponentQuery<RowComponent> = (game, pos) =>
	player(game.currentPlayer.entity)(game, pos)

export const opponentPlayer: ComponentQuery<RowComponent> = (game, pos) =>
	player(game.opponentPlayer.entity)(game, pos)

export const hasHermit: ComponentQuery<RowComponent> = (game, row) =>
	game.components.exists(CardComponent, card.isHermit, card.slot(slot.rowIs(row.entity)))

export function hasCard(cardEntity: CardEntity): ComponentQuery<RowComponent> {
	return (game, row) => {
		let card = game.components.get(cardEntity)
		if (!card?.slot?.onBoard()) return false
		return card.slot.rowEntity === row.entity
	}
}

export function adjacent(adjacentRow: ComponentQuery<RowComponent>): ComponentQuery<RowComponent> {
	return (game, row) => {
		return game.components.filter(RowComponent, adjacentRow).some((adjacentRow) => {
			if (!adjacentRow) return false
			return Math.abs(row.index - adjacentRow.index) == 1
		})
	}
}
