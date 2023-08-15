import {AttackModel} from '../../models/attack-model'
import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {applySingleUse, getActiveRowPos} from '../../utils/board'
import SingleUseCard from '../base/single-use-card'

class CrossbowSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'crossbow',
			name: 'Crossbow',
			rarity: 'rare',
			description:
				'Do an additional 20hp damage to up to 3 Hermits of your choice.\n\nCan not apply the damage to the same Hermit more than once.',
			pickOn: 'attack',
			pickReqs: [{target: 'opponent', slot: ['hermit'], amount: 3}],
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.getAttacks.add(instance, (pickedSlots) => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return []

			const attacks = []
			const slots = pickedSlots[this.id]
			for (const slot of slots) {
				if (!slot.row || !slot.row.state.hermitCard) continue
				const targetPlayer = game.state.players[slot.playerId]
				attacks.push(
					new AttackModel({
						id: this.getInstanceKey(instance),
						attacker: activePos,
						target: {
							player: targetPlayer,
							rowIndex: slot.row.index,
							row: slot.row.state,
						},
						type: 'effect',
					}).addDamage(this.id, 20)
				)
			}
			return attacks
		})

		player.hooks.onAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId) return

			applySingleUse(game)

			// Do not apply single use more than once
			player.hooks.onAttack.remove(instance)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.getAttacks.remove(instance)
		player.hooks.onAttack.remove(instance)
	}

	override canAttack() {
		return true
	}
}

export default CrossbowSingleUseCard
