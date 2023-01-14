import {take, spawn, race, call} from 'redux-saga/effects'
import CARDS from '../cards'

/*
type PlayerState = {
	hand: Array<string>
	rewards: Array<string>
	pile: Array<string>
	discared: Array<string>
	board: {
		actionRow: number
		rows: Array<BoardRow>
	}
}

type GameState = {
	turn: number
	players: Record<string, PlayerState>
}

*/

// TURN ACTIONS:
// 'WAIT_FOR_TURN',
// 'ADD_HERMIT',
// 'PRIMARY_ATTACK',
// 'SECONDARY_ATTACK',
// 'CHANGE_ACTIVE_HERMIT',
// 'PLAY_ITEM_CARD',
// 'PLAY_EFFECT_CARD',
// 'PLAY_SINGLE_USE_CARD',
// 'END_TURN'

function hasEnoughItems(itemCardIds, cost) {
	// transform item cards into cost
	// ['eye_of_ender_2x', 'oak_stairs'] -> ['speedrunner', 'speedrunner', 'builder']
	const energy = itemCardIds.reduce((result, cardId) => {
		const itemCard = CARDS[cardId]
		result.push(itemCard.hermitType)
		// all rare item cards are x2
		if (itemCard.rarity === 'rare') {
			result.push(itemCard.hermitType)
		}
		return result
	}, [])

	const specificCost = cost.filter((item) => item !== 'any')
	const anyCost = cost.filter((item) => item === 'any')
	const hasEnoughSpecific = specificCost.every((costItem) => {
		const index = energy.findIndex((energyItem) => energyItem === costItem)
		if (index === -1) return false
		energy.splice(index, 1)
		return true
	})
	if (!hasEnoughSpecific) return false

	// check if remaining energy is enough to cover required "any" cost
	return energy.length >= anyCost.length
}

function getAvailableActions(pastTurnActions, playerState, opponentState) {
	// TODO - You can't end turn wihtout active hermit
	const actions = ['END_TURN']
	if (
		pastTurnActions.includes('PRIMARY_ATTACK') ||
		pastTurnActions.includes('SECONDARY_ATTACK') ||
		pastTurnActions.includes('CHANGE_ACTIVE_HERMIT')
	) {
		return actions
	}

	// TODO - add more conditions (e.g. you can't change active hermit if there is only one.
	// or you can't add more hermits if all rows are filled)
	actions.push('ADD_HERMIT')

	const {activeRow, rows} = playerState.board
	if (activeRow !== null) {
		actions.push('CHANGE_ACTIVE_HERMIT')
		actions.push('PLAY_EFFECT_CARD')

		const hermitInfo = CARDS[rows[activeRow].hermitCard]
		const itemCards = rows[activeRow].itemCards.filter(Boolean)

		// TODO - check attack cost & item cards available
		if (hasEnoughItems(itemCards, hermitInfo.primary.cost)) {
			actions.push('PRIMARY_ATTACK')
		}
		if (hasEnoughItems(itemCards, hermitInfo.secondary.cost)) {
			actions.push('SECONDARY_ATTACK')
		}
	}

	if (!pastTurnActions.includes('PLAY_ITEM_CARD'))
		actions.push('PLAY_ITEM_CARD')
	if (!pastTurnActions.includes('PLAY_SINGLE_USE_CARD'))
		actions.push('PLAY_SINGLE_USE_CARD')

	return actions
}

function getStarertPack() {
	// ['zombiecleo_common', 'zedaphplays_rare', 'ethoslab_ultra_rare']
	return Object.values(CARDS).map((card) => card.id)
	// .filter((card) => card.type === 'hermit')
}

function getEmptyRow() {
	const MAX_ITEMS = 3
	return {
		hermitCard: null,
		effectCard: null,
		itemCards: new Array(MAX_ITEMS).fill(null),
		health: null,
	}
}

function getPlayerState(players, playerId) {
	const pack = getStarertPack()
	// TODO - ensure there is at least one hermit on the hand

	const TOTAL_ROWS = 5
	return {
		id: playerId,
		playerName: players[playerId].playerName,
		lives: 3,
		hand: pack.slice(0, 160), // 0.7
		rewards: pack.slice(7, 10),
		discarded: [],
		pile: pack.slice(10),
		board: {
			activeRow: null,
			rows: new Array(TOTAL_ROWS).fill(null).map(getEmptyRow),
		},
	}
}

