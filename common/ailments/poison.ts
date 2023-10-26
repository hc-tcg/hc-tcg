import Ailment from "./ailment"
import { GameModel } from "../models/game-model"
import { RowPos } from "../types/cards"
import { CardPosModel, getBasicCardPos } from "../models/card-pos-model"
import { AttackModel } from "../models/attack-model"
import { removeAilment } from "../utils/board"
import { AilmentT } from "../types/game-state"

class PoisonAilment extends Ailment{
    constructor() {
		super({
			id: 'poison',
            name: 'Poison',
			duration: 0,
		})
	}

	override onApply(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		const {player} = pos

		const damgeEffects = game.state.ailments.filter((a) => 
			a.targetInstance == pos.card?.cardInstance && (a.ailmentId == 'poison' || a.ailmentId == 'fire')
		)

		if (damgeEffects.length > 0) {
			removeAilment(game, pos, ailmentInfo.ailmentInstance)
			return
		}

		player.hooks.onTurnStart.add(ailmentInfo.ailmentInstance, (turnStartAttacks) => {
			const targetPos = getBasicCardPos(game, ailmentInfo.targetInstance)
			if (!targetPos || !targetPos.row || !targetPos.rowIndex || !targetPos.row.hermitCard) return

			const targetRow: RowPos = {
				player: targetPos.player,
				rowIndex: targetPos.rowIndex,
				row: targetPos.row
			}
			
			const ailmentAttack = new AttackModel({
				id: this.getInstanceKey(ailmentInfo.ailmentInstance, 'ailmentAttack'),
				attacker: null,
				target: targetRow,
				type: 'ailment',
			})

			if (targetPos.row.health >= 30) {
				ailmentAttack.addDamage(this.id, 20)
			} else if (targetPos.row.health == 20) {
				ailmentAttack.addDamage(this.id, 10)
			}

			turnStartAttacks.push(ailmentAttack)
		})

		player.hooks.onHermitDeath.add(ailmentInfo.ailmentInstance, (hermitPos) => {
			if (hermitPos.rowIndex === null || !hermitPos.row) return
			if (hermitPos.row != pos.row) return
			removeAilment(game, pos, ailmentInfo.ailmentInstance)
		})
	}

	override onRemoval(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onTurnStart.remove(ailmentInfo.ailmentInstance)
		player.hooks.onHermitDeath.remove(ailmentInfo.ailmentInstance)
	}
}

export default PoisonAilment