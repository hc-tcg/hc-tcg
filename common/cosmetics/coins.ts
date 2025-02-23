import NoDerpcoins from '../achievements/no-derpcoins'
import PackOfWolves from '../achievements/pack-of-wolves'
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
		requires: {achievement: NoDerpcoins.id},
	},
	{
		id: 'wolf',
		name: 'Wolf',
		borderColor: '#dddadb',
		requires: {achievement: PackOfWolves.id},
	},
	{
		id: 'pink-sheep',
		name: 'Pink Sheep',
		borderColor: '#de7f9c',
		requires: undefined,
	},
	{
		id: 'cod',
		name: 'Cod',
		borderColor: '#221F26',
		requires: undefined,
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
