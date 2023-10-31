import SingleUseCard from '../base/single-use-card'
import {CARDS} from '..'
import {GameModel} from '../../models/game-model'
import {CardPosModel, getCardPos} from '../../models/card-pos-model'
import {isRemovable} from '../../utils/cards'
import {discardCard, discardSingleUse} from '../../utils/movement'
import {applySingleUse} from '../../utils/board'

class FireChargeSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'fire_charge',
			numericId: 142,
			name: 'Fire Charge',
			rarity: 'common',
			description:
				'Discard 1 attached item or effect card from your active or AFK Hermit.\n\nYou can use another single use effect card this turn.',
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel): 'YES' | 'NO' | 'INVALID' {
		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach

		const {player} = pos

		for (const row of player.board.rows) {
			const cards = row.itemCards
			let total = 0
			// Should be able to remove string on the item slots
			const validTypes = new Set(['effect', 'item'])

			for (const card of cards) {
				if (card && validTypes.has(CARDS[card.cardId]?.type)) {
					total++
				}
			}

			if ((row.effectCard !== null && isRemovable(row.effectCard)) || total > 0) return 'YES'
		}

		return 'NO'
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick an item or effect card from one of your active or AFK Hermits',
			onResult(pickResult) {
				if (pickResult.playerId !== player.id) return 'FAILURE_WRONG_PLAYER'
				if (pickResult.rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
				if (pickResult.slot.type !== 'item' && pickResult.slot.type !== 'effect')
					return 'FAILURE_INVALID_SLOT'
				if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

				const row = player.board.rows[pickResult.rowIndex]
				if (!row.hermitCard) return 'FAILURE_INVALID_SLOT'

				const pos = getCardPos(game, pickResult.card.cardInstance)
				if (!pos) return 'FAILURE_CANNOT_COMPLETE'

				// Discard the picked card and apply su card
				discardCard(game, pickResult.card)
				applySingleUse(game)

				return 'SUCCESS'
			},
		})

		player.hooks.afterApply.add(instance, (pickedSlots) => {
			discardSingleUse(game, player)

			// Remove playing a single use from completed actions so it can be done again
			game.removeCompletedActions('PLAY_SINGLE_USE_CARD')

			player.hooks.afterApply.remove(instance)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.afterApply.remove(instance)
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default FireChargeSingleUseCard
