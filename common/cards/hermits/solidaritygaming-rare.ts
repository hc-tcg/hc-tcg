import {HERMIT_CARDS} from '..'
import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {RowPos} from '../../types/cards'
import {RowStateWithHermit} from '../../types/game-state'
import {getNonEmptyRows} from '../../utils/board'
import HermitCard from '../base/hermit-card'
import {applyAilment, removeAilment} from '../../utils/board'

class SolidaritygamingRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'solidaritygaming_rare',
			numericId: 156,
			name: 'Jimmy',
			rarity: 'rare',
			hermitType: 'prankster',
			health: 270,
			primary: {
				name: 'The Law',
				cost: ['prankster', 'any'],
				damage: 30,
				power:
					'After your attack, choose one of your AFK Hermits to protect. This Hermit does not take damage on their first active turn.\nOnly one Hermit can be protected at a time.',
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
		const {player} = pos
		const instanceKey = this.getInstanceKey(instance)

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'primary') return
			const playerInactiveRows = getNonEmptyRows(player, false)
			if (playerInactiveRows.length === 0) return

			player.board.rows.forEach((row) => {
				if (!row.hermitCard) return

				const ailmentsToRemove = game.state.ailments.filter((ail) => {
					return (
						ail.targetInstance === row.hermitCard.cardInstance && ail.ailmentId === 'protection'
					)
				})

				ailmentsToRemove.forEach((ail) => {
					removeAilment(game, pos, ail.ailmentInstance)
				})
			})

			game.addPickRequest({
				playerId: player.id,
				id: instance,
				message: 'Choose an AFK Hermit to protect',
				onResult(pickResult) {
					if (pickResult.playerId !== player.id) return 'FAILURE_WRONG_PLAYER'

					const rowIndex = pickResult.rowIndex
					if (rowIndex === undefined || rowIndex === player.board.activeRow)
						return 'FAILURE_INVALID_SLOT'
					if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
					if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

					applyAilment(game, 'protected', pickResult.card.cardInstance)

					return 'SUCCESS'
				},
			})
		})
	}

	public override onDetach(game: GameModel, instance: string, pos: CardPosModel): void {
		const {player} = pos
		const instanceKey = this.getInstanceKey(instance)

		player.hooks.onAttack.remove(instance)
		delete player.custom[instanceKey]
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

export default SolidaritygamingRareHermitCard
