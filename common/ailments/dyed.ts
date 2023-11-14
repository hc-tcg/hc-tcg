import Ailment from "./ailment"
import { GameModel } from "../models/game-model"
import { CardPosModel, getBasicCardPos, getCardPos } from "../models/card-pos-model"
import { removeAilment } from "../utils/board"
import { AilmentT } from "../types/game-state"

class DyedAilment extends Ailment{
    constructor() {
		super({
			id: 'dyed',
			name: 'Dyed',
			description: 'Items attached to this Hermit become any type.',
			duration: 0,
			counter: false,
			damageEffect: false,
		})
	}

	override onApply(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		game.state.ailments.push(ailmentInfo)
		const {player} = pos

		player.hooks.availableEnergy.add(ailmentInfo.ailmentInstance, (availableEnergy) => {
			if (!player.board.activeRow) return availableEnergy

			const activeRow = player.board.rows[player.board.activeRow]

			if (ailmentInfo.targetInstance !== activeRow.hermitCard?.cardInstance) return availableEnergy

			return availableEnergy.map(() => 'any')
		})


		player.hooks.onHermitDeath.add(ailmentInfo.ailmentInstance, (hermitPos) => {
			if (hermitPos.row?.hermitCard?.cardInstance != ailmentInfo.targetInstance) return
			removeAilment(game, pos, ailmentInfo.ailmentInstance)
		})
	}

	override onRemoval(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.availableEnergy.remove(ailmentInfo.ailmentInstance)
		opponentPlayer.hooks.onTurnEnd.remove(ailmentInfo.ailmentInstance)
		player.hooks.onHermitDeath.remove(ailmentInfo.ailmentInstance)
	}
}

export default DyedAilment