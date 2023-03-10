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
 * @param {PickRequirmentT} req
 * @param {PlayerState} cardPlayerState
 * @param {number | null} rowIndex
 * @returns {boolean}
 */
export const validRow = (req, cardPlayerState, rowIndex) => {
	if (typeof rowIndex !== 'number') return true
	const row = cardPlayerState?.board.rows[rowIndex]
	return !!(row && row.hermitCard)
}

/**
 * @param {PickRequirmentT} req
 * @param {PlayerState} cardPlayerState
 * @param {string} playerId
 * @param {SlotTypeT} slotType
 * @returns {boolean}
 */
export const validTarget = (req, cardPlayerState, playerId, slotType) => {
	if (!Object.hasOwn(req, 'target')) return true

	if (req.target === 'hand') return slotType === 'hand'
	if (req.target === 'player' && playerId !== cardPlayerState.id) return false
	if (req.target === 'opponent' && playerId === cardPlayerState.id) return false

	return true
}

/**
 * @param {PickRequirmentT} req
 * @param {PlayerState} cardPlayerState
 * @param {number | null} rowIndex
 * @returns {boolean}
 */
export const validActive = (req, cardPlayerState, rowIndex) => {
	if (!Object.hasOwn(req, 'active')) return true
	if (rowIndex === null) return false

	const hasActiveHermit = cardPlayerState?.board.activeRow !== null
	const isActive =
		hasActiveHermit && rowIndex === cardPlayerState?.board.activeRow

	return req.active === isActive
}

/**
 * @param {PickRequirmentT} req
 * @param {SlotTypeT} cardType
 * @returns {boolean}
 */
export const validType = (req, cardType) => {
	if (!Object.hasOwn(req, 'type')) return true
	return req.type === 'any' ? true : req.type === cardType
}

/**
 * @param {PickRequirmentT} req
 * @param {CardT | null} card
 * @returns {boolean}
 */
const validEmpty = (req, card) => {
	if (!Object.hasOwn(req, 'empty')) return !!card
	return req.empty === !card
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

	const cardPlayerId = pickedCard.playerId
	const rowIndex = 'rowIndex' in pickedCard ? pickedCard.rowIndex : null
	const cardPlayerState = gameState.players[cardPlayerId]
	const card = pickedCard.card
	const slotType = pickedCard.slotType
	const cardType = card ? CARDS[card.cardId].type : slotType

	if (!cardPlayerState) return false
	if (!validRow(req, cardPlayerState, rowIndex)) return false
	if (!validTarget(req, cardPlayerState, gameState.turnPlayerId, slotType))
		return false
	if (!validActive(req, cardPlayerState, rowIndex)) return false
	if (!validType(req, cardType)) return false
	if (!validEmpty(req, card)) return false

	return true
}

/**
 * @param {GameState} gameState
 * @param {Array<PickRequirmentT>} reqs
 * @param {Array<PickedCardT>} pickedCards
 * @returns {boolean}
 */
export function validPicks(gameState, reqs, pickedCards) {
	let index = 0
	for (let req of reqs) {
		for (let i = 0; i < req.amount; i++) {
			const isValid = validPick(gameState, req, pickedCards[index])
			if (!isValid) return false
			index++
		}
	}
	return true
}
