import Ailment from './ailment'
import {GameModel} from '../models/game-model'
import {CardPosModel, getBasicCardPos, getCardPos} from '../models/card-pos-model'
import {removeAilment} from '../utils/board'
import {AilmentT} from '../types/game-state'
import {isTargetingPos} from '../utils/attacks'

class ProtectedAilment extends Ailment {
	constructor() {
		super({
			id: 'protected',
			name: "Sheriff's Protection",
			description: 'This Hermit does not take damage on their first active turn.',
			duration: 0,
			counter: false,
			damageEffect: false,
		})
	}

	override onApply(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		game.state.ailments.push(ailmentInfo)
		const {player, opponentPlayer} = pos
		const instanceKey = this.getInstanceKey(ailmentInfo.ailmentInstance)

		player.hooks.onTurnEnd.add(ailmentInfo.ailmentInstance, () => {
			if (player.board.activeRow === pos.rowIndex) {
				player.custom[instanceKey] = true
			}
		})

		player.hooks.onTurnStart.add(ailmentInfo.ailmentInstance, () => {
			if (player.custom[instanceKey]) {
				removeAilment(game, pos, ailmentInfo.ailmentInstance)
			}
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

		player.hooks.onHermitDeath.add(ailmentInfo.ailmentInstance, (hermitPos) => {
			if (hermitPos.row?.hermitCard?.cardInstance != ailmentInfo.targetInstance) return
			removeAilment(game, pos, ailmentInfo.ailmentInstance)
		})
	}

	override onRemoval(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		const {player} = pos
		const instanceKey = this.getInstanceKey(ailmentInfo.ailmentInstance)

		player.hooks.onDefence.remove(ailmentInfo.ailmentInstance)
		player.hooks.onTurnEnd.remove(ailmentInfo.ailmentInstance)
		player.hooks.onTurnStart.remove(ailmentInfo.ailmentInstance)
		delete player.custom[instanceKey]
		player.hooks.onHermitDeath.remove(ailmentInfo.ailmentInstance)
	}
}

export default ProtectedAilment
