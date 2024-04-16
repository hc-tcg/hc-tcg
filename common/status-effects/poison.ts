import StatusEffect from './status-effect'
import {GameModel} from '../models/game-model'
import {RowPos} from '../types/cards'
import {CardPosModel, getBasicCardPos} from '../models/card-pos-model'
import {AttackModel} from '../models/attack-model'
import {getActiveRowPos, removeStatusEffect} from '../utils/board'
import {StatusEffectT} from '../types/game-state'
import {executeExtraAttacks} from '../utils/attacks'

class PoisonStatusEffect extends StatusEffect {
	constructor() {
		super({
			id: 'poison',
			name: 'Poison',
			description:
				'This Hermit takes an additional 20hp damage every turn until down to 10hp. Ignores armour. Continues to poison if health is recovered. Poison does not knock out Hermits.',
			duration: 0,
			counter: false,
			damageEffect: true,
			visible: true,
		})
	}

	override onApply(game: GameModel, statusEffectInfo: StatusEffectT, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		const hasDamageEffect = game.state.statusEffects.some(
			(a) => a.targetInstance === pos.card?.cardInstance && a.damageEffect === true
		)

		if (hasDamageEffect) return

		game.state.statusEffects.push(statusEffectInfo)

		opponentPlayer.hooks.onTurnEnd.add(statusEffectInfo.statusEffectInstance, () => {
			const targetPos = getBasicCardPos(game, statusEffectInfo.targetInstance)
			if (!targetPos || !targetPos.row || targetPos.rowIndex === null) return
			if (!targetPos.row.hermitCard) return

			const activeRowPos = getActiveRowPos(opponentPlayer)
			const sourceRow: RowPos | null = activeRowPos
				? {
						player: activeRowPos.player,
						rowIndex: activeRowPos.rowIndex,
						row: activeRowPos.row,
				  }
				: null

			const targetRow: RowPos = {
				player: targetPos.player,
				rowIndex: targetPos.rowIndex,
				row: targetPos.row,
			}

			const statusEffectAttack = new AttackModel({
				id: this.getInstanceKey(statusEffectInfo.statusEffectInstance, 'statusEffectAttack'),
				attacker: sourceRow,
				target: targetRow,
				type: 'status-effect',
			})

			if (targetPos.row.health >= 30) {
				statusEffectAttack.addDamage(this.id, 20)
			} else if (targetPos.row.health == 20) {
				statusEffectAttack.addDamage(this.id, 10)
			}

			executeExtraAttacks(game, [statusEffectAttack], 'Poison', true)
		})

		player.hooks.onHermitDeath.add(statusEffectInfo.statusEffectInstance, (hermitPos) => {
			if (hermitPos.rowIndex === null || !hermitPos.row) return
			if (hermitPos.row != pos.row) return
			removeStatusEffect(game, pos, statusEffectInfo.statusEffectInstance)
		})
	}

	override onRemoval(game: GameModel, statusEffectInfo: StatusEffectT, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		opponentPlayer.hooks.onTurnEnd.remove(statusEffectInfo.statusEffectInstance)
		player.hooks.onHermitDeath.remove(statusEffectInfo.statusEffectInstance)
	}
}

export default PoisonStatusEffect
