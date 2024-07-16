import type StatusEffect from './status-effect'
import FireStatusEffect from './fire'
import PoisonStatusEffect from './poison'
import SleepingStatusEffect from './sleeping'
import BadOmenStatusEffect from './badomen'
import SlownessStatusEffect from './slowness'
import WeaknessStatusEffect from './weakness'
import ProtectedStatusEffect from './protected'
import DyedStatusEffect from './dyed'
import MuseumCollectionStatusEffect from './museum-collection'
import SmeltingStatusEffect from './smelting'
import MelodyStatusEffect from './melody'
import UsedClockStatusEffect from './used-clock'
import RevivedByDeathloopStatusEffect from './revived-by-deathloop'
import BetrayedStatusEffect from './betrayed'
import SheepStareStatusEffect from './sheep-stare'
import {AussiePingStatusEffect, AussiePingImmuneStatusEffect} from './aussie-ping'
import {
	InvisibilityPotionHeadsStatusEffect,
	InvisibilityPotionTailsStatusEffect,
} from './invisibility-potion'

const effectClasses: Array<new () => StatusEffect> = [
	FireStatusEffect,
	PoisonStatusEffect,
	SleepingStatusEffect,
	BadOmenStatusEffect,
	SlownessStatusEffect,
	WeaknessStatusEffect,
	ProtectedStatusEffect,
	DyedStatusEffect,
	MuseumCollectionStatusEffect,
	SmeltingStatusEffect,
	MelodyStatusEffect,
	UsedClockStatusEffect,
	RevivedByDeathloopStatusEffect,
	BetrayedStatusEffect,
	SheepStareStatusEffect,
	AussiePingStatusEffect,
	AussiePingImmuneStatusEffect,
	InvisibilityPotionHeadsStatusEffect,
	InvisibilityPotionTailsStatusEffect,
]

export const STATUS_EFFECTS: Record<string, StatusEffect> = effectClasses.reduce(
	(result: Record<string, StatusEffect>, effectClass) => {
		let effect = new effectClass()
		if (!effect.props) return result
		result[effectClass.name] = effect
		result[effect.props.id] = effect
		return result
	},
	{}
)
