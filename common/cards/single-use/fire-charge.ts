import SingleUseCard from '../base/single-use-card'
import {CARDS} from '..'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'
import {isRemovable} from '../../utils/cards'
import {discardCard, discardSingleUse} from '../../utils/movement'

class FireChargeSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'fire_charge',
			name: 'Fire Charge',
			rarity: 'common',
			description:
				'Discard 1 attached item or effect card from your active or AFK Hermit.\n\nYou can use another single use effect card this turn.',

			pickOn: 'apply',
			pickReqs: [
				{
					target: 'player',
					type: ['item', 'effect'],
					slot: ['item', 'effect'],
					amount: 1,
				},
			],
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

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
			const slots = pickedSlots[this.id] || []
			if (slots.length !== 1) return

			const pickedCard = slots[0]
			if (pickedCard.slot.card === null) return

			discardCard(game, pickedCard.slot.card)
		})

		player.hooks.afterApply.add(instance, (pickedSlots, modalResult) => {
			discardSingleUse(game, player)

			// Remove playing a single use from completed actions so it can be done again
			game.removeCompletedActions('PLAY_SINGLE_USE_CARD')

			player.hooks.onApply.remove(instance)
			player.hooks.afterApply.remove(instance)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onApply.remove(instance)
		player.hooks.afterApply.remove(instance)
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default FireChargeSingleUseCard
