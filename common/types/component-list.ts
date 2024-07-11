import {Predicate} from '../filters'
import {GameModel} from '../models/game-model'
import {Entity, newEntity} from './game-state'

export class ComponentList<Id extends Entity, Value extends {entity: Id}> {
	game: GameModel
	data: Record<Id, Value>

	constructor(game: GameModel) {
		this.game = game
		this.data = {} as Record<Id, Value>
	}

	public get(id: Id | null) {
		if (!id) return null
		return this.data[id] || null
	}

	public narrow(entity: Entity | null): entity is Id {
		if (!entity) return false
		return entity in this.data
	}

	public getOrThrowError(id: Id | null) {
		if (id && id in this.data) return this.data[id]
		throw new Error(`Could not find id \`${id}\` in entity list`)
	}

	/** Add a value and return the ID of the value */
	public new<Args extends Array<any>>(
		newValue: new (game: GameModel, id: Id, ...args: Args) => Value,
		...args: Args
	): Value {
		const value = new newValue(this.game, newEntity() as Id, ...args)
		this.data[value.entity] = value
		return value
	}

	public list(): Array<Value> {
		return Object.values(this.data)
	}

	public filterEntities(...predicates: Array<Predicate<Value>>): Array<Id> {
		return Object.values(this.data)
			.map((value) => value as Value)
			.filter((value) => predicates.every((predicate) => predicate(this.game, value)))
			.map((value) => value.entity)
	}

	public filter(...predicates: Array<Predicate<Value>>): Array<Value> {
		return Object.values(this.data)
			.map((value) => value as Value)
			.filter((value) => predicates.every((predicate) => predicate(this.game, value)))
	}

	public findEntity(...predicates: Array<Predicate<Value>>): Id | null {
		return this.filter(...predicates)[0]?.entity || null
	}

	public find(...predicates: Array<Predicate<Value>>): Value | null {
		return this.filter(...predicates)[0] || null
	}

	public somethingFulfills(...predicates: Array<Predicate<Value>>): boolean {
		return this.find(...predicates) !== null
	}
}
