import {getPickedCardsInfo} from './picked-cards'
import CARDS from '../cards'

/*
Checks specific row and its slots if they match given requirments
@param rowInfo RowInfoT
@param req PickRequirmentT
@returns boolean
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

/*
Create an info object describing various properties of a game row
@param playerState PlayerStateT
@param current boolean
@return Array<RowInfoT>
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

/*
Compares game state and "req" object to see if there is any slot on
the board that would fit given requirments
@param playerState PlayerState
@param opponentState PlayerState
@param req Array<PickRequirmentT>
@returns boolean
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
	}

	return true
}
