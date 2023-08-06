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

		player.hooks.beforeApply.add(instance, (pickedSlots, modalResult) => {
			const slots = pickedSlots[this.id] || []
			if (slots.length !== 1) return

			const pickedCard = slots[0]
			if (pickedCard.slot.card === null) return

			discardCard(game, pickedCard.slot.card)

			// We remove on turnEnd instead of onDetach because we need to keep the hooks
			// until the end of the turn in case the player plays another single use card
			player.hooks.onTurnEnd.add(instance, () => {
				player.hooks.onTurnEnd.remove(instance)
				player.hooks.availableActions.remove(instance)
				player.hooks.onApply.remove(instance)
			})

			player.hooks.availableActions.add(instance, (availableActions) => {
				// We have to check if PLAY_SINGLE_USE_CARD is already there because it's possible that another card added it
				// e.g. if you play a card that allows you to play another single use card like multiple Pistons back to back
				if (!availableActions.includes('PLAY_SINGLE_USE_CARD')) {
					availableActions.push('PLAY_SINGLE_USE_CARD')
				}

				return availableActions
			})

			player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
				if (player.board.singleUseCard?.cardInstance === instance) return
				player.hooks.availableActions.remove(instance)
				player.hooks.onTurnEnd.remove(instance)
				player.hooks.onApply.remove(instance)
			})
		})

		player.hooks.afterApply.add(instance, (pickedSlots, modalResult) => {
			discardSingleUse(game, player)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.afterApply.remove(instance)
		player.hooks.beforeApply.remove(instance)
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default FireChargeSingleUseCard
