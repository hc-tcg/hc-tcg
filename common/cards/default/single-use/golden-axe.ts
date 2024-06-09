import {CARDS} from '../..'
import {AttackModel} from '../../../models/attack-model'
import {CardPosModel, getBasicCardPos, getCardPos} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {isTargetingPos} from '../../../utils/attacks'
import {applySingleUse, getActiveRowPos} from '../../../utils/board'
import SingleUseCard from '../../base/single-use-card'

class GoldenAxeSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'golden_axe',
			numericId: 31,
			name: 'Golden Axe',
			rarity: 'rare',
			description:
				"Do 40hp damage to your opponent's active Hermit.\nAny effect card attached to your opponent's active Hermit is ignored during this turn.",
			log: null,
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.getAttack.add(instance, () => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return null
			const opponentActivePos = getActiveRowPos(opponentPlayer)
			if (!opponentActivePos) return null

			const axeAttack = new AttackModel({
				id: this.getInstanceKey(instance),
				attacker: activePos,
				target: opponentActivePos,
				type: 'effect',
				log: (values) =>
					`${values.defaultLog} to attack ${values.target} for ${values.damage} damage`,
			}).addDamage(this.id, 40)

			return axeAttack
		})

		player.hooks.beforeAttack.addBefore(instance, (attack) => {
			const attackId = this.getInstanceKey(instance)
			const opponentActivePos = getActiveRowPos(opponentPlayer)
			if (!opponentActivePos) return null

			if (attack.id === attackId) {
				applySingleUse(game)
			}

			attack.shouldIgnoreCards.push((instance) => {
				const ignorePos = getBasicCardPos(game, instance)
				if (!ignorePos || !ignorePos.row || !ignorePos.row.effectCard) return false
				if (ignorePos.slot.type !== 'effect') return false
				if (ignorePos.rowIndex !== opponentActivePos.rowIndex) return false
				if (ignorePos.player === player) return false
				return true
			})
		})

		player.hooks.onTurnEnd.add(instance, () => {
			player.hooks.getAttack.remove(instance)
			player.hooks.beforeAttack.remove(instance)
			player.hooks.afterAttack.remove(instance)
		})
	}

	override canAttack() {
		return true
	}
}

export default GoldenAxeSingleUseCard
