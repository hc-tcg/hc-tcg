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
					"Flip a coin.\n\nIf heads, do an additional 30hp damage to your opponent's active Hermit and 10hp damage to each Hermit below it on the game board.",
			},
		})
	}

	override getAttacks(
		game: GameModel,
		instance: string,
		pos: CardPosModel,
		hermitAttackType: HermitAttackType
	) {
		const attacks = super.getAttacks(game, instance, pos, hermitAttackType)

		const {player, opponentPlayer, row, rowIndex} = pos

		if (attacks[0].type !== 'secondary' || !row?.hermitCard) return attacks

		const coinFlip = flipCoin(player, row.hermitCard)

		if (coinFlip[0] === 'tails') return attacks

		attacks[0].addDamage(this.id, 30)

		const activeRow = opponentPlayer.board.activeRow
		const rows = opponentPlayer.board.rows
		if (activeRow === null || rowIndex === null) return attacks
		for (let i = activeRow + 1; i < rows.length; i++) {
			const targetRow = rows[i]
			if (!targetRow.hermitCard) continue

			const attack = new AttackModel({
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
				log: (values) => `, ${values.target} for $b${values.damage}hp$ damage`,
			}).addDamage(this.id, 10)
			attacks[0].addNewAttack(attack)
		}

		return attacks
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
