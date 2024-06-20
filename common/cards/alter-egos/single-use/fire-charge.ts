import SingleUseCard from '../../base/single-use-card'
import {GameModel} from '../../../models/game-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {isLocked} from '../../../utils/cards'
import {discardCard, discardSingleUse} from '../../../utils/movement'
import {applySingleUse} from '../../../utils/board'
import {getFormattedName} from '../../../utils/game'
import {slot} from '../../../slot'

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

	pickCondition = slot.every(
		slot.player,
		slot.not(slot.empty),
		slot.some(
			slot.itemSlot,
			slot.every(slot.effectSlot, (game, pick) => pick.card !== null && !isLocked(game, pick.card))
		)
	)

	override _attachCondition = slot.every(
		super.attachCondition,
		slot.someSlotFulfills(this.pickCondition)
	)

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick an item or effect card from one of your active or AFK Hermits',
			canPick: this.pickCondition,
			onResult(pickResult) {
				if (!pickResult.card) return

				// Discard the picked card and apply su card
				discardCard(game, pickResult.card)
				applySingleUse(game, pickResult)
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
