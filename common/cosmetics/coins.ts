import EyeOfTheSpider from '../achievements/eye-of-the-spider'
import NoDerpcoins from '../achievements/no-derpcoins'
import PackOfWolves from '../achievements/pack-of-wolves'
import ServerLag from '../achievements/server-lag'
import SheepStarer from '../achievements/sheep-starer'
import Win from '../achievements/wins'
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
		requires: undefined,
	},
	{
		id: 'cave-spider',
		name: 'Cave Spider',
		borderColor: '#840000',
		requires: {achievement: EyeOfTheSpider.id},
	},
	{
		id: 'cod',
		name: 'Cod',
		borderColor: '#7D604D',
		requires: {achievement: ServerLag.id},
	},
	{
		id: 'dinnerbone',
		name: 'Dinnerbone',
		borderColor: '#e1b530',
		requires: {achievement: Win.id, level: 2},
	},
	{
		id: 'evilx',
		name: 'Evil X',
		borderColor: '#666666',
		requires: {achievement: NoDerpcoins.id},
	},
	{
		id: 'pink-sheep',
		name: 'Pink Sheep',
		borderColor: '#de7f9c',
		requires: {achievement: SheepStarer.id},
	},
	{
		id: 'slime',
		name: 'Slime',
		borderColor: '#497736',
		requires: undefined,
	},
	{
		id: 'wolf',
		name: 'Wolf',
		borderColor: '#dddadb',
		requires: {achievement: PackOfWolves.id},
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
