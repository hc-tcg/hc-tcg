import CARDS, {EFFECT_CARDS} from '../../common/cards'

/**
 * @typedef {import("common/types/game-state").GameState} GameState
 * @typedef {import("common/types/game-state").PlayerState} PlayerState
 * @typedef {import("common/types/game-state").CardT} CardT
 * @typedef {import("common/types/pick-process").PickRequirmentT} PickRequirmentT
 * @typedef {import("common/types/pick-process").PickedSlotT} PickedSlotT
 * @typedef {import("common/types/pick-process").SlotTypeT} SlotTypeT
 * @typedef {import('common/types/pick-process').PickResultT} PickResultT
 * @typedef {import('common/types/game-state').LocalGameState} LocalGameState
 * @typedef {import('common/types/game-state').LocalPlayerState} LocalPlayerState
 */

/**
 * Checks specific row and its slots if they match given requirments
 * @param {*} rowInfo
 * @param {PickRequirmentT} req
 * @param {Array<PickRequirmentT>} reqs
 * @param {LocalGameState} gameState
 * @returns {number}
 */
const checkRow = (rowInfo, req, reqs, gameState) => {
	let totalSlots = 0
	if (rowInfo.emptyRow && req.type.length === 1 && req.type[0] !== 'hermit')
		return 0

	const target = req.target === rowInfo.target || req.target === 'board'
	if (!target) return 0

	// active or afk
	if (req.active === true && !rowInfo.active) return 0
	if (req.active === false && rowInfo.active) return 0

	const slots = []
	if (req.type.includes('hermit')) slots.push(rowInfo.row.hermitCard)
	if (req.type.includes('effect')) slots.push(rowInfo.row.effectCard)
	if (req.type.includes('item')) slots.push(...rowInfo.row.itemCards)

	// empty slot or not
	const anyEmpty = slots.some((card) => !card)
	const allEmpty = slots.every((card) => !card)
	if (req.empty === true && !anyEmpty) return 0
	if (!req.empty && allEmpty) return 0
	if (req.empty) totalSlots += slots.filter((card) => !card).length
	if (!req.empty) totalSlots += slots.filter((card) => card).length

	// removable or not
	const effectCard = rowInfo.row.effectCard
	const effectCardInfo =
		effectCard !== null ? EFFECT_CARDS[effectCard.cardId] : null
	if (!req.removable && effectCardInfo?.getIsRemovable()) return 0
	if (req.removable && !effectCardInfo?.getIsRemovable()) return 0

	// adjacent to active hermit or not
	if (req.adjacent === 'active') {
		const currentPlayerId = gameState.order[(gameState.turn + 1) % 2]
		const opponentPlayerId = gameState.order[gameState.turn % 2]
		const targetId =
			rowInfo.target === 'player' ? currentPlayerId : opponentPlayerId
		const activeRow = gameState.players[targetId].board.activeRow
		if (activeRow === null) return 0
		if (!(rowInfo.index === activeRow - 1 || rowInfo.index === activeRow + 1))
			return 0
	} else if (req.adjacent === 'req') {
		if (reqs.length < 2) return 0
	}

	return totalSlots
}

/**
 * Create an info object describing various properties of a game row
 * @param {PlayerState | LocalPlayerState} playerState
 * @param {boolean} current
 * @return {Array<*>}
 */
const getRowsInfo = (playerState, current) => {
	return playerState.board.rows.map((row, index) => ({
		target: current ? 'player' : 'opponent',
		playerId: playerState.id,
		active: index === playerState.board.activeRow,
		emptyRow: !row.hermitCard,
		index,
		row,
	}))
}

/**
 *
 * @param {LocalGameState} gameState
 * @param {PickRequirmentT} req
 * @returns {number}
 */
const checkHand = (gameState, req) => {
	const cards = gameState.hand.filter((card) =>
		req.type.includes(CARDS[card.cardId].type)
	)

	return cards.length
}

