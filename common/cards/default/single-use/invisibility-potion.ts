import {GameModel} from '../../../models/game-model'
import * as query from '../../../components/query'
import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../../../components'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'
import {
	InvisibilityPotionHeads,
	InvisibilityPotionTails,
} from '../../../status-effects/invisibility-potion'

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

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.onApply, () => {
			if (flipCoin(player, component)[0] === 'heads') {
				game.components.new(StatusEffectComponent, InvisibilityPotionHeads).apply(player.entity)
			} else {
				game.components.new(StatusEffectComponent, InvisibilityPotionTails).apply(player.entity)
			}
		})
	}
}

export default InvisibilityPotion
