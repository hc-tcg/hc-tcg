import BlastProtection from './blast-protection'
import British from './british'
import CantTouchThis from './cant-touch-this'
import CertifiedZombie from './certified-zombie'
import Channeling from './channeling'
import RedKing from './close-call'
import CostumeParty from './costume-party'
import DeckedOut from './decked-out'
import DefeatEvilX from './defeat-evil-x'
import Demise from './demise'
import DoubleEmerald from './double-emerald'
import Ethogirl from './ethogirl'
import EyeOfTheSpider from './eye-of-the-spider'
import FreeAndSteel from './free-and-steel'
import FullySaturated from './fully-saturated'
import GoFish from './go-fish'
import GodsFavoritePrincess from './gods-favorite-princess'
import GottaSchreep from './gotta-schreep'
import HallOfAll from './hall-of-all'
import HermitsAndCrafting from './hermits-and-crafting'
import HotTake from './hot-take'
import HowDidWeGetHere from './how-did-we-get-here'
import HurtinHermits from './hurtin-hermits'
import iBuy from './ibuy'
import Inneffective from './inneffective'
import IsGreat from './is-great'
import AllCards from './jack-of-all-cards'
import LoyaltyIII from './loyalty-iii'
import MasterOfPuppets from './master-of-puppets'
import NakedAndScared from './naked-and-scared'
import NewTeamCanada from './new-team-canada'
import NoDerpcoins from './no-derpcoins'
import OreSnatcher from './ore-snatcher'
import PackOfWolves from './pack-of-wolves'
import PeskyBird from './pesky-bird'
import PistonExtender from './piston-extender'
import PoePoeEnforcer from './poe-poe-enforcer'
import ServerLag from './server-lag'
import SignalInversion from './signal-inversion'
import {BookDecks, PotionDecks} from './su-decks'
import SUStainable from './sustainable'
import TagTeam from './tag-team'
import TeamStar from './team-star'
import TerribleTrades from './terrible-trades'
import TurtleMaster from './turtle-master'
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
import UltraHardcore from './ultra-hardcore'
import UseLikeAHermit from './use-like-a-hermit'
import UselessMachine from './useless-machine'
import WashedUp from './washed-up'
import Win from './wins'
import Wipeout from './wipeout'
import WorldEater from './world-eater'

export const ACHIEVEMENTS_LIST: Array<Achievement> = [
	// Log term - wins
	Win,
	// Log term - card exploration
	AllCards,
	HermitsAndCrafting,

	// Long term
	Demise,

	// Evil X
	DefeatEvilX,
	NoDerpcoins,

	// Win Condition
	DeckedOut,
	HurtinHermits,

	// effect card - general
	PoePoeEnforcer,
	OreSnatcher,
	LoyaltyIII,
	PackOfWolves,
	FreeAndSteel,
	SUStainable,
	iBuy,

	// effect card - challenge/combo
	UselessMachine,
	GoFish,
	CertifiedZombie,
	UseLikeAHermit,
	Channeling,
	PistonExtender,
	DoubleEmerald,
	BlastProtection,
	TurtleMaster,

	// Effect card / status effect - Challenge/Combo
	GottaSchreep,
	HotTake,
	EyeOfTheSpider,
	British,
	MasterOfPuppets,
	SignalInversion,

	// Misc - Challenge
	GodsFavoritePrincess,
	PeskyBird,
	HowDidWeGetHere,
	CantTouchThis,
	RedKing,
	HallOfAll,
	UltraHardcore,
	Wipeout,
	ServerLag,
	WashedUp,
	WorldEater,
	FullySaturated,
	TagTeam,

	// Deck - challenge
	Inneffective,
	TerribleTrades,
	NakedAndScared,
	IsGreat,
	Ethogirl,
	TeamStar,
	NewTeamCanada,
	CostumeParty,
	PotionDecks,
	BookDecks,

	// Typemaster
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
