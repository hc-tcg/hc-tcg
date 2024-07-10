import {GameModel} from '../../../models/game-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {AttackModel} from '../../../models/attack-model'
import {CardInstance, RowStateWithHermit} from '../../../types/game-state'
import Card, {Attach, attach} from '../../base/card'

class TrapdoorEffectCard extends Card {
	props: Attach = {
		...attach,
		id: 'trapdoor',
		numericId: 205,
		name: 'Trapdoor',
		expansion: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 2,
		description:
			"When an adjacent Hermit takes damage from an opponent's attack, up to 40hp damage is taken by this Hermit instead.",
	}

	override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		let totalReduction = 0

		player.hooks.onDefence.add(instance, (attack) => {
			const target = attack.getTarget()
			if (target?.player.id !== player.id || attack.getAttacker()?.player.id !== opponentPlayer.id)
				return
			if (attack.isType('status-effect') || attack.isBacklash) return
			if (pos.rowIndex === null) return
			if (Math.abs(target.rowIndex - pos.rowIndex) !== 1) return

			if (totalReduction < 40) {
				const damageReduction = Math.min(attack.calculateDamage(), 40 - totalReduction)
				totalReduction += damageReduction
				attack.reduceDamage(this.props.id, damageReduction)

				const newAttack: AttackModel = new AttackModel({
					id: this.getInstanceKey(instance),
					attacker: attack.getAttacker(),
					target: {
						player: player,
						rowIndex: pos.rowIndex,
						row: pos.rowId as RowStateWithHermit,
					},
					type: attack.type,
					createWeakness: ['primary', 'secondary'].includes(attack.type) ? 'ifWeak' : 'never',
				}).addDamage(this.props.id, damageReduction)
				attack.addNewAttack(newAttack)
			}
		})

		player.hooks.afterDefence.add(instance, (attack) => {
			const {player} = pos
			totalReduction = 0
		})
	}

	override onDetach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onDefence.remove(instance)
		player.hooks.afterDefence.remove(instance)
	}
}

export default TrapdoorEffectCard
