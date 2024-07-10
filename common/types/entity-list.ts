import {Predicate} from '../filters'
import {GameModel} from '../models/game-model'

export class EntityList<Id extends string, Value extends {id: Id}> {
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

	/** Add a value and return the ID of the value */
	public add(value: Value) {
		this.data[value.id] = value
		return value.id
	}

	public list(): Array<Value> {
		return Object.values(this.data)
	}

	public filter(...predicates: Array<Predicate<Value>>): Array<Value> {
		return Object.values(this.data)
			.map((value) => value as Value)
			.filter((value) => predicates.every((predicate) => predicate(this.game, value)))
	}

	public find(...predicates: Array<Predicate<Value>>): Value | null {
		return this.filter(...predicates)[0] || null
	}

	public somethingFulfills(...predicates: Array<Predicate<Value>>): boolean {
		return this.find(...predicates) !== null
	}
}
