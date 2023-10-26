import Ailment from "./ailment"
import { GameModel } from "../models/game-model"
import { CardPosModel, getBasicCardPos } from "../models/card-pos-model"
import { removeAilment } from "../utils/board"
import { AilmentT } from "../types/game-state"

class BadOmenAilment extends Ailment{
    constructor() {
		super({
			id: 'badomen',
			name: 'Bad Omen',
			duration: 3,
		})
	}

	override onApply(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		const {player, card, rowIndex, row} = pos

		if (!card || !rowIndex || !row?.hermitCard) return
		if (!ailmentInfo.duration) ailmentInfo.duration = this.duration

		player.hooks.onTurnStart.add(ailmentInfo.ailmentInstance, () => {
			if (!ailmentInfo.duration) return
			ailmentInfo.duration --

			if (ailmentInfo.duration === 0) removeAilment(game, pos, ailmentInfo.ailmentInstance)
		})

		player.hooks.onCoinFlip.add(ailmentInfo.ailmentInstance, (id, coinFlips) => {
			const targetPos = getBasicCardPos(game, ailmentInfo.targetInstance)
			if (player.board.activeRow !== targetPos?.rowIndex) return coinFlips

			for (let i = 0; i < coinFlips.length; i++) {
				coinFlips[i] = 'tails'
			}
			return coinFlips
		})

		player.hooks.onHermitDeath.add(ailmentInfo.ailmentInstance, (hermitPos) => {
			if (hermitPos.row?.hermitCard?.cardInstance != ailmentInfo.targetInstance) return
			removeAilment(game, pos, ailmentInfo.ailmentInstance)
		})
	}

	override onRemoval(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onCoinFlip.remove(ailmentInfo.ailmentInstance)
		player.hooks.onHermitDeath.remove(ailmentInfo.ailmentInstance)
		player.hooks.onTurnStart.remove(ailmentInfo.ailmentInstance)
	}
}

export default BadOmenAilment