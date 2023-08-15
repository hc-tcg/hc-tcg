import {AttackModel} from '../../models/attack-model'
import {CardPosModel, getCardPos} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {isTargetingPos} from '../../utils/attacks'
import {applySingleUse, getActiveRowPos} from '../../utils/board'
import SingleUseCard from '../base/single-use-card'

class GoldenAxeSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'golden_axe',
			name: 'Golden Axe',
			rarity: 'rare',
			description:
				"Do an additional 40hp damage.\nThe opponent Hermit's attached effect card is ignored during this attack.",
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
				applySingleUse(game)
			}

			// All attacks from our side should ignore opponent attached effect card this turn
			attack.shouldIgnoreCards.push((instance) => {
				const pos = getCardPos(game, instance)
				if (!pos || !attack.target) return false

				const isTargeting = isTargetingPos(attack, opponentActivePos)
				if (isTargeting && pos.slot.type === 'effect') {
					// It's the targets effect card, ignore it
					return true
				}

				return false
			})
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

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		// Clean up on detach
		player.hooks.getAttacks.remove(instance)
		player.hooks.beforeAttack.remove(instance)
		player.hooks.afterAttack.remove(instance)
	}
}

export default GoldenAxeSingleUseCard
