import {LocalGameState} from 'common/types/game-state'
import {LocalMessage, localMessages} from 'logic/messages'
import {put, take} from 'typed-redux-saga'
import {select} from 'typed-redux-saga'
import {getGameState} from './game-selectors'

function getCardPlacedSound(): string {
	return ['sfx/Item_Frame_add_item1.ogg', 'sfx/Item_Frame_add_item2.ogg'][
		Math.floor(Math.random() * 2)
	]
}

function getCardRemovedSound(): string {
	return ['sfx/Item_Frame_remove_item1.ogg', 'sfx/Item_Frame_remove_item2.ogg'][
		Math.floor(Math.random() * 2)
	]
}

function getActiveRowChangedSound(): string {
	return ['sfx/Item_Frame_rotate_item1.ogg', 'sfx/Item_Frame_rotate_item2.ogg'][
		Math.floor(Math.random() * 2)
	]
}

function getDamageTakenSound(): string {
	return [
		'sfx/Player_hurt1.ogg',
		'sfx/Player_hurt2.ogg',
		'sfx/Player_hurt3.ogg',
	][Math.floor(Math.random() * 3)]
}

function countCards(game: LocalGameState) {
	return Object.values(game.players)
		.map(
			(player) =>
				player.board.rows
					.map(
						(row) =>
							Number(row.attach.card !== null) +
							Number(row.hermit.card !== null) +
							row.items.filter((item) => item.card !== null).length,
					)
					.reduce((a, b) => a + b, 0) +
				Number(player.board.singleUse.card !== null),
		)
		.reduce((a, b) => a + b, 0)
}

function checkHasTakenDamage(
	oldGameState: LocalGameState,
	newGameState: LocalGameState,
) {
	for (const player of Object.values(oldGameState.players)) {
		let oldPlayer = oldGameState.players[player.entity]
		let newPlayer = newGameState.players[player.entity]

		for (let i = 0; i < 5; i++) {
			let oldHealth = oldPlayer.board.rows[i].health
			let newHealth = newPlayer.board.rows[i].health
			if (oldHealth === null || newHealth === null) continue

			if (oldHealth < newHealth) return true
		}
	}

	return false
}

function checkHasChangedActiveRow(
	oldGameState: LocalGameState,
	newGameState: LocalGameState,
) {
	if (
		oldGameState.turn.currentPlayerEntity !==
		newGameState.turn.currentPlayerEntity
	)
		return

	return (
		oldGameState.players[oldGameState.turn.currentPlayerEntity].board
			.activeRow !==
		newGameState.players[oldGameState.turn.currentPlayerEntity].board.activeRow
	)
}

/* Diff the new and old game state to figure out what sounds to play */
function getNextSound(
	oldGameState: LocalGameState | null,
	newGameState: LocalGameState | null,
): string | null {
	if (!oldGameState || !newGameState) return null

	if (checkHasChangedActiveRow(oldGameState, newGameState)) {
		return getActiveRowChangedSound()
	}

	if (checkHasTakenDamage(oldGameState, newGameState)) {
		return getDamageTakenSound()
	}

	let oldCardNumber = countCards(oldGameState)
	let newCardNumber = countCards(newGameState)

	if (newCardNumber > oldCardNumber) {
		return getCardPlacedSound()
	}

	if (newCardNumber < oldCardNumber) {
		return getCardRemovedSound()
	}

	return null
}

export default function* gameSoundSaga() {
	let oldGameState = null

	while (true) {
		yield* take(localMessages.GAME_LOCAL_STATE_SET)

		let newGameState = yield* select(getGameState)
		if (!newGameState) continue

		if (oldGameState) {
			let nextSound = getNextSound(oldGameState, newGameState)
			console.log(nextSound)

			if (nextSound) {
				yield* put<LocalMessage>({
					type: localMessages.SOUND_PLAY,
					path: nextSound,
				})
			}
		}

		oldGameState = newGameState
	}
}
