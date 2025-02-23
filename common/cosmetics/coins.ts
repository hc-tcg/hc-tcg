import NoDerpcoins from '../achievements/no-derpcoins'
import PackOfWolves from '../achievements/pack-of-wolves'
import ServerLag from '../achievements/server-lag'
import SheepStarer from '../achievements/sheep-starer'
import {Win100} from '../achievements/wins'
import {Coin} from './types'

const CoinDefinitions: Omit<Coin, 'type'>[] = [
	{
		id: 'creeper',
		name: 'Creeper',
		borderColor: '#e1b530',
	},
	{
		id: 'server-lag',
		name: 'Chicken',
		borderColor: '#CD1414',
		requires: ServerLag.id,
	},
	{
		id: 'cod',
		name: 'Cod',
		borderColor: '#221F26',
		requires: undefined,
	},
	{
		id: 'dinnerbone',
		name: 'Dinnerbone',
		borderColor: '#e1b530',
		requires: Win100.id,
	},
	{
		id: 'evilx',
		name: 'Evil X',
		borderColor: '#666666',
		requires: NoDerpcoins.id,
	},
	{
		id: 'pink-sheep',
		name: 'Pink Sheep',
		borderColor: '#de7f9c',
		requires: SheepStarer.id,
	},
	{
		id: 'wolf',
		name: 'Wolf',
		borderColor: '#dddadb',
		requires: PackOfWolves.id,
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
