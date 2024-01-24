import ShieldEffectCard from './shield'
import IronArmorEffectCard from './iron-armor'
import GoldArmorEffectCard from './gold-armor'
import DiamondArmorEffectCard from './diamond-armor'
import NetheriteArmorEffectCard from './netherite-armor'
import WolfEffectCard from './wolf'
import TotemEffectCard from './totem'
import BedEffectCard from './bed'
import ThornsEffectCard from './thorns'
import LoyaltyEffectCard from './loyalty'
import WaterBucketEffectCard from './water-bucket'
import MilkBucketEffectCard from './milk-bucket'
import EffectCard from '../../base/effect-card'

const effectCardClasses: Array<EffectCard> = [
	new BedEffectCard(),
	new WolfEffectCard(),
	new GoldArmorEffectCard(),
	new IronArmorEffectCard(),
	new ShieldEffectCard(),
	new DiamondArmorEffectCard(),
	new NetheriteArmorEffectCard(),
	new TotemEffectCard(),
	new ThornsEffectCard(),
	new LoyaltyEffectCard(),
	new WaterBucketEffectCard(),
	new MilkBucketEffectCard(),
]

export default effectCardClasses
