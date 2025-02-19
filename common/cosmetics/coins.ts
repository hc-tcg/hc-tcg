import NoDerpcoins from '../achievements/no-derpcoins'
import {Coin} from './types'

const CoinDefinitions: Omit<Coin, 'type'>[] = [
	{
		id: 'creeper',
		name: 'Creeper',
		borderColor: '#e1b530',
	},
	{
		id: 'evilx',
		name: 'Evil X',
		borderColor: '#666666',
		requires: NoDerpcoins.id,
	},
]

export const ALL_COINS: Coin[] = CoinDefinitions.map((coin) => ({
	type: 'coin',
	...coin,
}))

export const COINS: Record<string | number, Coin> = ALL_COINS.reduce(
	(result: Record<string | number, Coin>, card) => {
		result[card.id] = card
		return result
	},
	{},
)
