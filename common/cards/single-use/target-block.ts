import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {createWeaknessAttack} from '../../utils/attacks'
import {getNonEmptyRows} from '../../utils/board'
import SingleUseCard from '../base/single-use-card'

class TargetBlockSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'target_block',
			numericId: 149,
			name: 'Target Block',
			rarity: 'rare',
			description:
				"Choose one of your opponent's AFK Hermits to take all damage done during this turn.",
			pickOn: 'apply',
			pickReqs: [{target: 'opponent', slot: ['hermit'], amount: 1, active: false}],
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const ignoreThisWeakness = this.getInstanceKey(instance, 'ignoreThisWeakness')

		player.hooks.onApply.add(instance, (pickedSlots) => {
			const pickedSlot = pickedSlots[this.id]?.[0]
			if (!pickedSlot) return

			player.hooks.beforeAttack.add(instance, (attack) => {
				if (attack.isType('ailment')) return
				if (!pickedSlot.row || !pickedSlot.row.state.hermitCard) {
					return
				}

				attack.target = {
					player: opponentPlayer,
					rowIndex: pickedSlot.row.index,
					row: pickedSlot.row.state,
				}

				if (attack.isType('primary', 'secondary')) {
					const weaknessAttack = createWeaknessAttack(attack)
					if (weaknessAttack) {
						attack.addNewAttack(weaknessAttack)
						player.custom[ignoreThisWeakness] = true
					}
				} else if (attack.type === 'weakness') {
					if (!player.custom[ignoreThisWeakness]) {
						attack.target = null
					}
					delete player.custom[ignoreThisWeakness]
				}
			})
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach
		const {opponentPlayer} = pos

		// Inactive Hermits
		if (getNonEmptyRows(opponentPlayer, false).length === 0) return 'NO'

		return 'YES'
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		const ignoreThisWeakness = this.getInstanceKey(instance, 'ignoreThisWeakness')
		player.hooks.onApply.remove(instance)
		player.hooks.beforeAttack.remove(instance)
		delete player.custom[ignoreThisWeakness]
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default TargetBlockSingleUseCard
