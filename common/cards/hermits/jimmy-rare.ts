import {HERMIT_CARDS} from '..'
import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {RowPos} from '../../types/cards'
import {RowStateWithHermit} from '../../types/game-state'
import {getNonEmptyRows} from '../../utils/board'
import HermitCard from '../base/hermit-card'

class JimmyRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'jimmy_rare',
			numericId: 156,
			name: 'Jimmy',
			rarity: 'rare',
			hermitType: 'prankster',
			health: 270,
			primary: {
				name: 'Law',
				cost: ['prankster', 'any'],
				damage: 30,
				power: null,
			},
			secondary: {
				name: 'Not a toy',
				cost: ['prankster', 'prankster', 'prankster'],
				damage: 70,
				power: null,
			},
		})
	}

	public override onAttach(game: GameModel, instance: string, pos: CardPosModel): void {
		const {player, opponentPlayer} = pos
		const instanceKey = this.getInstanceKey(instance)

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'primary') return
			const playerInactiveRows = getNonEmptyRows(player, false)
			if (playerInactiveRows.length === 0) return
			if (player.custom[instanceKey]) return

			player.pickRequests.push({
				id: instance,
				message: 'Choose an afk hermit to protect',
				onResult(pickResult) {
					if (pickResult.playerId !== player.id) return 'FAILURE_WRONG_PLAYER'

					const rowIndex = pickResult.rowIndex
					if (rowIndex === undefined || rowIndex === player.board.activeRow)
						return 'FAILURE_INVALID_SLOT'
					if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
					if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

					player.custom[instanceKey] = pickResult.card.cardInstance

					return 'SUCCESS'
				},
				onTimeout() {
					player.custom[instanceKey] = playerInactiveRows[0].row.hermitCard.cardInstance
				},
			})
		})

		opponentPlayer.hooks.onTurnStart.add(instance, () => {
			if (!player.board.activeRow) return
			if (
				player.custom[instanceKey] !==
				player.board.rows[player.board.activeRow].hermitCard?.cardInstance
			)
				return
			
			player.hooks.onDefence.add(instance, (attack) => {
				if (!player.custom[instanceKey] || !player.board.activeRow) return
				if (attack.target?.row.hermitCard.cardInstance !== player.custom[instanceKey]) return
				if (
					player.board.rows[player.board.activeRow].hermitCard?.cardInstance !==
					player.custom[instanceKey]
				)
					return

				if (attack.isBacklash) return

				if (attack.getDamage() > 0) {
					attack.multiplyDamage(this.id, 0).lockDamage()
				}
			})

			opponentPlayer.hooks.onTurnEnd.add(instance, () => {
				delete player.custom[instanceKey]
				player.hooks.onDefence.remove(instance)

				opponentPlayer.hooks.onTurnEnd.remove(instance)
			})
		})
	}

	public override onDetach(game: GameModel, instance: string, pos: CardPosModel): void {
		const {player} = pos

		player.hooks.onAttack.remove(instance)
	}

	override getExpansion() {
		return 'advent_of_tcg'
	}

	override getPalette() {
		return 'advent_of_tcg'
	}

	override getBackground() {
		return 'advent_of_tcg'
	}
}

export default JimmyRareHermitCard
