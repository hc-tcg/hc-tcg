import {Coin} from '../types'
import CreeperCoin from './creeper'
import EvilXCoin from './evilx'

export const ALL_COINS: Coin[] = [CreeperCoin, EvilXCoin]

export const COINS: Record<string | number, Coin> = ALL_COINS.reduce(
	(result: Record<string | number, Coin>, card) => {
		result[card.id] = card
		return result
	},
	{},
)
