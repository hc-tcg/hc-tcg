import {AttackModel} from '../../models/attack-model'
import {GameModel} from '../../models/game-model'
import Card from './card'
import {CardRarityT, HermitAttackInfo, HermitTypeT} from '../../types/cards'
import {PickRequirmentT, PickedSlots} from '../../types/pick-process'
import {HermitAttackType} from '../../types/attack'
import {createWeaknessAttack} from '../../utils/attacks'
import {CardPosModel} from '../../models/card-pos-model'

type HermitDefs = {
	id: string
	name: string
	rarity: CardRarityT
	hermitType: HermitTypeT
	health: number
	primary: HermitAttackInfo
	secondary: HermitAttackInfo
	pickOn?: 'attack' | 'apply' | 'followup'
	pickReqs?: Array<PickRequirmentT>
}

abstract class HermitCard extends Card {
	public hermitType: HermitTypeT
	public health: number
	public primary: HermitAttackInfo
	public secondary: HermitAttackInfo

	constructor(defs: HermitDefs) {
		super({
			type: 'hermit',
			id: defs.id,
			name: defs.name,
			rarity: defs.rarity,
			pickOn: defs.pickOn,
			pickReqs: defs.pickReqs,
		})

		this.hermitType = defs.hermitType
		this.health = defs.health
		this.primary = defs.primary
		this.secondary = defs.secondary
	}

	public override canAttach(game: GameModel, pos: CardPosModel): 'YES' | 'NO' | 'INVALID' {
		const {currentPlayer} = game

		if (pos.slot.type !== 'hermit') return 'INVALID'
		if (pos.player.id !== currentPlayer.id) return 'INVALID'

		return 'YES'
	}

	// Default is to return
	public getAttacks(
		game: GameModel,
		instance: string,
		pos: CardPosModel,
		hermitAttackType: HermitAttackType,
		pickedSlots: PickedSlots
	): Array<AttackModel> {
		if (pos.rowIndex === null || !pos.row || !pos.row.hermitCard) return []

		const {opponentPlayer: opponentPlayer} = game
		const targetIndex = opponentPlayer.board.activeRow
		if (targetIndex === null) return []

		const targetRow = opponentPlayer.board.rows[targetIndex]
		if (!targetRow.hermitCard) return []

		// Create an attack with default damage
		const attack = new AttackModel({
			id: this.getInstanceKey(instance),
			attacker: {
				player: pos.player,
				rowIndex: pos.rowIndex,
				row: pos.row,
			},
			target: {
				player: opponentPlayer,
				rowIndex: targetIndex,
				row: targetRow,
			},
			type: hermitAttackType,
		})

		if (attack.type === 'primary') {
			attack.addDamage(this.id, this.primary.damage)
		} else if (attack.type === 'secondary') {
			attack.addDamage(this.id, this.secondary.damage)
		}

		const attacks = [attack]

		if (attack.isType('primary', 'secondary')) {
			const weaknessAttack = createWeaknessAttack(attack)
			if (weaknessAttack) attacks.push(weaknessAttack)
		}

		return attacks
	}

	/**
	 * Returns the background to use for this hermit card
	 */
	public getBackground(): string {
		return this.id.split('_')[0]
	}
}

export default HermitCard
