import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {applySingleUse, getActiveRow, getNonEmptyRows} from '../../../utils/board'
import SingleUseCard from '../../base/single-use-card'

const pickCondition = slot.every(slot.opponent, slot.hermitSlot, slot.not(slot.empty))

class KnockbackSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'knockback',
			numericId: 73,
			name: 'Knockback',
			rarity: 'rare',
			description:
				'After your attack, your opponent must choose an AFK Hermit to set as their active Hermit, unless they have no AFK Hermits.',
			log: (values) => `${values.defaultLog} with {your|their} attack`,
		})
	}

	override _attachCondition = slot.every(
		super.attachCondition,
		slot.someSlotFullfills(pickCondition)
	)

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.afterAttack.add(instance, (attack) => {
			applySingleUse(game)

			// Only Apply this for the first attack
			player.hooks.afterAttack.remove(instance)
		})

		player.hooks.onApply.add(instance, () => {
			const activeRow = getActiveRow(opponentPlayer)

			if (activeRow && activeRow.health) {
				const lastActiveRow = opponentPlayer.board.activeRow

				game.addPickRequest({
					playerId: opponentPlayer.id,
					id: this.id,
					message: 'Choose a new active Hermit from your AFK Hermits',
					canPick: pickCondition,
					onResult(pickResult) {
						if (pickResult.rowIndex === undefined) return

						game.changeActiveRow(opponentPlayer, pickResult.rowIndex)
					},
					onTimeout() {
						const opponentInactiveRows = getNonEmptyRows(opponentPlayer, true)

						// Choose the first afk row
						for (const inactiveRow of opponentInactiveRows) {
							const {rowIndex} = inactiveRow
							const canBeActive = rowIndex !== lastActiveRow
							if (canBeActive) {
								game.changeActiveRow(opponentPlayer, rowIndex)
								break
							}
						}
					},
				})
			}
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.afterAttack.remove(instance)
		player.hooks.onApply.remove(instance)
	}
}

export default KnockbackSingleUseCard
