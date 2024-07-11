import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {CardInstance} from '../../../types/game-state'
import {applyStatusEffect} from '../../../utils/board'
import {flipCoin} from '../../../utils/coinFlips'
import Card, {SingleUse, singleUse} from '../../base/card'

class InvisibilityPotionSingleUseCard extends Card {
	applyTo = slot.every(slot.opponent, slot.activeRow, slot.hermitSlot)

	props: SingleUse = {
		...singleUse,
		id: 'invisibility_potion',
		numericId: 44,
		name: 'Invisibility Potion',
		expansion: 'default',
		rarity: 'rare',
		tokens: 0,
		description:
			"Flip a coin.\nIf heads, your opponent's next attack misses. If tails, their attack damage doubles.",
		showConfirmationModal: true,
		sidebarDescriptions: [
			{
				type: 'glossary',
				name: 'missed',
			},
		],
		attachCondition: slot.every(singleUse.attachCondition, slot.someSlotFulfills(this.applyTo)),
		log: (values) => `${values.defaultLog}, and ${values.coinFlip}`,
	}

	override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.onApply.add(instance, () => {
			let opponentActiveHermit = game.findSlot(this.applyTo)?.card
			if (!opponentActiveHermit) return

			if (flipCoin(player, instance)[0] === 'heads') {
				applyStatusEffect(game, 'invisibility-potion-heads', opponentActiveHermit)
			} else {
				applyStatusEffect(game, 'invisibility-potion-tails', opponentActiveHermit)
			}
		})
	}

	override onDetach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default InvisibilityPotionSingleUseCard
