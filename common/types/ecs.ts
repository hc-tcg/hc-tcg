import {ComponentQuery} from '../components/query'
import {Entity, newEntity} from '../entities'
import {GameModel} from '../models/game-model'

export type Component = {
	entity: Entity<any>
}

/** A map of entities to component objects. Components in the component
 * table can be queried. See the filter and find methods for more information.
 *
 * Fruther Work - We can likely optimize queries by giving each component their
 * own table. Additionally we can reduce queries by finding a faster way to do
 * relations for slots and the card that is in them.
 */
export default class ComponentTable {
	game: GameModel
	tables: Record<string, Record<Entity<any>, Component>>
	tableMap: Record<Entity<any>, string>

	constructor(game: GameModel) {
		this.game = game
		this.tables = {} as Record<any, Record<Entity<any>, Component>>
		this.tableMap = {}
	}

	/** Get a specific entity by the ID */
	public get<T>(id: Entity<T> | null): T | null {
		if (!id) return null
		let table = this.tableMap[id]
		// @ts-ignore
		return this.tables[table][id] || null
	}

	/** Get a specific entity by the ID. If the entity does not exist, raise an error */
	public getOrError<T>(id: Entity<T>): T {
		if (!id || !(id in this.tables))
			throw new Error(`Could not find component with ID \`${id}\ in ECS`)
		// @ts-ignore
		return this.tables[id]
	}

	/** Remove an entity from the ECS. Before removing a component from the ECS, first consider if you can
	 * mark the element as invalid instead.
	 */
	public delete(id: Entity<any>) {
		delete this.tables[id]
	}

	/** Add a entity linked to a component and return the ID of the value */
	public new<T extends Component, Args extends Array<any>>(
		newValue: new (game: GameModel, id: T['entity'], ...args: Args) => T,
		...args: Args
	): T {
		const value = new newValue(
			this.game,
			newEntity<T['entity']>(newValue.name, this.game),
			...args,
		)
		if (!this.tables[newValue.name]) {
			this.tables[newValue.name] = {}
		}
		this.tableMap[value.entity] = newValue.name
		this.tables[newValue.name][value.entity] = value
		return value
	}

	/** Filter all entities in the game by a given predicate
	 * ```ts
	 * import query from 'common/components/query'
	 * // Get all slots for the current player.
	 * game.components.filter(SlotComponent, query.slot.currentPlayer)
	 * ```
	 */
	public filter<T extends Component>(
		type: new (...args: Array<any>) => T,
		...predicates: Array<ComponentQuery<T>>
	): Array<T> {
		return Object.values(this.tables[type.name])
			.filter((x) => x instanceof type)
			.filter((value) =>
				predicates.every((predicate) => predicate(this.game, value as T)),
			) as any
	}

	public filterEntities<T extends Component>(
		type: new (...args: Array<any>) => T,
		...predicates: Array<ComponentQuery<T>>
	): Array<T['entity']> {
		return this.filter(type, ...predicates)?.map((x) => x.entity)
	}

	/** Find a component that fulfills a condition. This method does not neccisarily return
	 * oldest or first item to satisfy the condition. When using this method, assume you will get a random item.
	 * For drawing cards please use `player.draw()` instead as this will grab the items in the correct order.
	 */
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

	/** Check if a component exists and return true if that is the case. */
	public exists<T extends Component>(
		type: new (...args: Array<any>) => T,
		...predicates: Array<ComponentQuery<T>>
	): boolean {
		return this.find(type, ...predicates) !== null
	}
}