function getGameState(players, playerOneId, playerTwoId) {
	return {
		turn: 0,
		players: {
			[playerOneId]: getPlayerState(players, playerOneId),
			[playerTwoId]: getPlayerState(players, playerTwoId),
		},
	}
}

function makePlayerTake(playerId) {
	return (actionType) => {
		return take(
			(action) => action.type === actionType && action.playerId === playerId
		)
	}
}

function playCardSaga(
	action,
	currentPlayer,
	oppositePlayer,
	pastTurnActions,
	availableActions
) {
	const {cardId, hermitId, rowIndex, slotIndex} = action.payload
	const card = CARDS[cardId]
	console.log('Playing card: ', card)

	if (card.type === 'hermit') {
		if (hermitId) return
		if (!currentPlayer.board.rows[rowIndex]) return
		if (currentPlayer.board.rows[rowIndex].hermitCard) return
		if (!availableActions.includes('ADD_HERMIT')) return
		currentPlayer.board.rows[rowIndex] = {
			...currentPlayer.board.rows[rowIndex],
			hermitCard: cardId,
			health: card.health,
		}
		if (currentPlayer.board.activeRow === null) {
			currentPlayer.board.activeRow = rowIndex
		}
		pastTurnActions.push('ADD_HERMIT')
	} else if (card.type === 'item') {
		if (!hermitId) return
		const hermitRow = currentPlayer.board.rows.find(
			(row) => row.hermitCard === hermitId
		)
		if (!hermitRow) return
		if (hermitRow.itemCards[slotIndex] !== null) return
		if (!availableActions.includes('PLAY_ITEM_CARD')) return
		hermitRow.itemCards[slotIndex] = cardId
		pastTurnActions.push('PLAY_ITEM_CARD')
	} else if (card.type === 'effect') {
		if (!hermitId) return
		const hermitRow = currentPlayer.board.rows.find(
			(row) => row.hermitCard === hermitId
		)
		if (!hermitRow) return
		if (hermitRow.effectCard) return
		if (!availableActions.includes('PLAY_EFFECT_CARD')) return
		hermitRow.effectCard = cardId
		pastTurnActions.push('PLAY_EFFECT_CARD')
	} else if (card.type === 'single_use') {
		const targetRow = oppositePlayer.board.rows[oppositePlayer.board.activeRow]
		if (!availableActions.includes('PLAY_SINGLE_USE_CARD')) return
		switch (card.id) {
			case 'iron_sword':
				targetRow.health -= 20
				break
			case 'diamond_sword':
				targetRow.health -= 40
				break
			case 'netherite_sword':
				targetRow.health -= 60
				break
			default:
				console.log('Unknown effect: ', card.id)
		}
		pastTurnActions.push('PLAY_SINGLE_USE_CARD')
	}

	// TODO change to card instance rather than card id
	currentPlayer.hand = currentPlayer.hand.filter((cardId) => cardId != card.id)
}

// return false in case one player is dead
function* checkHermitHealth(gameState) {
	// TODO - In next turn the oponnent must pick new active hermit
	const playerStates = Object.values(gameState.players)
	for (let playerState of playerStates) {
		const playerRows = playerState.board.rows
		const activeRow = playerState.board.activeRow
		for (let rowIndex in playerRows) {
			const row = playerRows[rowIndex]
			if (row.hermitCard && row.health <= 0) {
				playerRows[rowIndex] = getEmptyRow()
				if (rowIndex === activeRow) {
					playerState.board.activeRow = null
				}
				playerState.lives -= 1
			}
		}

		const isDead = playerState.lives <= 0
		const noHermitsLeft =
			gameState.turn > 1 &&
			playerState.board.rows.every((row) => !row.hermitCard)
		if (isDead || noHermitsLeft) {
			console.log('Player dead: ', {
				isDead,
				noHermitsLeft,
				turn: gameState.turn,
			})
			return false
		}
	}

	return true
}

