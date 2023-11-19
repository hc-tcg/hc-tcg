import Ailment from './ailment'
import FireAilment from './fire'
import PoisonAilment from './poison'
import SleepingAilment from './sleeping'
import BadOmenAilment from './badomen'
import SlownessAilment from './slowness'
import WeaknessAilment from './weakness'
import ProtectedAilment from './protected'
import DyedAilment from './dyed'
import MuseumCollectionAilment from './museum-collection'
import BrewingAilment from './brewing'
import SmeltingAilment from './smelting'

const cardClasses: Array<Ailment> = [
	new FireAilment(),
	new PoisonAilment(),
	new SleepingAilment(),
	new BadOmenAilment(),
	new SlownessAilment(),
	new WeaknessAilment(),
	new ProtectedAilment(),
	new DyedAilment(),
	new MuseumCollectionAilment(),
	new BrewingAilment(),
	new SmeltingAilment(),
]

export const AILMENT_CLASSES: Record<string, Ailment> = cardClasses.reduce(
	(result: Record<string, Ailment>, card) => {
		result[card.id] = card
		return result
	},
	{}
)
