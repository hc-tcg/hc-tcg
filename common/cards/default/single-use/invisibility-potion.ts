import {GameModel} from '../../../models/game-model'
import * as query from '../../../components/query'
import {CardComponent, SlotComponent} from '../../../components'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class InvisibilityPotion extends Card {
	applyTo = query.every(query.slot.opponent, query.slot.activeRow, query.slot.hermitSlot)

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
		attachCondition: query.every(
			singleUse.attachCondition,
			query.exists(SlotComponent, this.applyTo)
		),
		log: (values) => `${values.defaultLog}, and ${values.coinFlip}`,
	}

	override onAttach(game: GameModel, component: CardComponent, observer: Observer) {
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
		const {player} = component
		player.hooks.onApply.remove(component)
	}
}

export default InvisibilityPotion
