import Ailment from "./ailment"
import { GameModel } from "../models/game-model"
import { CardPosModel, getBasicCardPos, getCardPos } from "../models/card-pos-model"
import { removeAilment } from "../utils/board"
import { AilmentT } from "../types/game-state"
import { isTargetingPos } from "../utils/attacks"

class ProtectedAilment extends Ailment{
    constructor() {
		super({
			id: 'protected',
			name: 'Sheriff\'s Protection',
			duration: 0,
		})
	}

	override onApply(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const instanceKey = this.getInstanceKey(ailmentInfo.ailmentInstance)

		player.hooks.onActiveHermitChange.add(ailmentInfo.ailmentInstance, (oldRow, newRow) => {
			const targetPos = getBasicCardPos(game, ailmentInfo.targetInstance)
			if (!targetPos) return

			if (newRow !== targetPos.rowIndex) return
			player.custom[instanceKey] = true
		})

		player.hooks.onDefence.add(ailmentInfo.ailmentInstance, (attack) => {
			const targetPos = getCardPos(game, ailmentInfo.targetInstance)
			if (!targetPos) return
			
			// Only block if just became active
			if (!player.custom[instanceKey]) return
			// Only block damage when we are active
			const isActive = player.board.activeRow === pos.rowIndex
			if (!isActive || !isTargetingPos(attack, targetPos)) return
			// Do not block backlash attacks
			if (attack.isBacklash) return

			if (attack.getDamage() > 0) {
				// Block all damage
				attack.multiplyDamage(this.id, 0).lockDamage()
			}
		})

		opponentPlayer.hooks.onTurnEnd.add(ailmentInfo.ailmentInstance, () => {
			if (!player.custom[instanceKey]) return
			removeAilment(game, pos, ailmentInfo.ailmentInstance)
		})


		player.hooks.onHermitDeath.add(ailmentInfo.ailmentInstance, (hermitPos) => {
			if (hermitPos.row?.hermitCard?.cardInstance != ailmentInfo.targetInstance) return
			removeAilment(game, pos, ailmentInfo.ailmentInstance)
		})
	}

	override onRemoval(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		const {player} = pos
		const instanceKey = this.getInstanceKey(ailmentInfo.ailmentInstance)

		pos.player.hooks.onDefence.remove(ailmentInfo.ailmentInstance)
		pos.player.hooks.onActiveHermitChange.remove(ailmentInfo.ailmentInstance)
		pos.opponentPlayer.hooks.onTurnEnd.remove(ailmentInfo.ailmentInstance)
		delete player.custom[instanceKey]
		player.hooks.onHermitDeath.remove(ailmentInfo.ailmentInstance)
	}
}

export default ProtectedAilment