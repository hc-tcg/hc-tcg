import EffectCard from '../../base/effect-card'
import {GameModel} from '../../../models/game-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {AttackModel} from '../../../models/attack-model'
import {RowStateWithHermit} from '../../../types/game-state'

class TrapdoorEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'trapdoor',
			numericId: 205,
			name: 'Trapdoor',
			rarity: 'rare',
			description:
				"When an adjacent Hermit takes damage from an opponent's attack, up to 40hp damage is taken by this Hermit instead.",
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const instanceKey = this.getInstanceKey(instance)

		player.hooks.onDefence.add(instance, (attack) => {
			const target = attack.getTarget()
			if (target?.player.id !== player.id || attack.getAttacker()?.player.id !== opponentPlayer.id)
				return
			if (attack.isType('status-effect') || attack.isBacklash) return
			if (pos.rowIndex === null) return
			if (Math.abs(target.rowIndex - pos.rowIndex) !== 1) return

			if (player.custom[instanceKey] === undefined) {
				player.custom[instanceKey] = 0
			}

			const totalReduction = player.custom[instanceKey]

			if (totalReduction < 40) {
				const damageReduction = Math.min(attack.calculateDamage(), 40 - totalReduction)
				player.custom[instanceKey] += damageReduction
				attack.reduceDamage(this.id, damageReduction)

				const newAttack: AttackModel = new AttackModel({
					id: instanceKey,
					attacker: attack.getAttacker(),
					target: {
						player: player,
						rowIndex: pos.rowIndex,
						row: pos.row as RowStateWithHermit,
					},
					type: attack.type,
					createWeakness: ['primary', 'secondary'].includes(attack.type) ? 'ifWeak' : 'never',
				}).addDamage(this.id, damageReduction)
				attack.addNewAttack(newAttack)
			}
		})

		player.hooks.afterDefence.add(instance, (attack) => {
			const {player} = pos

			// Delete the stored damage
			delete player.custom[instanceKey]
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onDefence.remove(instance)
		player.hooks.afterDefence.remove(instance)
	}

	public override getExpansion(): string {
		return 'advent_of_tcg'
	}
}

export default TrapdoorEffectCard
