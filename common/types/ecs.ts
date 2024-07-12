import {ComponentQuery} from '../components/query'
import {GameModel} from '../models/game-model'
import {
	CardComponent,
	PlayerComponent,
	RowComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../components'
import {
	CardEntity,
	Entity,
	PlayerEntity,
	RowEntity,
	SlotEntity,
	StatusEffectEntity,
	newEntity,
} from './game-state'

type Component = {
	entity: Entity
}

// I am sorry - Jake
// prettier-ignore
type ComponentFromEntity<T> = 
	T extends CardEntity ? CardComponent :
	T extends StatusEffectEntity ? StatusEffectComponent :
	T extends SlotEntity ? SlotComponent :
	T extends RowEntity ? RowComponent :
	T extends PlayerEntity ? PlayerComponent : null

export default class ECS {
	game: GameModel
	data: Record<Entity, Component>

	constructor(game: GameModel) {
		this.game = game
		this.data = {} as Record<Entity, Component>
	}

	public get<T extends Entity>(id: T | null): ComponentFromEntity<T> | null {
		if (!id) return null
		// @ts-ignore
		return this.data[id] || null
	}

	public getOrError<T extends Entity>(id: T): ComponentFromEntity<T> {
		if (!id || !(id in this.data))
			throw new Error(`Could not find component with ID \`${id}\ in ECS`)
		// @ts-ignore
		return this.data[id]
	}

	/** Add a entity linked to a component and return the ID of the value */
	public new<T extends Component, Args extends Array<any>>(
		newValue: new (game: GameModel, id: T['entity'], ...args: Args) => T,
		...args: Args
	): T {
		const value = new newValue(
			this.game,
			newEntity(newValue.name + '-entity') as T['entity'],
			...args
		)
		this.data[value.entity] = value
		return value
	}

	public filter<T extends Component>(
		type: new (...args: Array<any>) => T,
		...predicates: Array<ComponentQuery<T>>
	): Array<T> {
		return Object.values(this.data)
			.filter((x) => x instanceof type)
			.filter((value) => predicates.every((predicate) => predicate(this.game, value as T))) as any
	}

	public filterEntities<T extends Component>(
		type: new (...args: Array<any>) => T,
		...predicates: Array<ComponentQuery<T>>
	): Array<T['entity']> {
		return this.filter(type, ...predicates)?.map((x) => x.entity)
	}

	public find<T extends Component>(
		type: new (...args: Array<any>) => T,
		...predicates: Array<ComponentQuery<T>>
	): T | null {
		return this.filter(type, ...predicates)[0] || null
	}

	public findEntity<T extends Component>(
		type: new (...args: Array<any>) => T,
		...predicates: Array<ComponentQuery<T>>
	): T['entity'] | null {
		return this.find(type, ...predicates)?.entity || null
	}

	public somethingFulfills<T extends Component>(
		type: new (...args: Array<any>) => T,
		...predicates: Array<ComponentQuery<T>>
	): boolean {
		return this.find(type, ...predicates) !== null
	}
}
