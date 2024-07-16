import Clock from './clock'
import LavaBucket from './lava-bucket'
import SplashPotionOfPoison from './splash-potion-of-poison'
import SplashPotionOfHealing from './splash-potion-of-healing'
import GoldenApple from './golden-apple'
import InstantHealth from './instant-health'
import InstantHealthII from './instant-health-ii'
import Bow from './bow'
import Crossbow from './crossbow'
import IronSword from './iron-sword'
import DiamondSword from './diamond-sword'
import NetheriteSword from './netherite-sword'
import GoldenAxe from './golden-axe'
import TNT from './tnt'
import ChorusFruit from './chorus-fruit'
import InvisibilityPotion from './invisibility-potion'
import FishingRod from './fishing-rod'
import Emerald from './emerald'
import FlintAndSteel from './flint-and-steel'
import Composter from './composter'
import Lead from './lead'
import Spyglass from './spyglass'
import Chest from './chest'
import Knockback from './knockback'
import Efficiency from './efficiency'
import CurseOfBinding from './curse-of-binding'
import CurseOfVanishing from './curse-of-vanishing'
import Fortune from './fortune'
import Mending from './mending'
import Looting from './looting'
import Card from '../../base/card'

const singleUseCardClasses: Array<new () => Card> = [
	InstantHealth,
	SplashPotionOfHealing,
	InstantHealthII,
	GoldenApple,
	Bow,
	ChorusFruit,
	IronSword,
	TNT,
	Crossbow,
	DiamondSword,
	GoldenAxe,
	LavaBucket,
	SplashPotionOfPoison,
	NetheriteSword,
	InvisibilityPotion,
	Clock,
	Composter,
	FlintAndSteel,
	Lead,
	Chest,
	Emerald,
	Spyglass,
	FishingRod,
	Fortune,
	Knockback,
	Efficiency,
	CurseOfBinding,
	CurseOfVanishing,
	Mending,
	Looting,
]

export default singleUseCardClasses
