import {CARDS, HERMIT_CARDS, ITEM_CARDS} from 'common/cards'
import {GameModel} from 'common/models/game-model'
import {
	AttackActionData,
	ChangeActiveHermitActionData,
	PlayCardActionData,
} from 'common/types/action-data'
import {CardT, PlayerState} from 'common/types/game-state'
import {hasEnoughEnergy} from 'common/utils/attacks'
import {getActiveRow, getNonEmptyRows} from 'common/utils/board'
import {getCardCost} from 'common/utils/ranks'
import {checkHermitHealth, sendGameState} from '../game'
import {PickInfo} from 'common/types/server-requests'
import attackSaga from '../turn-actions/attack'
import pickRequestSaga from '../turn-actions/pick-request'
import changeActiveHermitSaga from '../turn-actions/change-active-hermit'
import playCardSaga from '../turn-actions/play-card'
import {all, call, delay, put} from 'typed-redux-saga'
import {EnergyT, RowPos} from 'common/types/cards'
import {getItemCardsEnergy} from '../../utils'
import {applySingleUse} from 'common/utils/board'

function getRandomDelay() {
	return Math.random() * 500 + 500
}

function getEmptyIndexes(player: PlayerState) {
	const indexes = []
	for (var i = 0; i < player.board.rows.length; i++) {
		if (!player.board.rows[i].hermitCard) indexes.push(i)
	}
	return indexes
}

function sortedRowsByTokens(player: PlayerState): Array<RowPos> {
	const rows = getNonEmptyRows(player, true)
	return rows.sort((a, b) => {
		const aCost = getCardCost(CARDS[a.row.hermitCard.cardId])
		const bCost = getCardCost(CARDS[b.row.hermitCard.cardId])

		return bCost - aCost
	})
}

function getSomewhatPoweredUpAFKHermits(game: GameModel, player: PlayerState): Array<RowPos> {
	const rows = sortedRowsByTokens(player)
	return rows.filter((row) => {
		const allowedAttacks = availableAttacks(player, row.rowIndex)
		if (allowedAttacks.includes('secondary') || getItemCardsEnergy(game, row.row) === 0) {
			return false
		}
		return true
	})
}

function availableAttacks(player: PlayerState, rowIndex: number | null): Array<string> {
	if (rowIndex === null) return []
	const row = player.board.rows[rowIndex]

	const energy = row.itemCards.flatMap((item) => {
		const output = []
		if (item && item.cardId.includes('rare')) output.push(ITEM_CARDS[item.cardId].hermitType)
		if (item) output.push(ITEM_CARDS[item.cardId].hermitType)
		return output as EnergyT[]
	})

	if (!row.hermitCard) return []

	const hermit = HERMIT_CARDS[row.hermitCard.cardId]

	const output = []

	if (hasEnoughEnergy(energy, hermit.primary.cost)) output.push('primary')
	if (hasEnoughEnergy(energy, hermit.secondary.cost)) output.push('secondary')

	return output
}

function* playHermitCards(game: GameModel, card: CardT) {
	const freeRows = getEmptyIndexes(game.currentPlayer)
	const chosenRow = freeRows[Math.floor(Math.random() * freeRows.length)]
	const turnAction: PlayCardActionData = {
		type: 'PLAY_HERMIT_CARD',
		payload: {
			pickInfo: {
				playerId: game.currentPlayer.id,
				rowIndex: chosenRow,
				card: card,
				slot: {
					type: 'hermit',
					index: 0,
				},
			},
			card: card,
		},
	}
	yield* call(playCardSaga, game, turnAction)
	yield delay(getRandomDelay())
	yield call(sendGameState, game)
}

function* changeActiveHermit(game: GameModel) {
	const otherPlayerHermit = game.opponentActiveRow?.hermitCard?.cardId
	if (!otherPlayerHermit) return
	const otherPlayerAttack = HERMIT_CARDS[otherPlayerHermit].secondary.damage

	if (
		game.activeRow &&
		game.activeRow?.health &&
		game.activeRow.health > otherPlayerAttack + 20 &&
		game.currentPlayer.lives > 1
	)
		return
	const sortedRows = sortedRowsByTokens(game.currentPlayer)

	if (sortedRows.length === 0) return

	const turnAction: ChangeActiveHermitActionData = {
		type: 'CHANGE_ACTIVE_HERMIT',
		payload: {
			pickInfo: {
				card: sortedRows[0].row.hermitCard,
				rowIndex: sortedRows[0].rowIndex,
				playerId: game.currentPlayer.id,
				slot: {
					type: 'hermit',
					index: 0,
				},
			},
		},
	}
	yield* call(changeActiveHermitSaga, game, turnAction)
	yield delay(getRandomDelay())
	yield call(sendGameState, game)
}

