import CARDS from '../cards'

/**
 * @typedef {import("common/types/game-state").GameState} GameState
 * @typedef {import("common/types/game-state").PlayerState} PlayerState
 * @typedef {import("common/types/game-state").CardT} CardT
 * @typedef {import("common/types/pick-process").PickRequirmentT} PickRequirmentT
 * @typedef {import("common/types/pick-process").PickedCardT} PickedCardT
 * @typedef {import("common/types/pick-process").BoardPickedCardT} BoardPickedCardT
 * @typedef {import("common/types/pick-process").HandPickedCardT} HandPickedCardT
 * @typedef {import("common/types/pick-process").SlotTypeT} SlotTypeT
 * @typedef {import("common/types/cards").CardTypesMapT} CardTypesMapT
 * @typedef {import("common/types/cards").AttachRequirmentT} AttachRequirmentT
 */

/**
 * Checks specific row and its slots if they match given requirments
 * @param rowInfo RowInfoT
 * @param req PickRequirmentT
 * @returns boolean
 */
const checkRow = (rowInfo, req) => {
	if (rowInfo.emptyRow) return false

	const target = req.target === 'any' || req.target === rowInfo.target
	if (!target) return false

	// active or afk
	if (req.active === true && !rowInfo.active) return false
	if (req.active === false && rowInfo.active) return false

	const slots = []
	if (['hermit', 'any'].includes(req.type)) slots.push(rowInfo.row.hermitCard)
	if (['effect', 'any'].includes(req.type)) slots.push(rowInfo.row.effectCard)
	if (['item', 'any'].includes(req.type)) slots.push(...rowInfo.row.itemCards)

	// empty slot or not
	const anyEmpty = slots.some((card) => !card)
	const allEmpty = slots.every((card) => !card)
	if (req.empty === true && !anyEmpty) return false
	if (!req.empty && allEmpty) return false

	return true
}

/**
 * Create an info object describing various properties of a game row
 * @param playerState PlayerStateT
 * @param current boolean
 * @return Array<RowInfoT>
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

const checkHand = (playerState, req) => {
	let cards = playerState.hand
	if (req.type !== 'any') {
		cards = playerState.hand.filter(
			(card) => CARDS[card.cardId].type === req.type
		)
	}
	return req.amount <= cards.length
}

/**
 * Compares game state and "req" object to see if there is any slot on
 * the board that would fit given requirments
 * @param playerState PlayerState
 * @param opponentState PlayerState
 * @param reqs Array<PickRequirmentT>
 * @returns boolean
 */
export const anyAvailableReqOptions = (playerState, opponentState, reqs) => {
	const rowsInfo = []
	rowsInfo.push(...getRowsInfo(playerState, true))
	rowsInfo.push(...getRowsInfo(opponentState, false))

	for (let req of reqs) {
		if (req.target === 'hand') {
			if (!checkHand(playerState, req)) return false
			continue
		}
		const result = rowsInfo.filter((info) => checkRow(info, req))
		if (result.length < req.amount) return false
		if (req.breakIf) break
	}

	return true
}

/**
 * @param {PlayerState} cardPlayerState
 * @param {number | null} rowIndex
 * @param {boolean} emptyRow
 * @returns {boolean}
 */
export const validRow = (cardPlayerState, rowIndex, emptyRow) => {
	if (typeof rowIndex !== 'number') return true
	const row = cardPlayerState?.board.rows[rowIndex]
	if (!row) return false
	return !!row.hermitCard !== emptyRow
}

/**
 * @param {PickRequirmentT['target']} target
 * @param {PlayerState} cardPlayerState
 * @param {string} playerId
 * @param {SlotTypeT} slotType
 * @returns {boolean}
 */
export const validTarget = (target, cardPlayerState, playerId, slotType) => {
	if (typeof target !== 'string') return true

	if (target === 'hand') return slotType === 'hand'
	if (target === 'player' && playerId !== cardPlayerState.id) return false
	if (target === 'opponent' && playerId === cardPlayerState.id) return false

	return true
}

/**
 * @param {PickRequirmentT['active']} active
 * @param {PlayerState} cardPlayerState
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
 * @returns {boolean}
 */
const validEmpty = (empty, card) => {
	if (typeof empty !== 'boolean') return true
	return empty === !card
}

/**
 * @template T
 * @template Y
 * @template {boolean} [E=false]
 * @param {GameState} gameState
 * @param {PickRequirmentT & { target?: T, type?: Y, empty?: E }} req
 * @param {PickedCardT | undefined} pickedCard
 * @returns {pickedCard is (T extends 'hand'
 *   ? HandPickedCardT
 *   : BoardPickedCardT
 *   ) & {
 *     card: E extends true ? null : CardT,
 *     cardInfo: E extends true ? null : CardTypesMapT[Y],
 *   }
 * }
 */
export function validPick(gameState, req, pickedCard) {
	if (!pickedCard) return false

	const {players, turnPlayerId} = gameState
	const cardPlayerId = pickedCard.playerId
	const rowIndex = 'rowIndex' in pickedCard ? pickedCard.rowIndex : null
	const cardPlayerState = players[cardPlayerId]
	const card = pickedCard.card
	const slotType = pickedCard.slotType
	const cardType = card ? CARDS[card.cardId].type : slotType
	const emptyRow = !!req.empty && slotType === 'hermit'

	if (!cardPlayerState) return false
	if (!validRow(cardPlayerState, rowIndex, emptyRow)) return false
	if (!validTarget(req.target, cardPlayerState, turnPlayerId, slotType))
		return false
	if (!validActive(req.active, cardPlayerState, rowIndex)) return false
	if (!validType(req.type, cardType)) return false
	if (!validEmpty(req.empty || false, card)) return false

	return true
}

/**
 * Check attach req for effect cards
 * @param {GameState} gameState
 * @param {TurnAction['payload']} slotPayload
 * @param {AttachRequirmentT} req
 * @return {boolean}
 */
export function checkAttachReq(gameState, slotPayload, req) {
	if (!slotPayload) return false

	const {players, turnPlayerId} = gameState
	const {playerId, slotIndex} = slotPayload
	const rowIndex = 'rowIndex' in slotPayload ? slotPayload.rowIndex : null
	const player = players[playerId]
	const slotType = slotPayload.slotType
	const emptyRow = slotType === 'hermit'

	if (!validRow(player, rowIndex, emptyRow)) return false
	if (!validTarget(req.target, player, turnPlayerId, slotType)) return false
	if (!validActive(req.active, player, rowIndex)) return false
	if (!req.type.some((type) => validType(type, slotType))) return false

	// Empty checks
	const board = player.board
	const row = typeof rowIndex === 'number' ? board.rows[rowIndex] : null
	if (slotType === 'single_use' && board.singleUseCard) return false
	if (slotType === 'hermit' && row?.hermitCard) return false
	if (slotType === 'effect' && row?.effectCard) return false
	if (slotType === 'item' && row?.itemCards[slotIndex]) return false

	return true
}
