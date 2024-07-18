/**
 * This file contains entities for the ECS. The entities are shared between the client and server to keep a unique
 * and consistent reference each variable.
 */

import type {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	RowComponent,
	SlotComponent,
	StatusEffectComponent,
} from './components'

// Due to how typescript works, we need `Wrapping` to show up in the type for type inference.
export type Entity<Wrapping> = string & {
	__entity_type_do_not_use_ever_the_program_will_crash: Wrapping
}

export type PlayerEntity = Entity<PlayerComponent>
export type SlotEntity = Entity<SlotComponent>
export type RowEntity = Entity<RowComponent>
export type CardEntity = Entity<CardComponent>
export type StatusEffectEntity = Entity<StatusEffectComponent>
export type ObserverEntity = Entity<ObserverComponent>

export function newEntity<T>(entityName: string): Entity<T> {
	return (entityName + '-' + Math.random().toString()) as Entity<T>
}
