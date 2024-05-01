import {CARDS} from '../..'
import {AttackModel} from '../../../models/attack-model'
import {CardPosModel, getCardPos} from '../../../models/card-pos-model'
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
				"Do 40hp damage to your opponent's active Hermit.\n\nAny effect cards attached to your opponent's active Hermit are ignored during this turn.",
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.getAttacks.add(instance, () => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return []
			const opponentActivePos = getActiveRowPos(opponentPlayer)
			if (!opponentActivePos) return []

			const axeAttack = new AttackModel({
				id: this.getInstanceKey(instance),
				attacker: activePos,
				target: opponentActivePos,
				type: 'effect',
			}).addDamage(this.id, 40)

			return [axeAttack]
		})

		player.hooks.beforeAttack.addBefore(instance, (attack) => {
			const attackId = this.getInstanceKey(instance)
			const opponentActivePos = getActiveRowPos(opponentPlayer)
			if (!opponentActivePos) return

			if (attack.id === attackId) {
				const opponentActiveHermitId = getActiveRowPos(opponentPlayer)?.row.hermitCard.cardId
				applySingleUse(game, [
					[`to attack `, 'plain'],
					[`${opponentActiveHermitId ? CARDS[opponentActiveHermitId].name : ''} `, 'opponent'],
				])
			}

			attack.shouldIgnoreCards.push((instance) => {
				const pos = getCardPos(game, instance)
				if (!pos || !attack.getTarget()) return false

				const isTargeting = isTargetingPos(attack, opponentActivePos)
				if (isTargeting && pos.slot.type === 'effect') {
					// It's the targets effect card, ignore it
					return true
				}

				return false
			})
		})

		player.hooks.onTurnEnd.add(instance, () => {
			player.hooks.getAttacks.remove(instance)
			player.hooks.beforeAttack.remove(instance)
			player.hooks.afterAttack.remove(instance)
		})
	}

	override canAttack() {
		return true
	}
}

export default GoldenAxeSingleUseCard
