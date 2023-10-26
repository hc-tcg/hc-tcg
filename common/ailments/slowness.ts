import Ailment from "./ailment"
import { GameModel } from "../models/game-model"
import { HERMIT_CARDS } from "../cards"
import { CardPosModel, getBasicCardPos } from "../models/card-pos-model"
import { removeAilment } from "../utils/board"
import { AilmentT } from "../types/game-state"

class SlownessAilment extends Ailment{
    constructor() {
		super({
			id: 'slowness',
            name: 'Slowness',
			duration: 1,
		})
	}

	override onApply(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		const {player} = pos

		if (!ailmentInfo.duration) ailmentInfo.duration = this.duration

		player.hooks.onTurnStart.add(ailmentInfo.ailmentInstance, () => {
			if (!ailmentInfo.duration) return
			ailmentInfo.duration --

			if (ailmentInfo.duration === 0) removeAilment(game, pos, ailmentInfo.ailmentInstance)
		})

		player.hooks.blockedActions.add(ailmentInfo.ailmentInstance, (blockedActions) => {
			const targetPos = getBasicCardPos(game, ailmentInfo.targetInstance)
			if (!targetPos || !targetPos.rowIndex) return blockedActions

			if (player.board.activeRow === targetPos.rowIndex) {
				blockedActions.push('SECONDARY_ATTACK')
			}

			return blockedActions
		})

		player.hooks.onHermitDeath.add(ailmentInfo.ailmentInstance, (hermitPos) => {
			if (hermitPos.row?.hermitCard?.cardInstance != ailmentInfo.targetInstance) return
			removeAilment(game, pos, ailmentInfo.ailmentInstance)
		})
	}

	override onRemoval(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		const {player} = pos
		player.hooks.blockedActions.remove(ailmentInfo.ailmentInstance)
		player.hooks.onTurnStart.remove(ailmentInfo.ailmentInstance)
		player.hooks.onHermitDeath.remove(ailmentInfo.ailmentInstance)
	}
}

export default SlownessAilment