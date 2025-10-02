import {CardComponent, PlayerComponent} from '../components'
import {GameModel} from '../models/game-model'
import {CoinFlipResult} from '../types/game-state'
import {assert} from './assert'

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

// If we are the server, generate a value and send it.
// If we are a client, we wait for the server to give us the value.
export function flipCoin(
	resultCallback: (result: CoinFlipResult[]) => any,
	game: GameModel,
	playerTossingCoin: PlayerComponent,
	card: CardComponent,
	times: number = 1,
	currentPlayer: PlayerComponent | null = null,
) {
	assert(times >= 0, 'You can not flip a negative amount of coins')

	if (times === 0) {
		return []
	}

	const forceHeads = playerTossingCoin.game.settings.forceCoinFlip
	const name = card.props.name
	const player = currentPlayer || playerTossingCoin

	game.startCoinFlip(
		{
			card: card.entity,
			opponentFlip: currentPlayer !== null,
			name: !currentPlayer ? name : 'Opponent ' + name,
			amount: times,
			headImage: player.appearance.coin.id,
		},
		(results) => {
			let coinFlips: Array<{
				result: CoinFlipResult
				forced: boolean
			}> = []

			for (let result of results) {
				if (forceHeads) {
					coinFlips.push({result: 'heads', forced: true})
				} else {
					coinFlips.push({result, forced: false})
				}
			}
			playerTossingCoin.hooks.onCoinFlip.call(card, coinFlips)

			let coinFlipAmount =
				COIN_FLIP_ARRAY[Math.floor(game.coinFlipRng() * COIN_FLIP_ARRAY.length)]

			if (coinFlips.map((c) => c.forced).every((c) => c)) {
				coinFlipAmount =
					COIN_FLIP_FORCED_ARRAY[
						Math.floor(game.coinFlipRng() * COIN_FLIP_FORCED_ARRAY.length)
					]
			}

			const result = coinFlips.map((f) => f.result)
			player.coinFlips.push({
				card: card.entity,
				opponentFlip: currentPlayer !== null,
				name: !currentPlayer ? name : 'Opponent ' + name,
				tosses: coinFlips,
				amount: coinFlipAmount,
				delay: coinFlipAmount * 350 + 1000,
				headImage: player.appearance.coin.id,
			})

			resultCallback(result)
		},
	)
}
