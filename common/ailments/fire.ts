import Ailment from './ailment'
import {GameModel} from '../models/game-model'
import {RowPos} from '../types/cards'
import {CardPosModel, getBasicCardPos} from '../models/card-pos-model'
import {AttackModel} from '../models/attack-model'
import {removeAilment} from '../utils/board'
import {AilmentT} from '../types/game-state'

class FireAilment extends Ailment {
	constructor() {
		super({
			id: 'fire',
			name: 'On Fire',
			description: 'This Hermit takes an additional 20hp damage every turn.',
			duration: 0,
			counter: false,
			damageEffect: true,
		})
	}

	override onApply(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		const {player} = pos

		const hasDamageEffect = game.state.ailments.some(
			(a) => a.targetInstance === pos.card?.cardInstance && a.damageEffect === true
		)

		if (hasDamageEffect) return

		game.state.ailments.push(ailmentInfo)

		player.hooks.onTurnStart.add(ailmentInfo.ailmentInstance, (turnStartAttacks) => {
			const targetPos = getBasicCardPos(game, ailmentInfo.targetInstance)
			if (!targetPos || !targetPos.row || targetPos.rowIndex === null) return
			if (!targetPos.row.hermitCard) return

			const targetRow: RowPos = {
				player: targetPos.player,
				rowIndex: targetPos.rowIndex,
				row: targetPos.row,
			}

			const ailmentAttack = new AttackModel({
				id: this.getInstanceKey(ailmentInfo.ailmentInstance, 'ailmentAttack'),
				attacker: null,
				target: targetRow,
				type: 'ailment',
			})
			ailmentAttack.addDamage(this.id, 20)

			turnStartAttacks.push(ailmentAttack)
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

export default FireAilment
