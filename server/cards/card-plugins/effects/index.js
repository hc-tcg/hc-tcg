import WaterBucketEffectCard from './water-bucket'
import MilkBucketEffectCard from './milk-bucket'
import ShieldEffectCard from './shield'
import IronArmorEffectCard from './iron-armor'
import GoldArmorEffectCard from './gold-armor'
import DiamondArmorEffectCard from './diamond-armor'
import NetheriteArmorEffectCard from './netherite-armor'
import WolfEffectCard from './wolf'
import TotemEffectCard from './totem'
import BedEffectCard from './bed'
import ThornsEffectCard from './thorns'

function registerCards(game) {
	new WaterBucketEffectCard().register(game)
	new MilkBucketEffectCard().register(game)
	new ShieldEffectCard().register(game)
	new IronArmorEffectCard().register(game)
	new GoldArmorEffectCard().register(game)
	new DiamondArmorEffectCard().register(game)
	new NetheriteArmorEffectCard().register(game)
	new WolfEffectCard().register(game)
	new TotemEffectCard().register(game)
	new BedEffectCard().register(game)
	new ThornsEffectCard().register(game)
}

export default registerCards
