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
import StringEffectCard from './string'
import TurtleShellEffectCard from './turtle-shell'
import ThornsIIEffectCard from './thorns_ii'
import ThornsIIIEffectCard from './thorns_iii'
import ChainmailArmorEffectCard from './chainmail-armor'
import CommandBlockEffectCard from './command-block'
import LightningRodEffectCard from './lightning-rod'
import WaterBucketEffectCard from './water-bucket'
import MilkBucketEffectCard from './milk-bucket'
import ArmorStandEffectCard from './armor-stand'
import EffectCard from '../base/effect-card'
import BrewingStandEffectCard from './brewing-stand'
import FurnaceEffectCard from './furnace'
import CatEffectCard from './cat'

export const EFFECT_CARD_CLASSES: Array<EffectCard> = [
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

	// AE cards
	new ArmorStandEffectCard(),
	new ChainmailArmorEffectCard(),
	new CommandBlockEffectCard(),
	new LightningRodEffectCard(),
	new StringEffectCard(),
	new ThornsIIEffectCard(),
	new ThornsIIIEffectCard(),
	new TurtleShellEffectCard(),

	// Advent of TCG cards
	// new BrewingStandEffectCard(),
	// new FurnaceEffectCard(),
	//new CatEffectCard(),
]
