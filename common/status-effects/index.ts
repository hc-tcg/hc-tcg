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
import ExBossNineStatusEffect from './exboss-nine'
import UsedClockEffect from './used-clock'
import {DeathloopReady, RevivedByDeathloopEffect} from './death-loop'
import BetrayedEffect from './betrayed'
import SheepStareEffect from './sheep-stare'
import {
	AussiePingEffect as AussiePingEffect,
	AussiePingImmuneEffect as AussiePingImmuneEffect,
} from './aussie-ping'
import {
	InvisibilityPotionHeadsEffect as InvisibilityPotionHeadsEffect,
	InvisibilityPotionTailsEffect as InvisibilityPotionTailsEffect,
} from './invisibility-potion'
import TurnSkippedEffect from './turn-skipped'
import {
	PrimaryAttackDisabledEffect,
	SecondaryAttackDisabledEffect,
} from './singleturn-attack-disabled'
import {TrapHoleEffect} from './trap-hole'
import CurseOfBindingEffect from './curse-of-binding'
import {StatusEffect} from './status-effect'
import FortuneEffect from './fortune'
import {
	MultiturnPrimaryAttackDisabledEffect,
	MultiturnSecondaryAttackDisabledEffect,
} from './multiturn-attack-disabled'
import ChromaKeyedEffect from './chroma-keyed'
import OriginalXbEffect from './original-xb'
import RoyalProtectionEffect from './royal-protection'
import {TargetBlockEffect} from './target-block'

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
	ExBossNineStatusEffect,
	UsedClockEffect,
	DeathloopReady,
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
	FortuneEffect,
	MultiturnPrimaryAttackDisabledEffect,
	MultiturnSecondaryAttackDisabledEffect,
	ChromaKeyedEffect,
	OriginalXbEffect,
	RoyalProtectionEffect,
	TargetBlockEffect,
]

export const STATUS_EFFECTS: Record<string, StatusEffect> = effectClasses.reduce(
	(result: Record<string, StatusEffect>, effectClass) => {
		let effect = new effectClass()
		if (!effect.props) return result
		result[effectClass.name] = effect
		result[effect.props.icon] = effect
		return result
	},
	{}
)
