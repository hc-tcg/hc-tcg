import Ailment from "./ailment"
import { GameModel } from "../models/game-model"
import { HERMIT_CARDS } from "../cards"
import { CardPosModel } from "../models/card-pos-model"
import { removeAilment } from "../utils/board"
import { AilmentT } from "../types/game-state"

class knockedoutAilment extends Ailment{
    constructor() {
		super({
			id: 'knockedout',
			name: 'Knocked Out',
			duration: 1,
			damageEffect: false,
		})
	}

	override onApply(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		game.state.ailments.push(ailmentInfo)
		const {player} = pos

		player.board.activeRow = null

		if (!ailmentInfo.duration) ailmentInfo.duration = this.duration

		player.hooks.onTurnStart.add(ailmentInfo.ailmentInstance, () => {
			if (!ailmentInfo.duration) return
			ailmentInfo.duration --

			if (ailmentInfo.duration === 0) removeAilment(game, pos, ailmentInfo.ailmentInstance)
		})
	}

	override onRemoval(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onTurnStart.remove(ailmentInfo.ailmentInstance)
	}
}

export default knockedoutAilment