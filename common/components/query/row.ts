import {ComponentQuery} from '.'
import {RowComponent} from '..'
import {CardEntity, PlayerEntity, RowEntity} from '../../entities'

export const active: ComponentQuery<RowComponent> = (game, row) =>
	[
		game.currentPlayer.activeRowEntity,
		game.opponentPlayer.activeRowEntity,
	].includes(row.entity)

export function player(
	player: PlayerEntity | null,
): ComponentQuery<RowComponent> {
	return (_game, row) => {
		if (!player) return false
		return row.playerId === player
	}
}

export const currentPlayer: ComponentQuery<RowComponent> = (game, pos) =>
	player(game.currentPlayer.entity)(game, pos)

export const opponentPlayer: ComponentQuery<RowComponent> = (game, pos) =>
	player(game.opponentPlayer.entity)(game, pos)

/** Check if a row has a Hermit card attached (effect cards do not count) */
export const hasHermit: ComponentQuery<RowComponent> = (_game, row) => {
	return row.hermitSlot.card !== null
}

export function hasCard(cardEntity: CardEntity): ComponentQuery<RowComponent> {
	return (game, row) => {
		let card = game.components.get(cardEntity)
		if (!card?.slot?.onBoard()) return false
		return card.slot.rowEntity === row.entity
	}
}

export function index(rowIndex: number): ComponentQuery<RowComponent> {
	return (_game, row) => row.index === rowIndex
}

export function entity(
	rowEntity: RowEntity | null | undefined,
): ComponentQuery<RowComponent> {
	return (_game, row) => {
		if (!rowEntity) return false
		return row.entity === rowEntity
	}
}

/** Check if a row is next to a row satisfying a condition on the same player */
export function adjacent(
	adjacentRow: ComponentQuery<RowComponent>,
): ComponentQuery<RowComponent> {
	return (game, row) => {
		return game.components
			.filter(RowComponent, adjacentRow, player(row.player.entity))
			.some((adjacentRow) => Math.abs(row.index - adjacentRow.index) === 1)
	}
}
