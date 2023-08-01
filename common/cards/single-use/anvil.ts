import {AttackModel} from '../../models/attack-model'
import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {applySingleUse, getActiveRowPos} from '../../utils/board'
import SingleUseCard from '../base/single-use-card'

class AnvilSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'anvil',
			name: 'Anvil',
			rarity: 'rare',
			description:
				"Do 30hp damage to your opponent's Hermit directly opposite your active Hermit on the board and 10hp damage to each of their Hermits below it.",
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.getAttacks.add(instance, (pickedSlots) => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return []
			const activeIndex = activePos.rowIndex

			const opponentRows = opponentPlayer.board.rows

			const attacks = []
			for (let i = activeIndex; i < opponentRows.length; i++) {
				const opponentRow = opponentRows[i]
				if (!opponentRow || !opponentRow.hermitCard) continue
				const attack = new AttackModel({
					id: this.getInstanceKey(instance, activeIndex === i ? 'active' : 'inactive'),
					attacker: activePos,
					target: {
						player: opponentPlayer,
						rowIndex: i,
						row: opponentRow,
					},
					type: 'effect',
				}).addDamage(this.id, i === activeIndex ? 30 : 10)

				attacks.push(attack)
			}

			return attacks
		})

		player.hooks.onAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance, 'active')
			if (attack.id !== attackId) return

			applySingleUse(game)
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.getAttacks.remove(instance)
		player.hooks.onAttack.remove(instance)
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	override canAttach(game: GameModel, pos: CardPosModel) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'

		const {player} = pos
		const activeRow = player.board.activeRow
		if (activeRow === null) return 'NO'

		return 'YES'
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default AnvilSingleUseCard
