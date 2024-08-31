import {
	AussiePingEffect as AussiePingEffect,
	AussiePingImmuneEffect as AussiePingImmuneEffect,
} from './aussie-ping'
import BadOmenEffect from './badomen'
import BetrayedEffect from './betrayed'
import ChromaKeyedEffect from './chroma-keyed'
import CurseOfBindingEffect from './curse-of-binding'
import {DeathloopReady, RevivedByDeathloopEffect} from './death-loop'
import DyedEffect from './dyed'
import ExBossNineStatusEffect from './exboss-nine'
import FireEffect from './fire'
import FortuneEffect from './fortune'
import {GasLightEffect, GasLightTriggeredEffect} from './gas-light'
import {IgnoreAttachSlotEffect} from './ignore-attach'
import {
	InvisibilityPotionHeadsEffect as InvisibilityPotionHeadsEffect,
	InvisibilityPotionTailsEffect as InvisibilityPotionTailsEffect,
} from './invisibility-potion'
import MelodyEffect from './melody'
import {
	MultiturnPrimaryAttackDisabledEffect,
	MultiturnSecondaryAttackDisabledEffect,
} from './multiturn-attack-disabled'
import MuseumCollectionEffect from './museum-collection'
import OriginalXbEffect from './original-xb'
import PoisonEffect from './poison'
import ProtectedEffect from './protected'
import RoyalProtectionEffect from './royal-protection'
import SheepStareEffect from './sheep-stare'
import {
	PrimaryAttackDisabledEffect,
	SecondaryAttackDisabledEffect,
} from './singleturn-attack-disabled'
import SleepingEffect from './sleeping'
import SlownessEffect from './slowness'
import SmeltingEffect from './smelting'
import {StatusEffect} from './status-effect'
import {TargetBlockEffect} from './target-block'
import {TrapHoleEffect} from './trap-hole'
import TurnSkippedEffect from './turn-skipped'
import UsedClockEffect from './used-clock'
import WeaknessEffect from './weakness'

export const STATUS_EFFECTS_LIST: Array<StatusEffect> = [
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
	GasLightEffect,
	GasLightTriggeredEffect,
	IgnoreAttachSlotEffect,
]

export const STATUS_EFFECTS: Record<string, StatusEffect> =
	STATUS_EFFECTS_LIST.reduce((result: Record<string, StatusEffect>, effect) => {
		result[effect.id] = effect
		return result
	}, {})
