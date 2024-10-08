import {CardComponent, RowStateWithHermit} from '../../../types/game-state'
import CardOld from '../../base/card'
import {AttackModel} from '../../models/attack-model'
import {GameModel} from '../../models/game-model'
import {attach} from '../defaults'
import {Attach} from '../types'

class Trapdoor extends CardOld {
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

	override onAttach(
		_game: GameModel,
		component: CardComponent,
		_observer: Observer,
	) {
		const {player, opponentPlayer} = pos

		let totalReduction = 0

		player.hooks.onDefence.add(component, (attack) => {
			const target = attack.getTarget()
			if (
				target?.player.id !== player.id ||
				attack.getAttacker()?.player.id !== opponentPlayer.id
			)
				return
			if (attack.isType('status-effect') || attack.isBacklash) return
			if (pos.rowIndex === null) return
			if (Math.abs(target.rowIndex - pos.rowIndex) !== 1) return

			if (totalReduction < 40) {
				const damageReduction = Math.min(
					attack.calculateDamage(),
					40 - totalReduction,
				)
				totalReduction += damageReduction
				attack.reduceDamage(this.props.id, damageReduction)

				const newAttack: AttackModel = new AttackModel({
					id: this.getInstanceKey(component),
					attacker: attack.getAttacker(),
					target: {
						player: player,
						rowIndex: pos.rowIndex,
						row: pos.rowId as RowStateWithHermit,
					},
					type: attack.type,
					createWeakness: ['primary', 'secondary'].includes(attack.type)
						? 'ifWeak'
						: 'never',
				}).addDamage(this.props.id, damageReduction)
				attack.addNewAttack(newAttack)
			}
		})

		player.hooks.afterDefence.add(component, (_attack) => {
			totalReduction = 0
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.onDefence.remove(component)
		player.hooks.afterDefence.remove(component)
	}
}

export default Trapdoor
