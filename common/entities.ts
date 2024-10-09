import type {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	RowComponent,
	SlotComponent,
	StatusEffectComponent,
} from './components'
import {AIComponent} from './components/ai-component'
import {ViewerComponent} from './components/viewer-component'

/** A unique identifier for a component in the component table. This value is safe to
 *  be send to the client and should be used for that purpose.
 * The <Wrapping> generic is used by the `ComponentTable`'s get function to return the correct type.
 */
export type Entity<Wrapping> = string & {
	// Due to how typescript works, we need `Wrapping` to show up in the type for type inference.
	__entity_type_do_not_use_ever_the_program_will_crash: Wrapping
}

export type AIEntity = Entity<AIComponent>
export type PlayerEntity = Entity<PlayerComponent>
export type SlotEntity = Entity<SlotComponent>
export type RowEntity = Entity<RowComponent>
export type CardEntity = Entity<CardComponent>
export type StatusEffectEntity = Entity<StatusEffectComponent>
export type ObserverEntity = Entity<ObserverComponent>
export type ViewerEntity = Entity<ViewerComponent>

/** Create a new entity */
export function newEntity<T>(
	entityName: string,
	randomNumber: number,
): Entity<T> {
	return `${entityName}-${Math.floor(
		randomNumber * Number.MAX_SAFE_INTEGER,
	).toString(16)}` as Entity<T>
}