/**
 * Compares game state and "req" object to see if there is any slot on
 * the board that would fit given requirments
 * @param {LocalGameState | null} gameState
 * @param {LocalPlayerState | null} playerState
 * @param {LocalPlayerState | null} opponentState
 * @param {Array<PickRequirmentT>} reqs
 * @returns {Array<number>}
 */
export const anyAvailableReqOptions = (
	gameState,
	playerState,
	opponentState,
	reqs
) => {
	const result = []
	if (!gameState || !playerState || !opponentState) return result

	const rowsInfo = []
	rowsInfo.push(...getRowsInfo(playerState, true))
	rowsInfo.push(...getRowsInfo(opponentState, false))

	for (let req of reqs) {
		if (req.target === 'hand') {
			result.push(checkHand(gameState, req))
		}

		let total = 0
		for (const info of rowsInfo) {
			total += checkRow(info, req, reqs, gameState)
		}
		result.push(total)

		if (req.breakIf) break
	}

	return result
}

/**
 * @param {PlayerState | LocalPlayerState} cardPlayerState
 * @param {number | null} rowIndex
 * @returns {boolean}
 */
export const validRow = (cardPlayerState, rowIndex) => {
	if (typeof rowIndex !== 'number') return true
	const row = cardPlayerState?.board.rows[rowIndex]
	if (!row) return false
	return true
}

/**
 * @param {PickRequirmentT['target']} target
 * @param {PlayerState | LocalPlayerState} cardPlayerState
 * @param {string} playerId
 * @param {SlotTypeT} slotType
 * @returns {boolean}
 */
export const validTarget = (target, cardPlayerState, playerId, slotType) => {
	if (typeof target !== 'string') return true

	if (target === 'hand') return slotType === 'hand'
	if (target === 'board') return true
	if (target === 'player' && playerId !== cardPlayerState.id) return false
	if (target === 'opponent' && playerId === cardPlayerState.id) return false

	return true
}

/**
 * @param {PickRequirmentT['active']} active
 * @param {PlayerState | LocalPlayerState} cardPlayerState
 * @param {number | null} rowIndex
 * @returns {boolean}
 */
export const validActive = (active, cardPlayerState, rowIndex) => {
	if (typeof active !== 'boolean') return true
	if (rowIndex === null) return false

	const hasActiveHermit = cardPlayerState?.board.activeRow !== null
	const isActive =
		hasActiveHermit && rowIndex === cardPlayerState?.board.activeRow

	return active === isActive
}

/**
 * @param {PickRequirmentT['type']} type
 * @param {SlotTypeT} cardType
 * @returns {boolean}
 */
export const validType = (type, cardType) => {
	if (type === null) return true
	if (type.includes(cardType)) return true
	return false
}

/**
 * @param {PickRequirmentT['empty']} empty
 * @param {CardT | null} card
 * @param {SlotTypeT} slotType
 * @param {boolean} isEmptyRow
 * @returns {boolean}
 */
const validEmpty = (empty, card, slotType, isEmptyRow) => {
	if (typeof empty !== 'boolean') return true
	// Only hermit cards slots can have empty rows, needed for the ender pearl card
	if (isEmptyRow && slotType !== 'hermit') return false
	return empty === !card
}

/**
 * @param {PickRequirmentT['removable']} removable
 * @param {CardT | null} card
 * @returns {boolean}
 */
const validRemovable = (removable, card) => {
	if (typeof removable !== 'boolean') return true
	if (!card) return true
	return removable === EFFECT_CARDS[card.cardId]?.getIsRemovable()
}

/**
 * @param {PickRequirmentT['adjacent']} adjacent
 * @param {GameState | LocalGameState} gameState
 * @param {PickedSlotT} pickedSlot
 * @param {PickRequirmentT} req
 * @returns {boolean}
 */
