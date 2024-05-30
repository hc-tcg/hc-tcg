import SingleUseCard from '../../base/single-use-card'
import {CARDS} from '../..'
import {GameModel} from '../../../models/game-model'
import {CardPosModel, getCardPos} from '../../../models/card-pos-model'
import {isRemovable} from '../../../utils/cards'
import {discardCard, discardSingleUse} from '../../../utils/movement'
import {applySingleUse} from '../../../utils/board'
import {getFormattedName} from '../../../utils/game'

class FireChargeSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'fire_charge',
			numericId: 142,
			name: 'Fire Charge',
			rarity: 'common',
			description:
				'Discard one attached item or effect card from any of your Hermits.\nYou can use another single use effect card this turn.',
			log: (values) => `${values.defaultLog} to discard ${getFormattedName(values.pick.id, false)}`,
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const result = super.canAttach(game, pos)

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

			if ((row.effectCard !== null && isRemovable(row.effectCard)) || total > 0) return result
		}

		result.push('UNMET_CONDITION')
		return result
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick an item or effect card from one of your active or AFK Hermits',
			onResult(pickResult) {
				if (pickResult.playerId !== player.id) return 'FAILURE_INVALID_PLAYER'
				if (pickResult.rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
				if (pickResult.slot.type !== 'item' && pickResult.slot.type !== 'effect')
					return 'FAILURE_INVALID_SLOT'
				if (!pickResult.card) return 'FAILURE_INVALID_SLOT'
				if (pickResult.slot.type === 'effect' && !isRemovable(pickResult.card))
					return 'FAILURE_CANNOT_COMPLETE'

				const row = player.board.rows[pickResult.rowIndex]
				if (!row.hermitCard) return 'FAILURE_INVALID_SLOT'

				const pos = getCardPos(game, pickResult.card.cardInstance)
				if (!pos) return 'FAILURE_CANNOT_COMPLETE'

				// Discard the picked card and apply su card
				discardCard(game, pickResult.card)
				applySingleUse(game, pickResult)

				return 'SUCCESS'
			},
		})

		player.hooks.afterApply.add(instance, () => {
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
