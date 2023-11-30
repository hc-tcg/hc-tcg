import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {createWeaknessAttack} from '../../../utils/attacks'
import {applySingleUse, getNonEmptyRows} from '../../../utils/board'
import SingleUseCard from '../../base/single-use-card'

class TargetBlockSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'target_block',
			numericId: 149,
			name: 'Target Block',
			rarity: 'rare',
			description:
				"Choose one of your opponent's AFK Hermits to take all damage done during this turn.",
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

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const ignoreThisWeakness = this.getInstanceKey(instance, 'ignoreThisWeakness')

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: "Pick one of your opponent's AFK Hermits",
			onResult(pickResult) {
				if (pickResult.playerId !== opponentPlayer.id) return 'FAILURE_WRONG_PLAYER'

				const rowIndex = pickResult.rowIndex
				if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
				if (rowIndex === opponentPlayer.board.activeRow) return 'FAILURE_INVALID_SLOT'

				if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
				if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

				const row = opponentPlayer.board.rows[rowIndex]
				if (!row.hermitCard) return 'FAILURE_INVALID_SLOT'

				// Apply the card
				applySingleUse(game)

				// Redirect all future attacks this turn
				player.hooks.beforeAttack.add(instance, (attack) => {
					if (attack.isType('ailment') || attack.isBacklash) return

					attack.target = {
						player: opponentPlayer,
						rowIndex,
						row,
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

				return 'SUCCESS'
			},
		})

		player.hooks.onTurnEnd.add(instance, () => {
			player.hooks.beforeAttack.remove(instance)
			player.hooks.onTurnEnd.remove(instance)
			delete player.custom[ignoreThisWeakness]
		})
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default TargetBlockSingleUseCard
