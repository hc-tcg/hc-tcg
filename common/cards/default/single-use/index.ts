import ClockSingleUseCard from './clock'
import LavaBucketSingleUseCard from './lava-bucket'
import SplashPotionOfPoisonSingleUseCard from './splash-potion-of-poison'
import SplashPotionOfHealingSingleUseCard from './splash-potion-of-healing'
import GoldenAppleSingleUseCard from './golden-apple'
import InstantHealthSingleUseCard from './instant-health'
import InstantHealthIISingleUseCard from './instant-health-ii'
import BowSingleUseCard from './bow'
import CrossbowSingleUseCard from './crossbow'
import IronSwordSingleUseCard from './iron-sword'
import DiamondSwordSingleUseCard from './diamond-sword'
import NetheriteSwordSingleUseCard from './netherite-sword'
import GoldenAxeSingleUseCard from './golden-axe'
import TNTSingleUseCard from './tnt'
import ChorusFruitSingleUseCard from './chorus-fruit'
import InvisibilityPotionSingleUseCard from './invisibility-potion'
import FishingRodSingleUseCard from './fishing-rod'
import EmeraldSingleUseCard from './emerald'
import FlintAndSteelSingleUseCard from './flint-and-steel'
import ComposterSingleUseCard from './composter'
import LeadSingleUseCard from './lead'
import SpyglassSingleUseCard from './spyglass'
import ChestSingleUseCard from './chest'
import KnockbackSingleUseCard from './knockback'
import EfficiencySingleUseCard from './efficiency'
import CurseOfBindingSingleUseCard from './curse-of-binding'
import CurseOfVanishingSingleUseCard from './curse-of-vanishing'
import FortuneSingleUseCard from './fortune'
import MendingSingleUseCard from './mending'
import LootingSingleUseCard from './looting'
import Card from '../../base/card'

const singleUseCardClasses: Array<new () => Card> = [
	InstantHealthSingleUseCard,
	SplashPotionOfHealingSingleUseCard,
	InstantHealthIISingleUseCard,
	GoldenAppleSingleUseCard,
	BowSingleUseCard,
	ChorusFruitSingleUseCard,
	IronSwordSingleUseCard,
	TNTSingleUseCard,
	CrossbowSingleUseCard,
	DiamondSwordSingleUseCard,
	GoldenAxeSingleUseCard,
	LavaBucketSingleUseCard,
	SplashPotionOfPoisonSingleUseCard,
	NetheriteSwordSingleUseCard,
	InvisibilityPotionSingleUseCard,
	ClockSingleUseCard,
	ComposterSingleUseCard,
	FlintAndSteelSingleUseCard,
	LeadSingleUseCard,
	ChestSingleUseCard,
	EmeraldSingleUseCard,
	SpyglassSingleUseCard,
	FishingRodSingleUseCard,
	FortuneSingleUseCard,
	KnockbackSingleUseCard,
	EfficiencySingleUseCard,
	CurseOfBindingSingleUseCard,
	CurseOfVanishingSingleUseCard,
	MendingSingleUseCard,
	LootingSingleUseCard,
]

export default singleUseCardClasses
