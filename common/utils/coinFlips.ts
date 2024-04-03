import {DEBUG_CONFIG} from '../config'
import {CardT, CoinFlipT, PlayerState} from '../types/game-state'
import {CARDS} from '../cards'

export function flipCoin(
	playerTossingCoin: PlayerState,
	card: CardT,
	times: number = 1,
	currentPlayer: PlayerState | null = null
) {
	const forceHeads = DEBUG_CONFIG.forceCoinFlip
	const activeRowIndex = playerTossingCoin.board.activeRow
	if (activeRowIndex === null) {
		console.log(
			`${card.cardId} attempted to flip coin with no active row!, that shouldn't be possible`
		)
		return []
	}

	let coinFlips: Array<CoinFlipT> = []
	for (let i = 0; i < times; i++) {
		if (forceHeads) {
			coinFlips.push('heads')
		} else {
			const coinFlip: CoinFlipT = Math.random() > 0.5 ? 'heads' : 'tails'
			coinFlips.push(coinFlip)
		}
	}

	playerTossingCoin.hooks.onCoinFlip.call(card, coinFlips)

	const name = CARDS[card.cardId].name
	const player = currentPlayer || playerTossingCoin
	player.coinFlips.push({
		cardId: card.cardId,
		opponentFlip: currentPlayer !== null,
		name: !currentPlayer ? name : 'Opponent ' + name,
		tosses: coinFlips,
	})

	return coinFlips
}
