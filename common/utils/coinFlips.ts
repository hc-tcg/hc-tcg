import {CardComponent, PlayerComponent} from '../components'
import {DEBUG_CONFIG} from '../config'
import {CoinFlipT} from '../types/game-state'

export function flipCoin(
	playerTossingCoin: PlayerComponent,
	card: CardComponent,
	times: number = 1,
	currentPlayer: PlayerComponent | null = null
): Array<CoinFlipT> {
	const forceHeads = DEBUG_CONFIG.forceCoinFlip
	const activeRowIndex = playerTossingCoin.game.components.get(playerTossingCoin.activeRowEntity)
	if (activeRowIndex === null) {
		console.log(
			`${card.card.props.numericId} attempted to flip coin with no active row!, that shouldn't be possible`
		)
		return []
	}

	let coinFlips: Array<CoinFlipT> = []
	for (let i = 0; i < times; i++) {
		if (forceHeads) {
			coinFlips.push('heads')
		} else {
			const coinFlip: CoinFlipT = Math.random() >= 0.5 ? 'heads' : 'tails'
			coinFlips.push(coinFlip)
		}
	}

	const coinFlipAmount = Math.floor(Math.random() * (2 + (coinFlips.length >= 1 ? 1 : 0))) + 4

	playerTossingCoin.hooks.onCoinFlip.call(card, coinFlips)

	const name = card.props.name
	const player = currentPlayer || playerTossingCoin
	player.coinFlips.push({
		card: card.toLocalCardInstance(),
		opponentFlip: currentPlayer !== null,
		name: !currentPlayer ? name : 'Opponent ' + name,
		tosses: coinFlips,
		amount: coinFlipAmount,
		delay: coinFlipAmount * 350 + 1000,
	})

	return coinFlips
}
