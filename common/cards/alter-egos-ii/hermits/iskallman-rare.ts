import {HERMIT_CARDS} from '../..'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {getActiveRow, getNonEmptyRows} from '../../../utils/board'
import HermitCard from '../../base/hermit-card'

class IskallmanRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'iskallman_rare',
			numericId: 233,
			name: 'IskallMAN',
			rarity: 'rare',
			hermitType: 'explorer',
			health: 260,
			primary: {
				name: 'Iskall...MAAAN',
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Good Deed',
				cost: ['explorer', 'explorer'],
				damage: 50,
				power: 'You can remove 50hp from this Hermit and give it to any AFK Hermit on the board.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel): void {
		const {player, opponentPlayer} = pos
		const playerKey = this.getInstanceKey(instance, 'player')
		const rowKey = this.getInstanceKey(instance, 'row')

		player.hooks.getAttackRequests.add(instance, (activeInstance, hermitAttackType) => {
			// Make sure we are attacking
			if (activeInstance !== instance) return

			// Only secondary attack
			if (hermitAttackType !== 'secondary') return

			const activeRow = getActiveRow(player)

			if (!activeRow || activeRow.health < 50) return

			// Make sure there is something to select
			const playerHasAfk = getNonEmptyRows(player, true).some(
				(rowPos) => HERMIT_CARDS[rowPos.row.hermitCard.cardId] !== undefined
			)
			const opponentHasAfk = getNonEmptyRows(opponentPlayer, true).some(
				(rowPos) => HERMIT_CARDS[rowPos.row.hermitCard.cardId] !== undefined
			)
			if (!playerHasAfk && !opponentHasAfk) return

			game.addModalRequest({
				playerId: player.id,
				data: {
					modalId: 'selectCards',
					payload: {
						modalName: 'IskallMAN: Heal AFK Hermit',
						modalDescription: 'Do you want to give 50hp to an AFK Hermit?',
						cards: [],
						selectionSize: 0,
						primaryButton: {
							text: 'Yes',
							variant: 'default',
						},
						secondaryButton: {
							text: 'No',
							variant: 'default',
						},
					},
				},
				onResult(modalResult) {
					if (!modalResult) return 'SUCCESS'
					if (!modalResult.result) return 'SUCCESS'
					game.addPickRequest({
						playerId: player.id,
						id: 'iskallman_rare',
						message: 'Pick an AFK Hermit from either side of the board',
						onResult(pickResult) {
							const pickedPlayer = game.state.players[pickResult.playerId]
							const rowIndex = pickResult.rowIndex
							if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
							if (rowIndex === pickedPlayer.board.activeRow) return 'FAILURE_INVALID_SLOT'

							if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
							if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

							// Make sure it's an actual hermit card
							const hermitCard = HERMIT_CARDS[pickResult.card.cardId]
							if (!hermitCard) return 'FAILURE_INVALID_SLOT'

							// Store the info to use later
							player.custom[playerKey] = pickResult.playerId
							player.custom[rowKey] = rowIndex

							return 'SUCCESS'
						},
						onTimeout() {
							// We didn't pick anyone to heal, so heal no one
						},
					})

					return 'SUCCESS'
				},
				onTimeout() {
					return
				},
			})
		})

		// Heals the afk hermit *before* we actually do damage
		player.hooks.onAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId || attack.type !== 'secondary') return

			const pickedPlayer = game.state.players[player.custom[playerKey]]
			if (!pickedPlayer) return
			const pickedRowIndex = player.custom[rowKey]
			const pickedRow = pickedPlayer.board.rows[pickedRowIndex]
			if (!pickedRow || !pickedRow.hermitCard) return

			const activeRow = getActiveRow(player)

			if (!activeRow) return

			const hermitInfo = HERMIT_CARDS[pickedRow.hermitCard.cardId]
			if (hermitInfo) {
				// Heal
				pickedRow.health = Math.min(
					pickedRow.health + 50,
					hermitInfo.health // Max health
				)
				activeRow.health -= 50
			}

			delete player.custom[playerKey]
			delete player.custom[rowKey]
		})
	}

	public override onDetach(game: GameModel, instance: string, pos: CardPosModel): void {
		const {player} = pos
		const instanceKey = this.getInstanceKey(instance)
		delete player.custom[instanceKey]

		player.hooks.getAttackRequests.remove(instance)
		player.hooks.onAttack.remove(instance)
	}

	override getExpansion() {
		return 'alter_egos_ii'
	}

	override getPalette() {
		return 'alter_egos'
	}

	override getBackground() {
		return 'alter_egos_background'
	}
}

export default IskallmanRareHermitCard
