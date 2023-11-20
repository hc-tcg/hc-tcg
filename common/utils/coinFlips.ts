import {DEBUG_CONFIG} from '../config'
import {CoinFlipT, PlayerState} from '../types/game-state'
import {CARDS} from '../cards'

export function flipCoin(
	playerTossingCoin: PlayerState,
	cardId: string,
	times: number = 1,
	currentPlayer: PlayerState | null = null
) {
	const forceHeads = DEBUG_CONFIG.forceCoinFlip
	const activeRowIndex = playerTossingCoin.board.activeRow
	if (activeRowIndex === null) {
		console.log(`${cardId} attempted to flip coin with no active row!, that shouldn't be possible`)
		return []
	}
	const forceTails = !!playerTossingCoin.board.rows[activeRowIndex].ailments.find(
		(a) => a.id === 'badomen'
	)

	let coinFlips: Array<CoinFlipT> = []
	for (let i = 0; i < times; i++) {
		if (forceHeads) {
			coinFlips.push('heads')
		} else if (forceTails) {
			coinFlips.push('tails')
		} else {
			const coinFlip: CoinFlipT = Math.random() > 0.5 ? 'heads' : 'tails'
			coinFlips.push(coinFlip)
		}
	}

	playerTossingCoin.hooks.onCoinFlip.call(cardId, coinFlips)

	const name = CARDS[cardId].name
	const player = currentPlayer || playerTossingCoin
	player.coinFlips.push({
		cardId: cardId,
		opponentFlip: currentPlayer !== null,
		name: !currentPlayer ? name : 'Opponent ' + name,
		tosses: coinFlips,
	})

	return coinFlips
}
