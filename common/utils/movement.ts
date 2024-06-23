import {GameModel} from '../models/game-model'
import {CardT, PlayerState} from '../types/game-state'
import {CARDS} from '../cards'
import {CardPosModel, getCardPos} from '../models/card-pos-model'
import {equalCard} from './cards'
import {SlotInfo} from '../types/cards'

function discardAtPos(pos: CardPosModel) {
	const {player, row, type, index} = pos

	if (type === 'single_use') {
		player.board.singleUseCard = null
	}

	if (!row) return

	if (type === 'hermit') {
		row.hermitCard = null
	}

	if (type === 'effect') {
		row.effectCard = null
	}

	if (type === 'item' && index !== null) {
		row.itemCards[index] = null
	}
}

export function discardCard(
	game: GameModel,
	card: CardT | null,
	playerDiscard?: PlayerState | null
) {
	if (!card) return

	const pos = getCardPos(game, card.cardInstance)
	if (!pos) {
		const err = new Error()
		console.log('Cannot find card on board: ', card, err.stack)
		return
	}

	// Call `onDetach`
	const cardInfo = CARDS[card.cardId]
	cardInfo.onDetach(game, card.cardInstance, pos)
	pos.player.hooks.onDetach.call(card.cardInstance)

	// Remove the card
	discardAtPos(pos)

	if (playerDiscard !== null) {
		const discardPlayer = playerDiscard ? playerDiscard : pos.player

		discardPlayer.discarded.push({
			cardId: card.cardId,
			cardInstance: card.cardInstance,
		})
	}
}

export function retrieveCard(game: GameModel, card: CardT | null) {
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
	const pos = getCardPos(game, suCard.cardInstance)
	if (!pos) return

	// Water and Milk Buckets can be on this slot so we use CARDS to get the card info
	const cardInfo = CARDS[suCard.cardId]
	cardInfo.onDetach(game, suCard.cardInstance, pos)

	// Call onDetach hook
	playerState.hooks.onDetach.call(suCard.cardInstance)

	playerState.board.singleUseCardUsed = false
	playerState.board.singleUseCard = null

	if (suUsed) {
		playerState.discarded.push(suCard)
	} else {
		playerState.hand.push(suCard)
	}
}

export function discardFromHand(player: PlayerState, card: CardT | null) {
	if (!card) return

	player.hand = player.hand.filter((c) => !equalCard(c, card))

	player.discarded.push({
		cardId: card.cardId,
		cardInstance: card.cardInstance,
	})
}

export function drawCards(playerState: PlayerState, amount: number) {
	for (let i = 0; i < Math.min(playerState.pile.length, amount); i++) {
		const drawCard = playerState.pile.shift()
		if (drawCard) playerState.hand.push(drawCard)
	}
}

export function moveCardToHand(game: GameModel, card: CardT, playerDiscard?: PlayerState | null) {
	const cardPos = getCardPos(game, card.cardInstance)
	if (!cardPos) return

	const cardInfo = CARDS[card.cardId]
	cardInfo.onDetach(game, card.cardInstance, cardPos)

	cardPos.player.hooks.onDetach.call(card.cardInstance)

	if (cardPos.row && cardPos.type === 'hermit') {
		cardPos.row.hermitCard = null
	} else if (cardPos.row && cardPos.type === 'effect') {
		cardPos.row.effectCard = null
	} else if (cardPos.row && cardPos.type === 'item' && cardPos.index !== null) {
		cardPos.row.itemCards[cardPos.index] = null
	} else if (cardPos.type === 'single_use') {
		cardPos.player.board.singleUseCard = null
	}

	if (playerDiscard !== null) {
		const chosenPlayer = playerDiscard ? playerDiscard : cardPos.player
		chosenPlayer.hand.push(card)
	}
}

/**Returns a `CardT` of the card in the slot, or `null` if it's empty. */
export function getSlotCard(slotPos: SlotInfo): CardT | null {
	const {row, index, type} = slotPos

	if (!row || !index) return null

	if (type === 'hermit') {
		return row.hermitCard
	} else if (type === 'effect') {
		return row.effectCard
	}

	return row.itemCards[index]
}
