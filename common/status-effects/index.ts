import type StatusEffect from './status-effect'
// import FireStatusEffect from './fire'
// import PoisonStatusEffect from './poison'
// import SleepingStatusEffect from './sleeping'
// import BadOmenStatusEffect from './badomen'
// import SlownessStatusEffect from './slowness'
// import WeaknessStatusEffect from './weakness'
// import ProtectedStatusEffect from './protected'
// import DyedStatusEffect from './dyed'
// import MuseumCollectionStatusEffect from './museum-collection'
// import SmeltingStatusEffect from './smelting'
// import MelodyStatusEffect from './melody'
// import UsedClockStatusEffect from './used-clock'
// import RevivedByDeathloopStatusEffect from './revived-by-deathloop'
// import BetrayedStatusEffect from './betrayed'
// import SheepStareStatusEffect from './sheep-stare'
// import {AussiePingStatusEffect, AussiePingImmuneStatusEffect} from './aussie-ping'
// import {
// 	InvisibilityPotionHeadsStatusEffect,
// 	InvisibilityPotionTailsStatusEffect,
// } from '../../invisibility-potion'

const effectClasses: Array<StatusEffect> = [
	// new FireStatusEffect(),
	// new PoisonStatusEffect(),
	// new SleepingStatusEffect(),
	// new BadOmenStatusEffect(),
	// new SlownessStatusEffect(),
	// new WeaknessStatusEffect(),
	// new ProtectedStatusEffect(),
	// new DyedStatusEffect(),
	// new MuseumCollectionStatusEffect(),
	// new SmeltingStatusEffect(),
	// new MelodyStatusEffect(),
	// new UsedClockStatusEffect(),
	// new RevivedByDeathloopStatusEffect(),
	// new BetrayedStatusEffect(),
	// new SheepStareStatusEffect(),
	// new AussiePingStatusEffect(),
	// new AussiePingImmuneStatusEffect(),
	// new InvisibilityPotionHeadsStatusEffect(),
	// new InvisibilityPotionTailsStatusEffect(),
]

export const STATUS_EFFECT_CLASSES: Record<string, StatusEffect> = effectClasses.reduce(
	(result: Record<string, StatusEffect>, effect) => {
		if (!effect.props) return result
		result[effect.props.id] = effect
		return result
	},
	{}
)
