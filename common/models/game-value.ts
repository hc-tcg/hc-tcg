import {DefaultDictionary} from '../types/game-state'
import {GameModel} from './game-model'

/** Type that allows for additional data about a game to be shared between components */
export class GameValue<T> extends DefaultDictionary<GameModel, T> {
	public set(game: GameModel, value: T) {
		if (!(game.id in this.values)) {
			game.hooks.afterGameEnd.add('GameValue<T>', () => this.clear(game))
		}
		this.setValue(game.id, value)
	}

	public get(game: GameModel): T {
		return this.getValue(game.id)
	}

	public clear(game: GameModel) {
		this.clearValue(game.id)
	}
}
