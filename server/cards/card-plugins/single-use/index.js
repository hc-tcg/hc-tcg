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
import LootingSingleUseCard from './looting'

function registerCards(game) {
	new ClockSingleUseCard().register(game)
	new LavaBucketSingleUseCard().register(game)
	new SplashPotionOfPoisonSingleUseCard().register(game)
	new SplashPotionOfHealingSingleUseCard().register(game)
	new GoldenAppleSingleUseCard().register(game)
	new InstantHealthSingleUseCard().register(game)
	new InstantHealthIISingleUseCard().register(game)
	new BowSingleUseCard().register(game)
	new CrossbowSingleUseCard().register(game)
	new IronSwordSingleUseCard().register(game)
	new DiamondSwordSingleUseCard().register(game)
	new NetheriteSwordSingleUseCard().register(game)
	new GoldenAxeSingleUseCard().register(game)
	new TNTSingleUseCard().register(game)
	new ChorusFruitSingleUseCard().register(game)
	new InvisibilityPotionSingleUseCard().register(game)
	new FishingRodSingleUseCard().register(game)
	new EmeraldSingleUseCard().register(game)
	new FlintAndSteelSingleUseCard().register(game)
	new ComposterSingleUseCard().register(game)
	new LeadSingleUseCard().register(game)
	new SpyglassSingleUseCard().register(game)
	new ChestSingleUseCard().register(game)
	new KnockbackSingleUseCard().register(game)
	new EfficiencySingleUseCard().register(game)
	new CurseOfBindingSingleUseCard().register(game)
	new LootingSingleUseCard().register(game)
}

export default registerCards
