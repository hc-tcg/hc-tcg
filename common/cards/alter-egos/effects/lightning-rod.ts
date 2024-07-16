import {GameModel} from '../../../models/game-model'
import {query, slot} from '../../../components/query'
import {CardComponent, DiscardSlotComponent, SlotComponent} from '../../../components'
import Card from '../../base/card'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

class LightningRod extends Card {
	props: Attach = {
		...attach,
		id: 'lightning_rod',
		numericId: 121,
		name: 'Lightning Rod',
		expansion: 'alter_egos',
		rarity: 'rare',
		tokens: 2,
		description:
			"All damage done to your Hermits on your opponent's turn is taken by the Hermit this card is attached to.\nDiscard after damage is taken. Only one of these cards can be attached to your Hermits at a time.",
		attachCondition: query.every(
			attach.attachCondition,
			query.not(
				query.exists(SlotComponent, slot.currentPlayer, slot.attachSlot, slot.has(LightningRod))
			)
		),
	}

	override onAttach(game: GameModel, component: CardComponent, observer: Observer) {
		const {player, opponentPlayer} = component

		let used = false

		opponentPlayer.hooks.beforeAttack.add(component, (attack) => {
			if (!component.slot?.onBoard() || !component.slot.row) return
			if (attack.type === 'status-effect' || attack.isBacklash) return
			if (game.currentPlayer.entity !== opponentPlayer.entity) return
			if (attack.target?.player.id !== player.id) return

			attack.setTarget(component.entity, component.slot.row?.entity)
			used = true
		})

		opponentPlayer.hooks.afterAttack.add(component, (_attack) => {
			if (!used) return
			component.discard()
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {opponentPlayer} = component
		opponentPlayer.hooks.beforeAttack.remove(component)
		opponentPlayer.hooks.afterAttack.remove(component)
	}
}

export default LightningRod
