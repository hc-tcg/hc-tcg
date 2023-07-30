import {AttackModel} from '../../models/attack-model'
import {CardPosModel, getCardPos} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {applySingleUse, getActiveRowPos} from '../../utils/board'
import SingleUseCard from '../base/single-use-card'

class GoldenAxeSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'golden_axe',
			name: 'Golden Axe',
			rarity: 'rare',
			description:
				"Do an additional 40hp damage.\\The opponent's attached effect card is ignored during this attack.",
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

			// Ignore attached effect cards
			axeAttack.shouldIgnoreCards.push((instance) => {
				const pos = getCardPos(game, instance)
				if (!pos || !axeAttack.target) return false

				const onTargetRow = pos.rowIndex === axeAttack.target.rowIndex
				if (onTargetRow && pos.slot.type === 'effect') {
					// It's the targets effect card, ignore it
					return true
				}

				return false
			})

			return [axeAttack]
		})

		player.hooks.onAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance)

			if (attack.id === attackId) {
				applySingleUse(game)
			}
		})

		player.hooks.afterAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id === attackId) {
				// Clean up
				player.hooks.getAttacks.remove(instance)
				player.hooks.onAttack.remove(instance)
				player.hooks.afterAttack.remove(instance)
			}
		})
	}
}

export default GoldenAxeSingleUseCard