const validAdjacent = (adjacent, gameState, pickedSlot, req) => {
	if (typeof adjacent !== 'string') return true
	if (adjacent === 'req') return true
	if (!pickedSlot.row) return true // Hand

	const currentPlayerId = gameState.order[(gameState.turn + 1) % 2]
	const opponentPlayerId = gameState.order[gameState.turn % 2]

	if (req.target === 'opponent' && pickedSlot.playerId === currentPlayerId)
		return false
	if (req.target === 'player' && pickedSlot.playerId !== currentPlayerId)
		return false

	const targetId =
		req.target === 'opponent' ? opponentPlayerId : currentPlayerId
	const activeRow = gameState.players[targetId].board.activeRow
	if (
		activeRow !== null &&
		(pickedSlot.row.index === activeRow + 1 ||
			pickedSlot.row.index === activeRow - 1)
	)
		return true

	return false
}

/**
 * @param {GameState | LocalGameState} gameState
 * @param {PickRequirmentT} req
 * @param {PickedSlotT} pickedSlot
 * @returns {boolean}
 */
export function validPick(gameState, req, pickedSlot) {
	if (!pickedSlot) return false

	const players = gameState.players
	const turnPlayerId = gameState['turnPlayerId'] || gameState['currentPlayerId']
	const cardPlayerId = pickedSlot.playerId
	const rowIndex = !pickedSlot.row ? null : pickedSlot.row.index
	const cardPlayerState = players[cardPlayerId]
	const card = pickedSlot.slot.card
	const slotType = pickedSlot.slot.type
	const cardType = card ? CARDS[card.cardId].type : slotType
	const isEmptyRow =
		rowIndex === null
			? true
			: cardPlayerState.board.rows[rowIndex].hermitCard === null

	if (!cardPlayerState) return false
	if (!validRow(cardPlayerState, rowIndex)) return false
	if (!validTarget(req.target, cardPlayerState, turnPlayerId, slotType))
		return false
	if (!validActive(req.active, cardPlayerState, rowIndex)) return false
	if (!validType(req.type, cardType)) return false
	if (!validEmpty(req.empty || false, card, slotType, isEmptyRow)) return false
	if (!validRemovable(req.removable, card)) return false
	if (!validAdjacent(req.adjacent, gameState, pickedSlot, req)) return false

	return true
}

/**
 * @param {GameState | LocalGameState} gameState
 * @param {PickResultT[]} pickResults
 * @returns {boolean}
 */
export function validPicks(gameState, pickResults) {
	const reqAdjacents = []
	const boardSlots = []
	for (const result of pickResults) {
		const pickedSlotsForReq = result.pickedSlots
		const req = result.req
		const reqAdjacentsBundle = []
		for (let pickedSlot of pickedSlotsForReq) {
			if (!validPick(gameState, req, pickedSlot)) return false
			// Don't check adjacent for cards in hand, makes no sense, their position can change (e.g. single use cards)
			if (pickedSlot.slot.type !== 'hand') {
				boardSlots.push(pickedSlot)
				if (req.adjacent === 'req') reqAdjacentsBundle.push(pickedSlot)
			}
		}
		if (req.adjacent === 'req' && reqAdjacentsBundle.length > 0)
			reqAdjacents.push(reqAdjacentsBundle)
	}

	// Check if all cards that need an adjacent card have one.
	if (reqAdjacents.length > 0) {
		for (let pickedSlotAdjBundle of reqAdjacents) {
			for (let pickedSlotAdj of pickedSlotAdjBundle) {
				const slotAdj = pickedSlotAdj
				let validPairs = 0
				for (let pickedSlot of boardSlots) {
					const slot = pickedSlot
					// Can't be adjacent to itself
					if (pickedSlot === pickedSlotAdj) continue
					// Can't be adjacent to a card with the same req
					if (pickedSlotAdjBundle.includes(pickedSlot)) continue
					if (
						slotAdj.row &&
						slot.row &&
						(slot.row.index === slotAdj.row.index + 1 ||
							slot.row.index === slotAdj.row.index - 1)
					) {
						validPairs++
						break
					}
				}
				if (validPairs === 0) return false
			}
		}
	}

	return true
}
