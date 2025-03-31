import EnderPearl from '../cards/single-use/ender-pearl'
import {Hermit} from '../cards/types'
import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../components'
import query from '../components/query'
import {GameModel} from '../models/game-model'
import {StatusEffect, hiddenStatusEffect} from './status-effect'

const ExiledEffect: StatusEffect<CardComponent> = {
	...hiddenStatusEffect,
	id: 'exiled',
	name: 'Exiled',
	description:
		'This hermit and any attached cards are discarded without losing a life.\nThe hermit can be recovered by using a bed card or ender pearl if the slot they were discarded from is empty.',
	onApply(
		game: GameModel,
		effect: StatusEffectComponent<CardComponent>,
		target: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = target

		const recoverCard = () => {
			const returnSlot = game.components.find(
				SlotComponent,
				query.slot.rowIndex(effect.counter),
				query.slot.player(target.player.entity),
				query.slot.hermit,
				query.slot.empty,
			)
			if (!returnSlot || !returnSlot.inRow()) return
			returnSlot.row.health = (target.props as Hermit).health
			target.attach(returnSlot)
		}

		observer.subscribe(player.hooks.onApply, () => {
			const id = game.components.find(SlotComponent, query.slot.singleUse)?.card
				?.props?.id
			if (!id) return
			if (!(id.includes('bed') || id === EnderPearl.id)) return

			recoverCard()
			effect.remove()
		})

		observer.subscribe(player.hooks.onAttach, (card) => {
			const {id} = card.props
			if (!id) return
			if (!(id.includes('bed') || id === EnderPearl.id)) return

			recoverCard()
			effect.remove()
		})
	},
}

export default ExiledEffect
