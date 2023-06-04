import CARDS, {EFFECT_CARDS} from '../../common/cards'

/**
 * @typedef {import("common/types/game-state").GameState} GameState
 * @typedef {import("common/types/game-state").PlayerState} PlayerState
 * @typedef {import("common/types/game-state").CardT} CardT
 * @typedef {import("common/types/pick-process").PickRequirmentT} PickRequirmentT
 * @typedef {import("common/types/pick-process").PickedCardT} PickedCardT
 * @typedef {import("common/types/pick-process").BoardPickedCardT} BoardPickedCardT
 * @typedef {import("common/types/pick-process").HandPickedCardT} HandPickedCardT
 * @typedef {import("common/types/pick-process").SlotTypeT} SlotTypeT
 * @typedef {import('common/types/game-state').LocalGameState} LocalGameState
 * @typedef {import('common/types/game-state').LocalPlayerState} LocalPlayerState
 */

/**
 * Checks specific row and its slots if they match given requirments
 * @param {*} rowInfo
 * @param {PickRequirmentT} req
 * @returns {boolean}
 */
const checkRow = (rowInfo, req) => {
	if (rowInfo.emptyRow && req.type.length === 1 && req.type[0] !== 'hermit')
		return false

	const target = req.target === rowInfo.target || req.target === 'board'
	if (!target) return false

	// active or afk
	if (req.active === true && !rowInfo.active) return false
	if (req.active === false && rowInfo.active) return false

	const slots = []
	if (req.type.includes('hermit')) slots.push(rowInfo.row.hermitCard)
	if (req.type.includes('effect')) slots.push(rowInfo.row.effectCard)
	if (req.type.includes('item')) slots.push(...rowInfo.row.itemCards)

	// empty slot or not
	const anyEmpty = slots.some((card) => !card)
	const allEmpty = slots.every((card) => !card)
	if (req.empty === true && !anyEmpty) return false
	if (!req.empty && allEmpty) return false

	// removable or not
	const effectCard = rowInfo.row.effectCard
	const effectCardInfo =
		effectCard !== null ? EFFECT_CARDS[effectCard.cardId] : null
	if (req.removable && effectCardInfo?.getIsRemovable()) return true
	if (req.removable && !effectCardInfo?.getIsRemovable()) return false

	return true
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
 * @returns {boolean}
 */
const checkHand = (gameState, req) => {
	const cards = gameState.hand.filter((card) =>
		req.type.includes(CARDS[card.cardId].type)
	)

	return req.amount <= cards.length
}

/**
 * Compares game state and "req" object to see if there is any slot on
 * the board that would fit given requirments
 * @param {LocalGameState | null} gameState
 * @param {LocalPlayerState | null} playerState
 * @param {LocalPlayerState | null} opponentState
 * @param {Array<PickRequirmentT>} reqs
 * @returns {boolean}
 */
export const anyAvailableReqOptions = (
	gameState,
	playerState,
	opponentState,
	reqs
) => {
	if (!gameState || !playerState || !opponentState) return false

	const rowsInfo = []
	rowsInfo.push(...getRowsInfo(playerState, true))
	rowsInfo.push(...getRowsInfo(opponentState, false))

	for (let req of reqs) {
		if (req.target === 'hand') {
			if (!checkHand(gameState, req)) return false
			continue
		}
		const result = rowsInfo.filter((info) => checkRow(info, req))
		if (result.length < req.amount) return false
		if (req.breakIf) break
	}

	return true
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
 * @template T
 * @template Y
 * @template {boolean} [E=false]
 * @param {GameState | LocalGameState} gameState
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

	const players = gameState.players
	const turnPlayerId = gameState['turnPlayerId'] || gameState['currentPlayerId']
	const cardPlayerId = pickedCard.playerId
	const rowIndex = 'rowIndex' in pickedCard ? pickedCard.rowIndex : null
	const cardPlayerState = players[cardPlayerId]
	const card = pickedCard.card
	const slotType = pickedCard.slotType
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

	return true
}
