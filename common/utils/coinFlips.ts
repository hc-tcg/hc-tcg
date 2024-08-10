import {CardComponent, PlayerComponent} from '../components'
import {DEBUG_CONFIG} from '../config'
import {CoinFlipResult} from '../types/game-state'

/* Array of [coin flip number, weight of coinflip number] */
const COIN_FLIP_WEIGHTS = [
	[4, 8],
	[5, 6],
	[6, 4],
	[7, 2],
	[8, 1],
]

const COIN_FLIP_ARRAY = COIN_FLIP_WEIGHTS.reduce((acc, [count, weight]) => {
	acc.push(...new Array(weight).fill(count))
	return acc
}, [])

export function flipCoin(
	playerTossingCoin: PlayerComponent,
	card: CardComponent,
	times: number = 1,
	currentPlayer: PlayerComponent | null = null,
): Array<CoinFlipResult> {
	const forceHeads = DEBUG_CONFIG.forceCoinFlip
	const activeRowIndex = playerTossingCoin.game.components.get(
		playerTossingCoin.activeRowEntity,
	)
	if (activeRowIndex === null) {
		console.log(
			`${card.card.props.numericId} attempted to flip coin with no active row!, that shouldn't be possible`,
		)
		return []
	}

	let coinFlips: Array<CoinFlipResult> = []
	for (let i = 0; i < times; i++) {
		if (forceHeads) {
			coinFlips.push('heads')
		} else {
			const coinFlip: CoinFlipResult = Math.random() >= 0.5 ? 'heads' : 'tails'
			coinFlips.push(coinFlip)
		}
	}

	const coinFlipAmount =
		COIN_FLIP_ARRAY[Math.floor(Math.random() * COIN_FLIP_ARRAY.length)]

	playerTossingCoin.hooks.onCoinFlip.call(card, coinFlips)

	const name = card.props.name
	const player = currentPlayer || playerTossingCoin
	player.coinFlips.push({
		card: card.entity,
		opponentFlip: currentPlayer !== null,
		name: !currentPlayer ? name : 'Opponent ' + name,
		tosses: coinFlips,
		amount: coinFlipAmount,
		delay: coinFlipAmount * 350 + 1000,
	})

	return coinFlips
}
