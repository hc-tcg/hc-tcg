import {HERMIT_CARDS} from '..'
import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {RowPos} from '../../types/cards'
import {RowStateWithHermit} from '../../types/game-state'
import {getNonEmptyRows} from '../../utils/board'
import HermitCard from '../base/hermit-card'
import {applyAilment, removeAilment} from '../../utils/board'

class Smajor1995RareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'smajor1995_rare',
			numericId: 161,
			name: 'Scott',
			rarity: 'rare',
			hermitType: 'builder',
			health: 270,
			primary: {
				name: 'Color Splash',
				cost: ['any'],
				damage: 30,
				power: null,
			},
			secondary: {
				name: 'To Dye For',
				cost: ['any', 'any', 'any'],
				damage: 70,
				power:
					'After your attack, select one of your Hermits. Items attached to this Hermit become any type.',
			},
		})
	}

	public override onAttach(game: GameModel, instance: string, pos: CardPosModel): void {
		const {player} = pos
		const instanceKey = this.getInstanceKey(instance)

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary') return
			const playerInactiveRows = getNonEmptyRows(player, false)
			if (playerInactiveRows.length === 0) return

			game.addPickRequest({
				playerId: player.id,
				id: instance,
				message: 'Choose an AFK Hermit to dye.',
				onResult(pickResult) {
					if (pickResult.playerId !== player.id) return 'FAILURE_WRONG_PLAYER'

					const rowIndex = pickResult.rowIndex
					if (rowIndex === undefined || rowIndex === player.board.activeRow)
						return 'FAILURE_INVALID_SLOT'
					if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
					if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

					applyAilment(game, 'dyed', pickResult.card.cardInstance)

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

export default Smajor1995RareHermitCard
