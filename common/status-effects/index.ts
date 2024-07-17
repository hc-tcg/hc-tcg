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
import UsedClock from './used-clock'
import RevivedByDeathloop from './revived-by-deathloop'
import Betrayed from './betrayed'
import SheepStare from './sheep-stare'
import {AussiePing as AussiePing, AussiePingImmune as AussiePingImmune} from './aussie-ping'
import {
	InvisibilityPotionHeads as InvisibilityPotionHeads,
	InvisibilityPotionTails as InvisibilityPotionTails,
} from './invisibility-potion'
import TurnSkipped from './turn-skipped'
import {PrimaryAttackDisabled, SecondaryAttackDisabled} from './derp-coin'
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
	UsedClock,
	RevivedByDeathloop,
	Betrayed,
	SheepStare,
	AussiePing,
	AussiePingImmune,
	InvisibilityPotionHeads,
	InvisibilityPotionTails,
	TurnSkipped,
	PrimaryAttackDisabled,
	SecondaryAttackDisabled,
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
