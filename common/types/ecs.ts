import {GameModel} from '../models/game-model'

type Predicate<Value> = (game: GameModel, value: Value) => boolean

export class EntityList<ID extends string, Value> {
	game: GameModel
	data: Record<ID, Value>

	constructor(game: GameModel) {
		this.game = game
		this.data = {} as Record<ID, Value>
	}

	public get(id: ID | null): Value | null {
		if (id === null) return null
		return this.data[id] || null
	}

	public add(id: ID, value: Value) {
		this.data[id] = value
	}

	public filter(...predicates: Array<Predicate<Value>>): Array<Value> {
		return Object.values(this.data)
			.map((value) => value as Value)
			.filter((value) => predicates.every((predicate) => predicate(this.game, value)))
	}

	public find(...predicates: Array<Predicate<Value>>): Value | null {
		return this.filter(...predicates)[0] || null
	}
}