// TODO - send list of allowed actions together with game state
function* startGameSaga(players, playerOneId, playerTwoId) {
	const gameState = getGameState(players, playerOneId, playerTwoId)

	while (true) {
		gameState.turn++
		const pastTurnActions = []

		const currentPlayer =
			gameState.turn % 2 === 0
				? gameState.players[playerOneId]
				: gameState.players[playerTwoId]
		const oppositePlayer =
			gameState.turn % 2 === 0
				? gameState.players[playerTwoId]
				: gameState.players[playerOneId]

		console.log('NEW TURN: ', playerOneId, 'vs', playerTwoId)
		const takeP = makePlayerTake(currentPlayer.id)

		while (true) {
			// TODO - check availableActions on server
			// TODO - Decide player order
			// TODO - Make sure on servver that player waiting for turn can't make actions

			const availableActions = getAvailableActions(
				pastTurnActions,
				currentPlayer,
				oppositePlayer
			)
			players[playerOneId].socket.emit('GAME_STATE', {
				type: 'GAME_STATE',
				payload: {
					gameState,
					opponentId: playerTwoId,
					availableActions:
						gameState.turn % 2 === 0 ? availableActions : ['WAIT_FOR_TURN'],
				},
			})
			players[playerTwoId].socket.emit('GAME_STATE', {
				type: 'GAME_STATE',
				payload: {
					gameState,
					opponentId: playerOneId,
					availableActions:
						gameState.turn % 2 !== 0 ? availableActions : ['WAIT_FOR_TURN'],
				},
			})

			console.log('Waiting for turn action')

			const turnAction = yield race({
				playCard: takeP('PLAY_CARD'),
				changeActiveHermit: takeP('CHANGE_ACTIVE_HERMIT'),
				attack: takeP('ATTACK'),
				endTurn: takeP('END_TURN'),
			})

			console.log('TURN ACTION: ', Object.keys(turnAction)[0])
			if (turnAction.playCard) {
				yield call(
					playCardSaga,
					turnAction.playCard,
					currentPlayer,
					oppositePlayer,
					pastTurnActions,
					availableActions
				)
			} else if (turnAction.changeActiveHermit) {
				if (!availableActions.includes('CHANGE_ACTIVE_HERMIT')) continue
				const hermitId = turnAction.changeActiveHermit.payload.hermitId
				// handle if no result
				currentPlayer.board.activeRow = currentPlayer.board.rows.findIndex(
					(row) => row.hermitCard === hermitId
				)
				pastTurnActions.push('CHANGE_ACTIVE_HERMIT')
			} else if (turnAction.attack) {
				const {type} = turnAction.attack.payload
				const typeAction =
					type === 'primary' ? 'PRIMARY_ATTACK' : 'SECONDARY_ATTACK'
				if (!availableActions.includes(typeAction)) continue
				// TODO - send hermitId from frontend for validation?
				const hermitId =
					currentPlayer.board.rows[currentPlayer.board.activeRow].hermitCard
				const hermitInfo = CARDS[hermitId]
				const attackInfo =
					hermitInfo[type === 'primary' ? 'primary' : 'secondary']
				const targetRow =
					oppositePlayer.board.rows[oppositePlayer.board.activeRow]
				// you can't attack on first turn
				// handle if not enough items
				// handle if no result
				targetRow.health -= attackInfo.damage

				pastTurnActions.push(typeAction)
			} else if (turnAction.endTurn) {
				if (!availableActions.includes('END_TURN')) continue
				break
			} else {
				// handle unknown action
			}

			const playersAlive = yield call(checkHermitHealth, gameState)
			if (!playersAlive) break
		}

		// TODO - Inform player if he won
		const playersAlive = yield call(checkHermitHealth, gameState)
		if (!playersAlive) {
			players[playerOneId].socket.emit('GAME_END', {
				type: 'GAME_END',
				payload: {
					gameState,
				},
			})
			players[playerTwoId].socket.emit('GAME_END', {
				type: 'GAME_END',
				payload: {
					gameState,
				},
			})
			break
		}
		// TODO - draw card
	}
}

function* gameSaga(players) {
	while (true) {
		const firstRequest = yield take('JOIN_GAME')
		console.log('first player waiting')
		const result = yield race({
			secondRequest: take('JOIN_GAME'),
			disconnected: take(
				(action) =>
					action.type === 'PLAYER_DISCONNECTED' &&
					firstRequest.playerId === action.playerId
			),
		})
		if (result.secondRequest) {
			console.log('second player connected, starting game')
			yield spawn(
				startGameSaga,
				players,
				firstRequest.playerId,
				result.secondRequest.playerId
			)
		}
	}
}

export default gameSaga
