import {AttackModel} from '../../models/attack-model'
import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {applySingleUse, getActiveRowPos} from '../../utils/board'
import SingleUseCard from '../base/single-use-card'

class DiamondSwordSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'diamond_sword',
			name: 'Diamond Sword',
			rarity: 'rare',
			description: 'Do an additional 40hp damage.',
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.getAttacks.add(instance, () => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return []

			const opponentIndex = opponentPlayer.board.activeRow
			if (opponentIndex === null || opponentIndex === undefined) return []
			const opponentRow = opponentPlayer.board.rows[opponentIndex]
			if (!opponentRow || !opponentRow.hermitCard) return []

			const swordAttack = new AttackModel({
				id: this.getInstanceKey(instance, 'attack'),
				attacker: activePos,
				target: {
					player: opponentPlayer,
					rowIndex: opponentIndex,
					row: opponentRow,
				},
				type: 'effect',
			}).addDamage(this.id, 40)

			return [swordAttack]
		})

		player.hooks.onAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance, 'attack')
			if (attack.id !== attackId) return

			// We've executed our attack, apply effect
			applySingleUse(game)
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

export default DiamondSwordSingleUseCard
