import type StatusEffect from './status-effect'
import Fire from './fire'
import Poison from './poison'
import Sleeping from './sleeping'
import BadOmenEffect from './badomen'
import Slowness from './slowness'
import Weakness from './weakness'
import Protected from './protected'
import Dyed from './dyed'
import MuseumCollection from './museum-collection'
import Smelting from './smelting'
import Melody from './melody'
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
import { TrapHoleEffect } from './trap-hole'
import CurseOfBindingEffect from './curse-of-binding'

const effectClasses: Array<new () => StatusEffect> = [
	/* Regualr status effects */
	Fire,
	Poison,
	Sleeping,
	BadOmenEffect,
	Slowness,
	Weakness,
	Protected,
	Dyed,
	MuseumCollection,
	Smelting,
	Melody,

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
