import British from './british'
import CertifiedZombie from './certified-zombie'
import DeceptiveSpectacles from './deceptive-spectacles'
import DeckedOut from './decked-out'
import DefeatEvilX from './defeat-evil-x'
import Designer from './designer'
import Ethogirl from './ethogirl'
import HotTake from './hot-take'
import HowDidWeGetHere from './how-did-we-get-here'
import Innefective from './innefective'
import AllCards from './jack-of-all-cards'
import NakedAndScared from './naked-and-scared'
import NoDerpcoins from './no-derpcoins'
import OreSnatcher from './ore-snatcher'
import PackOfWolves from './pack-of-wolves'
import ServerLag from './server-lag'
import SheepStarer from './sheep-starer'
import SUStainable from './sustainable'
import TeamStar from './team-star'
import {Achievement} from './types'
import Untouchable from './untouchable'
import Win from './wins'
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
	ServerLag,
	DeceptiveSpectacles,
	Untouchable,
	TeamStar,
	OreSnatcher,
	SheepStarer,
	NakedAndScared,
	HotTake,
	Designer,
	CertifiedZombie,
	SUStainable,
	Innefective,
	Win,
]

export const ACHIEVEMENTS: Record<string | number, Achievement> =
	ACHIEVEMENTS_LIST.reduce(
		(result: Record<string | number, Achievement>, card) => {
			result[card.numericId] = card
			result[card.id] = card
			return result
		},
		{},
	)
