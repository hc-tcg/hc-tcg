import {HERMIT_CARDS} from '..'
import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {RowPos} from '../../types/cards'
import {RowStateWithHermit} from '../../types/game-state'
import { getNonEmptyRows } from '../../utils/board'
import { discardCard } from '../../utils/movement'
import HermitCard from '../base/hermit-card'

class KatherineelizRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'katherineeliz_rare',
			numericId: 159,
			name: 'Katherine',
			rarity: 'rare',
			hermitType: 'builder',
			health: 270,
			primary: {
				name: 'Monster Hunter',
				cost: ['builder'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Dreamy Designs',
				cost: ['builder', 'builder'],
				damage: 80,
				power: 'After your attack, select an empty effect slot, or one filled with armor. Increase the damage prevention by 10hp, up to 40hp damage prevented.',
			},
		})
	}

	public override onAttach(game: GameModel, instance: string, pos: CardPosModel): void {
		const {player, opponentPlayer} = pos

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary') return
			const nonEmptyRows = getNonEmptyRows(player, true)

			const upgrades: Record<string, string> = {
				gold_armor: 'iron_armor',
				iron_armor: 'diamond_armor',
				diamond_armor: 'netherite_armor'
			}
			
			const hasValidRows = nonEmptyRows.some((r) => {
				return !r.row.effectCard || Object.keys(upgrades).includes(r.row.effectCard?.cardId)
			})

			if (!hasValidRows) return

			game.addPickRequest({
				playerId: player.id,
				id: instance,
				message: 'Choose a Hermit\'s effect slot',
				onResult(pickResult) {
					const rowIndex = pickResult.rowIndex
					const pickedCard = pickResult.card
					const pickedPlayer = game.currentPlayerId == pickResult.playerId ? player : opponentPlayer
					if (pickResult.slot.type !== 'effect' || rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
					if (!pickedPlayer.board.rows[rowIndex].hermitCard) return 'FAILURE_INVALID_SLOT'

					if (pickedCard) {
						if (!Object.keys(upgrades).includes(pickedCard?.cardId)) return 'FAILURE_INVALID_SLOT'
						discardCard(game, pickedCard)
					}

					const cardInfo = {
						cardId: pickedCard ? upgrades[pickedCard.cardId] : 'gold_armor',
						cardInstance: Math.random().toString(),
					}
					
					pickedPlayer.board.rows[rowIndex].effectCard = cardInfo

					return 'SUCCESS'
				},
				onTimeout() {
					return
				},
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

export default KatherineelizRareHermitCard
