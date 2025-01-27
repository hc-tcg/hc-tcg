import British from './british'
import DeceptiveSpectacles from './deceptive-spectacles'
import DeckedOut from './decked-out'
import DefeatEvilX from './defeat-evil-x'
import Ethogirl from './ethogirl'
import HotTake from './hot-take'
import HowDidWeGetHere from './how-did-we-get-here'
import AllCards from './jack-of-all-cards'
import NoDerpcoins from './no-derpcoins'
import PackOfWolves from './pack-of-wolves'
import {Achievement} from './types'
import {Win1, Win10, Win100, Win1000, Win500} from './wins'
import Wipeout from './wipeout'

export const ACHIEVEMENTS_LIST: Array<Achievement> = [
	AllCards,
	DeckedOut,
	Ethogirl,
	PackOfWolves,
	HowDidWeGetHere,
	Wipeout,
	DefeatEvilX,
	NoDerpcoins,
	British,
	HotTake,
	DeceptiveSpectacles,
	Win1,
	Win10,
	Win100,
	Win500,
	Win1000,
]

export const ACHIEVEMENTS: Record<string | number, Achievement> =
	ACHIEVEMENTS_LIST.reduce(
		(result: Record<string | number, Achievement>, card) => {
			result[card.numericId] = card
			return result
		},
		{},
	)
