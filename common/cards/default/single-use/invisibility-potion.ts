import {GameModel} from '../../../models/game-model'
import {slot} from '../../../filters'
import {CardComponent} from '../../../types/game-state'
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

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = pos

		player.hooks.onApply.add(component, () => {
			let opponentActiveHermit = game.findSlot(this.applyTo)?.cardId
			if (!opponentActiveHermit) return

			if (flipCoin(player, component)[0] === 'heads') {
				applyStatusEffect(game, 'invisibility-potion-heads', opponentActiveHermit)
			} else {
				applyStatusEffect(game, 'invisibility-potion-tails', opponentActiveHermit)
			}
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = pos
		player.hooks.onApply.remove(component)
	}
}

export default InvisibilityPotionSingleUseCard
