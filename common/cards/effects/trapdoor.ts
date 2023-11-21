import EffectCard from '../base/effect-card'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'
import {AttackModel} from '../../models/attack-model'
import {RowStateWithHermit} from '../../types/game-state'

class TrapdoorEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'trapdoor',
			numericId: 177,
			name: 'Trapdoor',
			rarity: 'rare',
			description:
				'Attach to any active or AFK Hermit.\n\n When an adjacent Hermit takes damage, up to 40hp damage is taken by this Hermit instead.',
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {opponentPlayer, player} = pos

		opponentPlayer.hooks.beforeAttack.add(instance, (attack) => {
			if (attack.target?.player !== player) return
			if (attack.isType('ailment') || attack.isBacklash) return
			if (!pos.rowIndex) return
			if (Math.abs(attack.target?.rowIndex - pos.rowIndex) !== 1) return

			const damageToReduce = Math.min(attack.getDamage(), 40)
			if (damageToReduce === 0) return
			attack.reduceDamage(this.id, damageToReduce)

			const newAttack: AttackModel = new AttackModel({
				id: this.getInstanceKey(instance),
				attacker: attack.attacker,
				target: {
					player: player,
					rowIndex: pos.rowIndex,
					row: pos.row as RowStateWithHermit,
				},
				type: attack.type,
			}).addDamage(this.id, damageToReduce)
			attack.addNewAttack(newAttack)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {opponentPlayer} = pos

		opponentPlayer.hooks.onAttack.remove(instance)
	}

	public override getExpansion(): string {
		return 'advent_of_tcg'
	}
}

export default TrapdoorEffectCard
