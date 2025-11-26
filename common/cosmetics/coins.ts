import EyeOfTheSpider from '../achievements/eye-of-the-spider'
import GoFish from '../achievements/go-fish'
import GottaSchreep from '../achievements/gotta-schreep'
import HallOfAll from '../achievements/hall-of-all'
import HermitsAndCrafting from '../achievements/hermits-and-crafting'
import HurtinHermits from '../achievements/hurtin-hermits'
import NoDerpcoins from '../achievements/no-derpcoins'
import PackOfWolves from '../achievements/pack-of-wolves'
import ServerLag from '../achievements/server-lag'
import UselessMachine from '../achievements/useless-machine'
import WashedUp from '../achievements/washed-up'
import Win from '../achievements/wins'
import Wipeout from '../achievements/wipeout'
import {Coin} from './types'

const CoinDefinitions: Omit<Coin, 'type'>[] = [
	{
		id: 'creeper',
		name: 'Creeper',
		borderColor: '#e1b530',
	},
	{
		id: 'bdoubleo100',
		name: 'Bdubs',
		borderColor: '#000000',
		requires: {achievement: GottaSchreep.id},
	},
	{
		id: 'server-lag',
		name: 'Chicken',
		borderColor: '#CD1414',
		requires: {achievement: ServerLag.id},
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
		requires: {achievement: GoFish.id},
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
		id: 'cat',
		name: 'Jellie',
		borderColor: '#C57EA7',
		requires: {achievement: HermitsAndCrafting.id},
	},
	{
		id: 'pink-sheep',
		name: 'Pink Sheep',
		borderColor: '#de7f9c',
		requires: {achievement: HallOfAll.id},
	},
	{
		id: 'skeleton',
		name: 'Skeleton',
		borderColor: '#494949',
		requires: {achievement: Wipeout.id},
	},
	{
		id: 'slime',
		name: 'Slime',
		borderColor: '#497736',
		requires: {achievement: UselessMachine.id},
	},
	{
		id: 'wolf',
		name: 'Wolf',
		borderColor: '#dddadb',
		requires: {achievement: PackOfWolves.id},
	},
	{
		id: 'zombie',
		name: 'Zombie',
		borderColor: '#1A1A1A',
		requires: {achievement: HurtinHermits.id},
	},
	{
		id: 'etho',
		name: 'Etho',
		borderColor: '#2b313f',
		requires: {achievement: WashedUp.id},
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
