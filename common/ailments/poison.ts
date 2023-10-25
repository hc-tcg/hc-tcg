import Ailment from "./ailment"
import { GameModel } from "../models/game-model"
import { RowPos } from "../types/cards"
import { CardPosModel } from "../models/card-pos-model"
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
		const {player, card, rowIndex, row} = pos

		if (!card || !rowIndex || !row?.hermitCard) return

		const damgeEffects = game.state.ailments.filter((a) => 
			a.targetInstance == card.cardInstance && (a.ailmentId == 'poison' || a.ailmentId == 'fire')
		)

		if (damgeEffects.length > 0) {
			removeAilment(game, pos, ailmentInfo.ailmentInstance)
			return
		}

		player.hooks.onTurnStart.add(ailmentInfo.ailmentInstance, (turnStartAttacks) => {
			const targetRow: RowPos = {
				player: player,
				rowIndex: rowIndex,
				row: row
			}
			
			const ailmentAttack = new AttackModel({
				id: this.getInstanceKey(ailmentInfo.ailmentInstance, 'ailmentAttack'),
				attacker: null,
				target: targetRow,
				type: 'ailment',
			})
			if (row.health >= 30) {
				ailmentAttack.addDamage(this.id, 20)
			} else if (row.health == 20) {
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