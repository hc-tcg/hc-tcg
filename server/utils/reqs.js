import CARDS, {EFFECT_CARDS} from '../../common/cards'

/**
 * @typedef {import("common/types/game-state").GameState} GameState
 * @typedef {import("common/types/game-state").PlayerState} PlayerState
 * @typedef {import("common/types/game-state").CardT} CardT
 * @typedef {import("common/types/pick-process").PickRequirmentT} PickRequirmentT
 * @typedef {import("common/types/pick-process").PickedSlotT} PickedSlotT
 * @typedef {import("common/types/pick-process").BoardPickedSlotInfo} BoardPickedSlotInfo
 * @typedef {import("common/types/pick-process").HandPickedSlotInfo} HandPickedSlotInfo
 * @typedef {import("common/types/pick-process").SlotTypeT} SlotTypeT
 * @typedef {import('common/types/pick-process').PickResultT} PickResultT
 * @typedef {import('common/types/game-state').LocalGameState} LocalGameState
 * @typedef {import('common/types/game-state').LocalPlayerState} LocalPlayerState
 */

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
	if (typeof type !== 'string') return true
	return type === 'any' ? true : type === cardType
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

	const currentPlayerId = gameState.order[(gameState.turn + 1) % 2]
	const opponentPlayerId = gameState.order[gameState.turn % 2]
	const slot = /** @type {BoardPickedSlotInfo} */ (pickedSlot)

	if (req.target === 'opponent' && slot.playerId === currentPlayerId)
		return false
	if (req.target === 'player' && slot.playerId !== currentPlayerId) return false

	const targetId =
		req.target === 'opponent' ? opponentPlayerId : currentPlayerId
	const activeRow = gameState.players[targetId].board.activeRow
	if (
		activeRow !== null &&
		(slot.rowIndex === activeRow + 1 || slot.rowIndex === activeRow - 1)
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
	const rowIndex = 'rowIndex' in pickedSlot ? pickedSlot.rowIndex : null
	const cardPlayerState = players[cardPlayerId]
	const card = pickedSlot.card
	const slotType = pickedSlot.slotType
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
			if (pickedSlot.slotType !== 'hand') {
				boardSlots.push(pickedSlot)
				if (req.adjacent === 'req') reqAdjacentsBundle.push(pickedSlot)
			}
		}
		if (req.adjacent === 'req' && reqAdjacentsBundle.length > 0)
			reqAdjacents.push(reqAdjacentsBundle)
	}

	// Check if all cards that need an adjacent card have one.
	if (reqAdjacents.length > 0) {
		for (let pickedCardAdjBundle of reqAdjacents) {
			for (let pickedCardAdj of pickedCardAdjBundle) {
				const slotAdj = /** @type {BoardPickedSlotInfo} */ (pickedCardAdj)
				let validPairs = 0
				for (let pickedCard of boardSlots) {
					const slot = /** @type {BoardPickedSlotInfo} */ (pickedCard)
					// Can't be adjacent to itself
					if (pickedCard === pickedCardAdj) continue
					// Can't be adjacent to a card with the same req
					if (pickedCardAdjBundle.includes(pickedCard)) continue
					if (
						slot.rowIndex === slotAdj.rowIndex + 1 ||
						slot.rowIndex === slotAdj.rowIndex - 1
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
