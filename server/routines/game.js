import {take, spawn, actionChannel, call} from 'redux-saga/effects'
import {buffers} from 'redux-saga'
import CARDS from '../cards'
import DAMAGE from '../const/damage'
import PROTECTION from '../const/protection'

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

const ATTACK_TO_ACTION = {
	primary: 'PRIMARY_ATTACK',
	secondary: 'SECONDARY_ATTACK',
	zero: 'ZERO_ATTACK',
}

function hasEnoughItems(itemCards, cost) {
	const itemCardIds = itemCards.map((card) => card.cardId)
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

function getAvailableActions(
	turn,
	pastTurnActions,
	playerState,
	opponentState
) {
	const actions = []
	if (playerState.board.activeRow !== null) {
		actions.push('END_TURN')
	}
	if (
		pastTurnActions.includes('PRIMARY_ATTACK') ||
		pastTurnActions.includes('SECONDARY_ATTACK') ||
		pastTurnActions.includes('ZERO_ATTACK') ||
		pastTurnActions.includes('CHANGE_ACTIVE_HERMIT')
	) {
		return actions
	}

	// TODO - add more conditions (e.g. you can't change active hermit if there is only one.
	// or you can't add more hermits if all rows are filled)
	actions.push('ADD_HERMIT')

	// nemuzu zmenit aktivniho hermita kdyz neni zadne ve hre
	// nebo kdyz mam jen jendoho ktery uz je aktivni
	const hasOtherHermit = playerState.board.rows.some(
		(row, index) => row.hermitCard && index !== playerState.board.activeRow
	)
	if (hasOtherHermit) {
		actions.push('CHANGE_ACTIVE_HERMIT')
	}

	const {activeRow, rows} = playerState.board
	if (activeRow !== null) {
		actions.push('PLAY_EFFECT_CARD')

		if (turn > 1) {
			const hermitInfo = CARDS[rows[activeRow].hermitCard.cardId]
			const itemCards = rows[activeRow].itemCards.filter(Boolean)

			actions.push('ZERO_ATTACK')
			if (hasEnoughItems(itemCards, hermitInfo.primary.cost)) {
				actions.push('PRIMARY_ATTACK')
			}
			if (hasEnoughItems(itemCards, hermitInfo.secondary.cost)) {
				actions.push('SECONDARY_ATTACK')
			}
		}
	}

	if (!pastTurnActions.includes('PLAY_ITEM_CARD'))
		actions.push('PLAY_ITEM_CARD')
	if (!pastTurnActions.includes('PLAY_SINGLE_USE_CARD'))
		actions.push('PLAY_SINGLE_USE_CARD')

	return actions
}

function getStarterPack() {
	// ['zombiecleo_common', 'zedaphplays_rare', 'ethoslab_ultra_rare']
	/*
	// Give all cards
	return Object.values(CARDS).map((card) => ({
		// type of card
		cardId: card.id,
		// unique identifier of this specific card instance
		cardInstance: Math.random() + '_' + Math.random(),
	}))
	*/
	// TODO - Beef had 42 cards in decks for TangoVsXisuma match (also in EP41 he said 42 is max)
	const allCards = Object.values(CARDS).sort(() => 0.5 - Math.random())
	const hermits = allCards.filter((card) => card.type === 'hermit').slice(0, 9)
	let items = allCards
		.filter(
			(card) =>
				card.type === 'item' &&
				hermits.find((hermitCard) => hermitCard.hermitType === card.hermitType)
		)
		.slice(0, 8)
	items = [...items, ...items]
	const otherCards = allCards
		.filter((card) => !['hermit', 'item'].includes(card.type))
		.filter((card) =>
			[...Object.keys(DAMAGE), ...Object.keys(PROTECTION)].includes(card.id)
		)
		.slice(0, 17)

	const pack = [...hermits, ...items, ...otherCards].map((card) => ({
		// type of card
		cardId: card.id,
		// unique identifier of this specific card instance
		cardInstance: Math.random() + '_' + Math.random(),
	}))

	// shuffle cards
	pack.sort(() => 0.5 - Math.random())

	// ensure a hermit in first 5 cards
	const firstHermitIndex = pack.findIndex(
		(card) => CARDS[card.cardId].type === 'hermit'
	)
	if (firstHermitIndex > 5) {
		;[pack[0], pack[firstHermitIndex]] = [pack[firstHermitIndex], pack[0]]
	}

	return pack

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

function getPlayerState(allPlayers, playerId) {
	const pack = getStarterPack()
	// TODO - ensure there is at least one hermit on the hand
	// OR - If there is no hermit, show the cards to the opposite player, reshuffle and draw again
	// TODO - put discarded cards into discarded array
	// TODO - strenghs/weaknesses -> 20 extra damage for prmary/secondayr attack

	const TOTAL_ROWS = 5
	return {
		id: playerId,
		playerName: allPlayers[playerId].playerName,
		lives: 3,
		hand: pack.slice(0, 7), // 0.7
		// TODO - hand out reward cards on kill
		rewards: pack.slice(7, 10),
		discarded: [],
		pile: pack.slice(10),
		board: {
			activeRow: null,
			singleUseCard: null,
			singleUseCardUsed: false,
			rows: new Array(TOTAL_ROWS).fill(null).map(getEmptyRow),
		},
	}
}

function getGameState(allPlayers, gamePlayerIds) {
	if (Math.random() > 0.5) gamePlayerIds.reverse()
	return {
		turn: 0,
		order: gamePlayerIds,
		players: gamePlayerIds.reduce(
			(playerStates, playerId) => ({
				...playerStates,
				[playerId]: getPlayerState(allPlayers, playerId),
			}),
			{}
		),
	}
}

function playerAction(actionType, playerId) {
	return (action) => action.type === actionType && action.playerId === playerId
}

function equalCard(card1, card2) {
	if (card1 === null || card2 === null) return false
	return (
		card1.cardId === card2.cardId && card1.cardInstance === card2.cardInstance
	)
}

function playCardSaga(
	action,
	currentPlayer,
	opponentPlayer,
	pastTurnActions,
	availableActions
) {
	const {card, rowHermitCard, rowIndex, slotIndex} = action.payload
	const cardInfo = CARDS[card.cardId]
	console.log('Playing card: ', card.cardId)

	if (!currentPlayer.hand.find((handCard) => equalCard(handCard, card))) return

	if (cardInfo.type === 'hermit') {
		if (rowHermitCard) return
		if (!currentPlayer.board.rows[rowIndex]) return
		if (currentPlayer.board.rows[rowIndex].hermitCard) return
		if (!availableActions.includes('ADD_HERMIT')) return
		currentPlayer.board.rows[rowIndex] = {
			...currentPlayer.board.rows[rowIndex],
			hermitCard: card,
			health: cardInfo.health,
		}
		if (currentPlayer.board.activeRow === null) {
			currentPlayer.board.activeRow = rowIndex
		}
		pastTurnActions.push('ADD_HERMIT')
	} else if (cardInfo.type === 'item') {
		if (!rowHermitCard) return
		const hermitRow = currentPlayer.board.rows.find((row) =>
			equalCard(row.hermitCard, rowHermitCard)
		)
		if (!hermitRow) return
		if (hermitRow.itemCards[slotIndex] !== null) return
		if (!availableActions.includes('PLAY_ITEM_CARD')) return
		hermitRow.itemCards[slotIndex] = card
		pastTurnActions.push('PLAY_ITEM_CARD')
	} else if (cardInfo.type === 'effect') {
		if (!rowHermitCard) return
		const hermitRow = currentPlayer.board.rows.find((row) =>
			equalCard(row.hermitCard, rowHermitCard)
		)
		if (!hermitRow) return
		if (hermitRow.effectCard) return
		if (!availableActions.includes('PLAY_EFFECT_CARD')) return
		hermitRow.effectCard = card
		pastTurnActions.push('PLAY_EFFECT_CARD')
	} else if (cardInfo.type === 'single_use') {
		// TODO - dont apply single_use card on effect slot (or any other row slot)
		// TODO - INFO - fire/poison damage is applied first when it is used and then at the beginning of a turn of the player that use the effect
		// TODO - INFO - Golden Axe ignored totem of undying (that is it kills the opponent's hermit regardless)
		const targetRow = opponentPlayer.board.rows[opponentPlayer.board.activeRow]
		if (!availableActions.includes('PLAY_SINGLE_USE_CARD')) return
		if (currentPlayer.board.singleUseCard) return
		currentPlayer.board.singleUseCard = card
		pastTurnActions.push('PLAY_SINGLE_USE_CARD')
	}

	currentPlayer.hand = currentPlayer.hand.filter(
		(handCard) => !equalCard(handCard, card)
	)
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
				if (Number(rowIndex) === activeRow) {
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

function* gameSaga(allPlayers, gamePlayerIds) {
	// TODO - gameState should be changed only in immutable way so that we can check its history
	const gameState = getGameState(allPlayers, gamePlayerIds)
	let turnActionChannel = null

	while (true) {
		gameState.turn++
		const pastTurnActions = []

		// TODO - respect gameState.order
		const currentPlayerId = gameState.order[(gameState.turn + 1) % 2]
		const opponentPlayerId = gameState.order[gameState.turn % 2]
		const currentPlayer = gameState.players[currentPlayerId]
		const opponentPlayer = gameState.players[opponentPlayerId]

		gameState.turnPlayerId = currentPlayer.id

		console.log('NEW TURN: ', {currentPlayerId, opponentPlayerId})

		if (turnActionChannel) turnActionChannel.close()
		turnActionChannel = yield actionChannel(
			['PLAY_CARD', 'CHANGE_ACTIVE_HERMIT', 'ATTACK', 'END_TURN'].map((type) =>
				playerAction(type, currentPlayer.id)
			),
			buffers.dropping(10)
		)

		while (true) {
			// TODO - Decide player order
			// TODO - Make sure on server that player waiting for turn can't make actions

			const availableActions = getAvailableActions(
				gameState.turn,
				pastTurnActions,
				currentPlayer,
				opponentPlayer
			)
			// TODO - omit state clients shouldn't see (e.g. other players hand, either players pile etc.)
			gamePlayerIds.forEach((playerId) => {
				allPlayers[playerId].socket.emit('GAME_STATE', {
					type: 'GAME_STATE',
					payload: {
						gameState,
						opponentId: gamePlayerIds.find((id) => id !== playerId),
						availableActions:
							playerId === currentPlayerId
								? availableActions
								: ['WAIT_FOR_TURN'],
					},
				})
			})

			console.log('Waiting for turn action')

			const turnAction = yield take(turnActionChannel)

			// TODO - avoid having socket in actions
			const {socket, ...logTurnAction} = turnAction
			console.log('TURN ACTION: ', logTurnAction)
			if (turnAction.type === 'PLAY_CARD') {
				yield call(
					playCardSaga,
					turnAction,
					currentPlayer,
					opponentPlayer,
					pastTurnActions,
					availableActions
				)
			} else if (turnAction.type === 'CHANGE_ACTIVE_HERMIT') {
				if (!availableActions.includes('CHANGE_ACTIVE_HERMIT')) continue
				const rowHermitCard = turnAction.payload.rowHermitCard
				const result = currentPlayer.board.rows.findIndex((row) =>
					equalCard(row.hermitCard, rowHermitCard)
				)
				if (result >= 0) {
					currentPlayer.board.activeRow = result
				}
				// TODO - Don't block other actions if this happens after a hermit is killed
				pastTurnActions.push('CHANGE_ACTIVE_HERMIT')
			} else if (turnAction.type === 'ATTACK') {
				const {type} = turnAction.payload
				const typeAction = ATTACK_TO_ACTION[type]
				if (!typeAction) {
					console.log('Unknown attack type: ', type)
					continue
				}
				if (!availableActions.includes(typeAction)) continue
				// TODO - send hermitCard from frontend for validation?
				const hermitCard =
					currentPlayer.board.rows[currentPlayer.board.activeRow].hermitCard
				const hermitInfo = CARDS[hermitCard.cardId]

				const singleUseCard = !currentPlayer.board.singleUseCardUsed
					? currentPlayer.board.singleUseCard
					: null
				const singleUseInfo = singleUseCard ? CARDS[singleUseCard.cardId] : null
				const singleUseDamage = singleUseInfo ? DAMAGE[singleUseInfo.id] : null

				if (singleUseDamage) currentPlayer.board.singleUseCardUsed = true
				if (!hermitInfo.hasOwnProperty(type) && !singleUseDamage) {
					console.log('Invalid attack')
					continue
				}

				const targetDamage =
					(hermitInfo[type]?.damage || 0) + (singleUseDamage?.target || 0)

				const targetRow =
					opponentPlayer.board.rows[opponentPlayer.board.activeRow]
				const attackerRow =
					currentPlayer.board.rows[currentPlayer.board.activeRow]
				if (!targetRow || !attackerRow) continue

				const protection = PROTECTION[targetRow.effectCard?.cardId]
				let targetProtection = protection?.target || 0
				if (singleUseInfo?.id === 'golden_axe') targetProtection = 0
				// TODO - Move to discard pile
				if (protection?.discard) targetRow.effectCard = null

				// Math.max to avoid healing
				targetRow.health -= Math.max(targetDamage - targetProtection, 0)
				attackerRow.health -= singleUseDamage ? singleUseDamage.self || 0 : 0

				pastTurnActions.push(typeAction)
			} else if (turnAction.type === 'END_TURN') {
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
			gamePlayerIds.forEach((playerId) => {
				allPlayers[playerId].socket.emit('GAME_END', {
					type: 'GAME_END',
					payload: {
						gameState,
					},
				})
			})
			break
		}

		// Draw a card fropm deck when turn ends
		// TODO - Find out if game should end once pile runs out
		const drawCard = currentPlayer.pile.shift()
		if (drawCard) currentPlayer.hand.push(drawCard)

		// If player has not used his single use card return it to hand
		if (currentPlayer.board.singleUseCard) {
			if (currentPlayer.board.singleUseCardUsed === false) {
				currentPlayer.hand.push(currentPlayer.board.singleUseCard)
			}
			currentPlayer.board.singleUseCard = null
			currentPlayer.board.singleUseCardUsed = false
		}
	}
}

export default gameSaga
