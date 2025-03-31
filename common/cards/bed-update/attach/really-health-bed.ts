import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import ExiledEffect from '../../../status-effects/exiled'
import OverhealEffect from '../../../status-effects/overheal'
import {onTurnEnd} from '../../../types/priorities'
import {attach} from '../../defaults'
import {Attach, Hermit} from '../../types'

const ReallyHealthyBed: Attach = {
	...attach,
	id: 'really_healthy_bed',
	numericId: 267,
	expansion: 'beds',
	name: 'Really Healthy Bed',
	rarity: 'ultra_rare',
	tokens: 4,
	description:
		"You may heal the hermit this bed is attached to above max HP.\nIf the hermit this bed is attached to at the end of your turn is over 100 HP above max HP, they're exiled.",
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		if (!component.slot.inRow()) return
		const overheal = game.components.new(
			StatusEffectComponent,
			OverhealEffect,
			component.entity,
		)
		overheal.apply(component.slot.row.hermitSlot.cardEntity)

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				if (!component.slot.inRow()) return
				const row = component.slot.row
				if (!row.hermitSlot.card) return
				if (
					(row.hermitSlot.card.props as Hermit).health + 100 >=
					(row.health || 0)
				)
					return

				const discardRow = () => {
					const toDiscard: (CardComponent | null)[] = [
						...row.getItems(),
						row.hermitSlot.card,
						row.attachSlot.card,
					]
					toDiscard.forEach((card) => {
						if (!card) return
						card.discard()
						if (card.props.category !== 'hermit') return
						const status = game.components.new(
							StatusEffectComponent,
							ExiledEffect,
							component.entity,
						)
						status.counter = row.index
						status.apply(card.entity)
					})
					row.health = null
				}

				if (player.activeRow?.entity !== row.entity) {
					discardRow()
					return
				}

				let knockbackPickRequest = player.getKnockbackPickRequest(component)
				if (!knockbackPickRequest) return
				knockbackPickRequest.onResult = (pickedSlot) => {
					if (!pickedSlot.inRow()) return
					player.knockback(pickedSlot.row)
					discardRow()
				}
				knockbackPickRequest.onTimeout = () => {
					const slot = component.game.components.find(
						SlotComponent,
						query.every(
							query.slot.player(player.entity),
							query.slot.hermit,
							query.not(query.slot.active),
							query.not(query.slot.empty),
							query.not(query.slot.frozen),
							query.slot.canBecomeActive,
						),
					)
					if (!slot?.inRow()) return
					player.knockback(slot.row)
					discardRow()
				}
				game.addPickRequest(knockbackPickRequest)
			},
		)
	},
}

export default ReallyHealthyBed