function* playItemCards(game: GameModel, card: CardT) {
	var currentRowIndex = null
	const fullyPowered = availableAttacks(
		game.currentPlayer,
		game.currentPlayer.board.activeRow
	).includes('secondary')
	const somewhatPoweredRows = getSomewhatPoweredUpAFKHermits(game, game.currentPlayer)
	const sortedRows = sortedRowsByTokens(game.currentPlayer).filter((row) => {
		somewhatPoweredRows.some((subrow) => subrow.rowIndex !== row.rowIndex)
	})

	if (!fullyPowered) {
		currentRowIndex = game.currentPlayer.board.activeRow
	} else if (somewhatPoweredRows.length > 0) {
		currentRowIndex = somewhatPoweredRows[0].rowIndex
	} else if (sortedRows.length > 0) {
		currentRowIndex = sortedRows[0].rowIndex
	}

	if (currentRowIndex === null) return

	const turnAction: PlayCardActionData = {
		type: 'PLAY_ITEM_CARD',
		payload: {
			pickInfo: {
				playerId: game.currentPlayer.id,
				rowIndex: currentRowIndex,
				card: card,
				slot: {
					type: 'item',
					index: game.currentPlayer.board.rows[currentRowIndex].itemCards.findIndex(
						(card) => !card
					),
				},
			},
			card: card,
		},
	}
	yield* call(playCardSaga, game, turnAction)
	yield delay(getRandomDelay())
	yield call(sendGameState, game)
}

function* attack(game: GameModel) {
	yield delay(getRandomDelay())
	const activeRowIndex = game.currentPlayer.board.activeRow
	if (activeRowIndex === null) return
	const allowedMoves = availableAttacks(game.currentPlayer, activeRowIndex)
	const activeHermit = getActiveRow(game.currentPlayer)?.hermitCard
	if (activeHermit === undefined || allowedMoves.length === 0) return
	const turnAction: AttackActionData = {
		type: allowedMoves.includes('secondary') ? 'SECONDARY_ATTACK' : 'PRIMARY_ATTACK',
		payload: {
			playerId: game.currentPlayer.id,
		},
	}
	yield* call(attackSaga, game, turnAction)

	switch (activeHermit.cardId) {
		case 'zombiecleo_rare':
			const afkHermits = getNonEmptyRows(game.currentPlayer, true)
			if (afkHermits.length === 0) return
			const pickResult: PickInfo = {
				playerId: game.currentPlayer.id,
				card: afkHermits[Math.floor(Math.random() * afkHermits.length)].row.hermitCard,
				slot: {
					type: 'hermit',
					index: 0,
				},
			}
			yield* call(pickRequestSaga, game, pickResult)
		default:
			return
	}
}

function* playSingleUseCard(game: GameModel, card: CardT) {
	// Make sure only to use draw cards when opponent has no active
	const turnAction: PlayCardActionData = {
		type: 'PLAY_SINGLE_USE_CARD',
		payload: {
			pickInfo: {
				playerId: game.currentPlayer.id,
				rowIndex: 0,
				card: card,
				slot: {
					type: 'single_use',
					index: 0,
				},
			},
			card: card,
		},
	}

	switch (card.cardId) {
		case 'fishing_rod':
			yield* call(playCardSaga, game, turnAction)
			yield* call(sendGameState, game)
			yield* delay(getRandomDelay())
			applySingleUse(game)
			return
		case 'composter':
			return
		case 'target_block':
			return
		case 'fortune':
			if (game.opponentActiveRow === null) return
			yield* call(playCardSaga, game, turnAction)
			yield* call(sendGameState, game)
			yield* delay(getRandomDelay())
			applySingleUse(game)
		default:
			if (game.opponentActiveRow === null) return
			yield* call(playCardSaga, game, turnAction)
	}

	yield* call(sendGameState, game)
}

export function* virtualTurnActionsSaga(game: GameModel): Generator<any> {
	yield* call(sendGameState, game)
	const currentPlayer = game.currentPlayer

	// First, order hand by token cost. This makes more powerful cards played first
	currentPlayer.hand.sort((a, b) => {
		const firstInfo = CARDS[a.cardId]
		const secondInfo = CARDS[b.cardId]
		return getCardCost(secondInfo) - getCardCost(firstInfo)
	})

	yield delay(getRandomDelay())

	// Pick active Hermit if none
	yield* call(changeActiveHermit, game)

	// Play all cards that are possible
	const handList = [...currentPlayer.hand]
	for (var i = 0; i < handList.length; i++) {
		const disallowedActions = [...game.getAllBlockedActions(), ...game.state.turn.completedActions]
		const card = handList[i]
		const cardInfo = CARDS[card.cardId]
		if (cardInfo.type === 'hermit' && !disallowedActions.includes('PLAY_HERMIT_CARD')) {
			yield* call(playHermitCards, game, card)
		}
		if (cardInfo.type === 'item' && !disallowedActions.includes('PLAY_ITEM_CARD')) {
			yield* call(playItemCards, game, card)
		}
		if (cardInfo.type === 'single_use' && !disallowedActions.includes('PLAY_SINGLE_USE_CARD')) {
			yield* call(playSingleUseCard, game, card)
		}
	}
	yield* call(sendGameState, game)

	// ATTACK!!!!!
	yield* call(attack, game)
	yield* call(sendGameState, game)

	if (game.currentPlayer.coinFlips.length !== 0) {
		yield* delay(2600 * game.currentPlayer.coinFlips.length)
	}

	game.currentPlayer.coinFlips = []

	const deadPlayerIds = yield* call(checkHermitHealth, game)
	if (deadPlayerIds.length) {
		game.endInfo.reason = game.state.players[deadPlayerIds[0]].lives <= 0 ? 'lives' : 'hermits'
		game.endInfo.deadPlayerIds = deadPlayerIds
		return 'GAME_END'
	}

	yield* call(sendGameState, game)

	yield delay(getRandomDelay())
}
