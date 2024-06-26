import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {HermitAttackType} from '../../../types/attack'
import {flipCoin} from '../../../utils/coinFlips'
import HermitCard from '../../base/hermit-card'

class GoatfatherRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'goatfather_rare',
			numericId: 129,
			name: 'Goatfather',
			rarity: 'rare',
			hermitType: 'prankster',
			health: 270,
			primary: {
				name: 'Omerta',
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Anvil Drop',
				cost: ['prankster', 'prankster'],
				damage: 80,
				power:
					"Flip a coin.\nIf heads, do an additional 30hp damage to your opponent's active Hermit and 10hp damage to each Hermit below it on the game board.",
			},
		})
	}

	override getAttack(
		game: GameModel,
		instance: string,
		pos: CardPosModel,
		hermitAttackType: HermitAttackType
	) {
		const attack = super.getAttack(game, instance, pos, hermitAttackType)

		if (!attack) return attack

		const {player, opponentPlayer, row, rowIndex} = pos

		if (attack.type !== 'secondary' || !row?.hermitCard) return attack

		const coinFlip = flipCoin(player, row.hermitCard)

		if (coinFlip[0] === 'tails') return attack

		attack.addDamage(this.id, 30)

		const activeRow = opponentPlayer.board.activeRow
		const rows = opponentPlayer.board.rows

		if (activeRow === null || rowIndex === null) return attack
		for (let i = activeRow + 1; i < rows.length; i++) {
			const targetRow = rows[i]
			if (!targetRow.hermitCard) continue

			const newAttack = new AttackModel({
				id: this.getInstanceKey(instance),
				attacker: {
					player,
					rowIndex: rowIndex,
					row: row,
				},
				target: {
					player: opponentPlayer,
					rowIndex: i,
					row: targetRow,
				},
				type: hermitAttackType,
				log: (values) => `, ${values.target} for ${values.damage} damage`,
			}).addDamage(this.id, 10)
			attack.addNewAttack(newAttack)
		}

		return attack
	}

	override getExpansion() {
		return 'alter_egos'
	}

	override getPalette() {
		return 'alter_egos'
	}

	override getBackground() {
		return 'alter_egos_background'
	}
}

export default GoatfatherRareHermitCard
