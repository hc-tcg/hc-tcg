import {GameModel} from '../models/game-model'
import {CardInstance, PlayerState} from '../types/game-state'
import {CardPosModel, getCardPos} from '../models/card-pos-model'
import {equalCard} from './cards'
import {SlotInfo} from '../types/cards'

function discardAtPos(pos: CardPosModel) {
	const {player, rowId: row, type, index} = pos

	if (type === 'single_use') {
		player.board.singleUseCard = null
	}

	if (!row) return

	if (type === 'hermit') {
		row.hermitCard = null
	}

	if (type === 'attach') {
		row.effectCard = null
	}

	if (type === 'item' && index !== null) {
		row.itemCards[index] = null
	}
}

export function discardCard(
	game: GameModel,
	card: CardInstance | null,
	playerDiscard?: PlayerState | null
) {
	if (!card) return

	const pos = getCardPos(game, card)
	if (!pos) {
		const err = new Error()
		console.log('Cannot find card on board: ', card, err.stack)
		return
	}

	// Call `onDetach`
	card.card.onDetach(game, card, pos)
	pos.player.hooks.onDetach.call(card)

	// Remove the card
	discardAtPos(pos)

	if (playerDiscard !== null) {
		const discardPlayer = playerDiscard ? playerDiscard : pos.player

		discardPlayer.discarded.push(card)
	}
}

export function retrieveCard(game: GameModel, card: CardInstance | null) {
	if (!card) return
	for (let playerId in game.state.players) {
		const player = game.state.players[playerId]
		const discarded = player.discarded
		const index = discarded.findIndex((c) => equalCard(c, card))
		if (index !== -1) {
			const retrievedCard = discarded.splice(index, 1)[0]
			player.hand.push(retrievedCard)
			return
		}
	}
}

export function discardSingleUse(game: GameModel, playerState: PlayerState) {
	const suCard = playerState.board.singleUseCard
	const suUsed = playerState.board.singleUseCardUsed
	if (!suCard) return
	const pos = getCardPos(game, suCard)
	if (!pos) return

	suCard.card.onDetach(game, suCard, pos)

	// Call onDetach hook
	playerState.hooks.onDetach.call(suCard)

	playerState.board.singleUseCardUsed = false
	playerState.board.singleUseCard = null

	if (suUsed) {
		playerState.discarded.push(suCard)
	} else {
		playerState.hand.push(suCard)
	}
}

export function discardFromHand(player: PlayerState, card: CardInstance | null) {
	if (!card) return

	player.hand = player.hand.filter((c) => !equalCard(c, card))

	player.discarded.push(card)
}

export function drawCards(playerState: PlayerState, amount: number) {
	for (let i = 0; i < Math.min(playerState.pile.length, amount); i++) {
		const drawCard = playerState.pile.shift()
		if (drawCard) playerState.hand.push(drawCard)
	}
}

export function moveCardInstanceoHand(
	game: GameModel,
	card: CardInstance,
	playerDiscard?: PlayerState | null
) {
	const cardPos = getCardPos(game, card)
	if (!cardPos) return

	card.card.onDetach(game, card, cardPos)

	cardPos.player.hooks.onDetach.call(card)

	if (cardPos.rowId && cardPos.type === 'hermit') {
		cardPos.rowId.hermitCard = null
	} else if (cardPos.rowId && cardPos.type === 'attach') {
		cardPos.rowId.effectCard = null
	} else if (cardPos.rowId && cardPos.type === 'item' && cardPos.index !== null) {
		cardPos.rowId.itemCards[cardPos.index] = null
	} else if (cardPos.type === 'single_use') {
		cardPos.player.board.singleUseCard = null
	}

	if (playerDiscard !== null) {
		const chosenPlayer = playerDiscard ? playerDiscard : cardPos.player
		chosenPlayer.hand.push(card)
	}
}

/**Returns a `CardInstance` of the card in the slot, or `null` if it's empty. */
export function getSlotCard(slotPos: SlotInfo): CardInstance | null {
	const {rowId: row, index, type} = slotPos

	if (!row || !index) return null

	if (type === 'hermit') {
		return row.hermitCard
	} else if (type === 'attach') {
		return row.effectCard
	}

	return row.itemCards[index]
}
