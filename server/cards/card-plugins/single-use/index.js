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
}

export default registerCards
