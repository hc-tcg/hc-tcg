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
import LootingEffectCard from './looting'
import StringEffectCard from './string'
import TurtleShellEffectCard from './turtle-shell'
import EffectCard from './_effect-card'
import ThornsIIEffectCard from './thorns_ii'
import ThornsIIIEffectCard from './thorns_iii'
import ChainmailArmorEffectCard from './chainmail-armor'
import CommandBlockEffectCard from './command-block'
import LightningRodEffectCard from './lightning-rod'

/** @type {Array<EffectCard>} */
const EFFECT_CARDS = [
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

	// AE cards
	// @TODO Armor Stand (armor_stand)
	new ChainmailArmorEffectCard(),
	new CommandBlockEffectCard(),
	new LightningRodEffectCard(),
	new StringEffectCard(),
	new ThornsIIEffectCard(),
	new ThornsIIIEffectCard(),
	new TurtleShellEffectCard(),
]

export default EFFECT_CARDS
