import StatusEffect from './status-effect'
import FireStatusEffect from './fire'
import PoisonStatusEffect from './poison'
import SleepingStatusEffect from './sleeping'
import BadOmenStatusEffect from './badomen'
import SlownessStatusEffect from './slowness'
import WeaknessStatusEffect from './weakness'
import WeaknessDummyStatusEffect from './weakness'
import ProtectedStatusEffect from './protected'
import DyedStatusEffect from './dyed'
import MuseumCollectionStatusEffect from './museum-collection'
import SmeltingStatusEffect from './smelting'
import MelodyStatusEffect from './melody'
import UsedClockStatusEffect from './used-clock'

const effectClasses: Array<StatusEffect> = [
	new FireStatusEffect(),
	new PoisonStatusEffect(),
	new SleepingStatusEffect(),
	new BadOmenStatusEffect(),
	new SlownessStatusEffect(),
	new WeaknessStatusEffect(),
	new ProtectedStatusEffect(),
	new DyedStatusEffect(),
	new MuseumCollectionStatusEffect(),
	new SmeltingStatusEffect(),
	new MelodyStatusEffect(),
	new UsedClockStatusEffect(),
]

const dummyEffectClasses: Array<StatusEffect> = [
	new WeaknessDummyStatusEffect(),
]

export const STATUS_EFFECT_CLASSES: Record<string, StatusEffect> = effectClasses.reduce(
	(result: Record<string, StatusEffect>, card) => {
		result[card.id] = card
		return result
	},
	{}
)

export const DUMMY_STATUS_EFFECT_CLASSES: Record<string, StatusEffect> = dummyEffectClasses.reduce(
	(result: Record<string, StatusEffect>, card) => {
		result[card.id] = card
		return result
	},
	{}
)
