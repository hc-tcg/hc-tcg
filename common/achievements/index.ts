import British from './british'
import CantTouchThis from './cant-touch-this'
import CertifiedZombie from './certified-zombie'
import DeckedOut from './decked-out'
import DefeatEvilX from './defeat-evil-x'
import Ethogirl from './ethogirl'
import EyeOfTheSpider from './eye-of-the-spider'
import FreeAndSteel from './free-and-steel'
import GoFish from './go-fish'
import HallOfAll from './hall-of-all'
import HermitsAndCrafting from './hermits-and-crafting'
import HotTake from './hot-take'
import HowDidWeGetHere from './how-did-we-get-here'
import HurtinHermits from './hurtin-hermits'
import Inneffective from './inneffective'
import AllCards from './jack-of-all-cards'
import LoyaltyIII from './loyalty-iii'
import LuckyStreak from './lucky-streak'
import MasterOfPuppets from './master-of-puppets'
import NakedAndScared from './naked-and-scared'
import NewTeamCanada from './new-team-canada'
import NoDerpcoins from './no-derpcoins'
import OreSnatcher from './ore-snatcher'
import PackOfWolves from './pack-of-wolves'
import PeskyBird from './pesky-bird'
import ServerLag from './server-lag'
import SUStainable from './sustainable'
import TargetedLightning from './targeted-lightning'
import TeamStar from './team-star'
import {
	BalancedWins,
	BuilderWins,
	ExplorerWins,
	FarmWins,
	MinerWins,
	PranksterWins,
	PvpWins,
	RedstoneWins,
	SpeedrunnerWins,
	TerraformWins,
} from './type-wins'
import {Achievement} from './types'
import UselessMachine from './useless-machine'
import Win from './wins'
import Wipeout from './wipeout'

export const ACHIEVEMENTS_LIST: Array<Achievement> = [
	AllCards,
	CantTouchThis,
	DeckedOut,
	Ethogirl,
	MasterOfPuppets,
	EyeOfTheSpider,
	PackOfWolves,
	GoFish,
	HallOfAll,
	HowDidWeGetHere,
	LuckyStreak,
	HurtinHermits,
	Wipeout,
	DefeatEvilX,
	NoDerpcoins,
	British,
	ServerLag,
	PeskyBird,
	NewTeamCanada,
	TeamStar,
	UselessMachine,
	OreSnatcher,
	NakedAndScared,
	HotTake,
	HermitsAndCrafting,
	CertifiedZombie,
	SUStainable,
	Inneffective,
	TargetedLightning,
	LoyaltyIII,
	Win,
	BalancedWins,
	BuilderWins,
	SpeedrunnerWins,
	RedstoneWins,
	FarmWins,
	PvpWins,
	TerraformWins,
	PranksterWins,
	MinerWins,
	ExplorerWins,
	FreeAndSteel,
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
