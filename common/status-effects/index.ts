import FireEffect from './fire'
import PoisonEffect from './poison'
import SleepingEffect from './sleeping'
import BadOmenEffect from './badomen'
import SlownessEffect from './slowness'
import WeaknessEffect from './weakness'
import ProtectedEffect from './protected'
import DyedEffect from './dyed'
import MuseumCollectionEffect from './museum-collection'
import SmeltingEffect from './smelting'
import MelodyEffect from './melody'
import UsedClockEffect from './used-clock'
import RevivedByDeathloopEffect from './revived-by-deathloop'
import BetrayedEffect from './betrayed'
import SheepStareEffect from './sheep-stare'
import {AussiePingEffect as AussiePingEffect, AussiePingImmuneEffect as AussiePingImmuneEffect} from './aussie-ping'
import {
	InvisibilityPotionHeadsEffect as InvisibilityPotionHeadsEffect,
	InvisibilityPotionTailsEffect as InvisibilityPotionTailsEffect,
} from './invisibility-potion'
import TurnSkippedEffect from './turn-skipped'
import {PrimaryAttackDisabledEffect, SecondaryAttackDisabledEffect} from './derp-coin'
import {TrapHoleEffect} from './trap-hole'
import CurseOfBindingEffect from './curse-of-binding'
import {StatusEffect} from './status-effect'

const effectClasses: Array<new () => StatusEffect> = [
	/* Regualr status effects */
	FireEffect,
	PoisonEffect,
	SleepingEffect,
	BadOmenEffect,
	SlownessEffect,
	WeaknessEffect,
	ProtectedEffect,
	DyedEffect,
	MuseumCollectionEffect,
	SmeltingEffect,
	MelodyEffect,

	/* System Status Effect */
	UsedClockEffect,
	RevivedByDeathloopEffect,
	BetrayedEffect,
	SheepStareEffect,
	AussiePingEffect,
	AussiePingImmuneEffect,
	InvisibilityPotionHeadsEffect,
	InvisibilityPotionTailsEffect,
	TurnSkippedEffect,
	PrimaryAttackDisabledEffect,
	SecondaryAttackDisabledEffect,
	TrapHoleEffect,
	CurseOfBindingEffect,
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
