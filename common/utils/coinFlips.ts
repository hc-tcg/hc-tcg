import {CardComponent, PlayerComponent} from '../components'
import {GameModel} from '../models/game-model'
import {CoinFlipResult} from '../types/game-state'

/* Array of [coin flip number, weight of coinflip number] */
const COIN_FLIP_WEIGHTS = [
	[4, 8],
	[5, 6],
	[6, 4],
	[7, 2],
	[8, 1],
]

const COIN_FORCED_WEIGHTS = [
	[2, 3],
	[3, 4],
]

const COIN_FLIP_ARRAY = COIN_FLIP_WEIGHTS.reduce((acc, [count, weight]) => {
	acc.push(...new Array(weight).fill(count))
	return acc
}, [])

const COIN_FLIP_FORCED_ARRAY = COIN_FORCED_WEIGHTS.reduce(
	(acc, [count, weight]) => {
		acc.push(...new Array(weight).fill(count))
		return acc
	},
	[],
)

export function flipCoin(
	game: GameModel,
	playerTossingCoin: PlayerComponent,
	card: CardComponent,
	times: number = 1,
	currentPlayer: PlayerComponent | null = null,
): Array<CoinFlipResult> {
	const forceHeads = playerTossingCoin.game.settings.forceCoinFlip

	let coinFlips: Array<{
		result: CoinFlipResult
		forced: boolean
	}> = []
	for (let i = 0; i < times; i++) {
		if (forceHeads) {
			coinFlips.push({
				result: 'heads',
				forced: true,
			})
		} else {
			const coinFlip: CoinFlipResult = game.rng() >= 0.5 ? 'heads' : 'tails'
			coinFlips.push({
				result: coinFlip,
				forced: false,
			})
		}
	}

	playerTossingCoin.hooks.onCoinFlip.call(card, coinFlips)

	let coinFlipAmount =
		COIN_FLIP_ARRAY[Math.floor(game.rng() * COIN_FLIP_ARRAY.length)]

	if (coinFlips.map((c) => c.forced).every((c) => c)) {
		coinFlipAmount =
			COIN_FLIP_FORCED_ARRAY[
				Math.floor(game.rng() * COIN_FLIP_FORCED_ARRAY.length)
			]
	}

	const name = card.props.name
	const player = currentPlayer || playerTossingCoin
	player.coinFlips.push({
		card: card.entity,
		opponentFlip: currentPlayer !== null,
		name: !currentPlayer ? name : 'Opponent ' + name,
		tosses: coinFlips,
		amount: coinFlipAmount,
		delay: coinFlipAmount * 350 + 1000,
		headImage: player.selectedCoinHead,
	})

	return coinFlips.map((f) => f.result)
}
