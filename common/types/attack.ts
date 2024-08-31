import {CardComponent, StatusEffectComponent} from '../components'
import {ComponentQuery} from '../components/query'
import {Entity, PlayerEntity, RowEntity} from '../entities'

export type HermitAttackType = 'primary' | 'secondary' | 'single-use'

export type AttackType =
	| HermitAttackType
	| 'effect'
	| 'weakness'
	| 'status-effect'

export type WeaknessType = 'always' | 'ifWeak' | 'never'

export type AttackDefence = {
	damageReduction: number
}

export type AttackLog = {
	/**The default log for attacks.*/
	defaultLog: string
	/**The name of attacker of this attack.*/
	attacker: string
	/**For Hermit attacks, the name of this attack.*/
	attackName: string
	/**The name of the player that created this attack.*/
	player: string
	/**The name of the player who's the target of this attack.*/
	opponent: string
	/**The name of target of this attack.*/
	target: string
	/**The damage this attack deals.*/
	damage: string
	/**The coinflip for this attack.*/
	coinFlip: string | null
	/**The previously defined log entry.*/
	previousLog?: string
}

export type AttackerEntity =
	| Entity<CardComponent | StatusEffectComponent>
	| 'debug'

export type AttackDefs =
	| {
			attacker?: Entity<StatusEffectComponent> | null | undefined
			/** Status effects must specify the attacking player. */
			player: PlayerEntity
			target?: RowEntity | null | undefined
			type: 'status-effect'
			shouldIgnoreSlots?: Array<ComponentQuery<CardComponent>>
			isBacklash?: boolean
			createWeakness?: WeaknessType
			log?: (values: AttackLog) => string
	  }
	| {
			attacker?: Entity<CardComponent> | null | undefined
			target?: RowEntity | null | undefined
			type: AttackType
			shouldIgnoreSlots?: Array<ComponentQuery<CardComponent>>
			isBacklash?: boolean
			createWeakness?: WeaknessType
			log?: (values: AttackLog) => string
	  }
	| {
			attacker?: Entity<CardComponent> | null | undefined
			/** Single-use cards must include the player, because they may be stolen by Trap Hole. */
			player: PlayerEntity
			target?: RowEntity | null | undefined
			type: 'effect'
			shouldIgnoreSlots?: Array<ComponentQuery<CardComponent>>
			isBacklash?: boolean
			createWeakness?: WeaknessType
			log?: (values: AttackLog) => string
	  }

export type AttackHistoryType =
	| 'add_damage'
	| 'reduce_damage'
	| 'multiply_damage'
	| 'lock_damage'
	| 'set_attacker'
	| 'set_target'
	| 'redirect'

export type AttackHistory = {
	source: AttackerEntity
	type: AttackHistoryType
	value?: any
}
