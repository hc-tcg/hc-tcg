import Ailment from "./ailment"
import { GameModel } from "../models/game-model"
import { HERMIT_CARDS } from "../cards"
import { CardPosModel, getBasicCardPos } from "../models/card-pos-model"
import { removeAilment } from "../utils/board"
import { AilmentT } from "../types/game-state"

class SleepingAilment extends Ailment{
    constructor() {
		super({
			id: 'sleeping',
			name: 'Sleeping',
			duration: 3,
			damageEffect: false,
		})
	}

	override onApply(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		const {player, card, row} = pos

		if (!card || !row?.hermitCard) return

		game.state.ailments.push(ailmentInfo)
		game.addBlockedActions('PRIMARY_ATTACK', 'SECONDARY_ATTACK', 'CHANGE_ACTIVE_HERMIT')
		if (!ailmentInfo.duration) ailmentInfo.duration = this.duration

		row.health = HERMIT_CARDS[card.cardId].health

		player.hooks.onTurnStart.add(ailmentInfo.ailmentInstance, () => {
			const targetPos = getBasicCardPos(game, ailmentInfo.targetInstance)
			if (!targetPos || !ailmentInfo.duration) return
			ailmentInfo.duration --

			if (ailmentInfo.duration === 0 || player.board.activeRow !== targetPos.rowIndex) {
				removeAilment(game, pos, ailmentInfo.ailmentInstance)
				return
			}

			if (player.board.activeRow === targetPos.rowIndex) game.addBlockedActions('PRIMARY_ATTACK', 'SECONDARY_ATTACK', 'CHANGE_ACTIVE_HERMIT')
		})

		player.hooks.onHermitDeath.add(ailmentInfo.ailmentInstance, (hermitPos) => {
			if (hermitPos.row?.hermitCard?.cardInstance != ailmentInfo.targetInstance) return
			removeAilment(game, pos, ailmentInfo.ailmentInstance)
		})
	}

	override onRemoval(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onTurnStart.remove(ailmentInfo.ailmentInstance)
		player.hooks.onHermitDeath.remove(ailmentInfo.ailmentInstance)
	}
}

export default SleepingAilment