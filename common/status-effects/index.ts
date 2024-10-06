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
import EfficiencyEffect from './efficiency'
import ExBossNineEffect from './exboss-nine'
import FireEffect from './fire'
import FortuneEffect from './fortune'
import {GasLightEffect, GasLightTriggeredEffect} from './gas-light'
import GoMiningEffect from './go-mining'
import {IgnoreAttachSlotEffect} from './ignore-attach'
import {
	InvisibilityPotionHeadsEffect as InvisibilityPotionHeadsEffect,
	InvisibilityPotionTailsEffect as InvisibilityPotionTailsEffect,
} from './invisibility-potion'
import LooseShellEffect from './loose-shell'
import MelodyEffect from './melody'
import {
	MultiturnPrimaryAttackDisabledEffect,
	MultiturnSecondaryAttackDisabledEffect,
} from './multiturn-attack-disabled'
import MuseumCollectionEffect from './museum-collection'
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
import TFCDiscardedFromEffect from './tfc-discarded-from'
import TimeSkipDisabledEffect from './time-skip-disabled'
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
	ExBossNineEffect,
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
	GoMiningEffect,
	RoyalProtectionEffect,
	TargetBlockEffect,
	GasLightEffect,
	GasLightTriggeredEffect,
	IgnoreAttachSlotEffect,
	EfficiencyEffect,
	LooseShellEffect,
	TFCDiscardedFromEffect,
	TimeSkipDisabledEffect,
]

export const STATUS_EFFECTS: Record<string, StatusEffect> =
	STATUS_EFFECTS_LIST.reduce((result: Record<string, StatusEffect>, effect) => {
		result[effect.id] = effect
		return result
	}, {})
