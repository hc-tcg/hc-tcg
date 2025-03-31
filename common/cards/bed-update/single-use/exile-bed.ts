import {
	CardComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import ExiledEffect from '../../../status-effects/exiled'
import {singleUse} from '../../defaults'
import {SingleUse} from '../../types'

const ExileBed: SingleUse = {
	...singleUse,
	id: 'exile_bed',
	name: 'Exile Bed',
	expansion: 'beds',
	numericId: 270,
	rarity: 'ultra_rare',
	tokens: 3,
	description: "Send your opponent's active hermit to exile.",
	sidebarDescriptions: [
		{
			type: 'statusEffect',
			name: 'exiled',
		},
	],
	attachCondition: query.every(
		singleUse.attachCondition,
		query.exists(
			SlotComponent,
			query.slot.opponent,
			query.slot.hermit,
			query.not(query.slot.active),
			query.not(query.slot.empty),
			query.not(query.slot.frozen),
			query.slot.canBecomeActive,
		),
	),
	showConfirmationModal: true,
	onAttach(game, component, observer) {
		const {player, opponentPlayer, entity} = component

		observer.subscribe(player.hooks.onApply, () => {
			const row = opponentPlayer.activeRow
			if (!row) return

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
						entity,
					)
					status.counter = row.index
					status.apply(card.entity)
				})
				row.health = null
			}

			let knockbackPickRequest =
				opponentPlayer.getKnockbackPickRequest(component)
			if (!knockbackPickRequest) return
			knockbackPickRequest.onResult = (pickedSlot) => {
				if (!pickedSlot.inRow()) return
				opponentPlayer.knockback(pickedSlot.row)
				discardRow()
			}
			knockbackPickRequest.onTimeout = () => {
				const slot = component.game.components.find(
					SlotComponent,
					query.every(
						query.slot.player(opponentPlayer.entity),
						query.slot.hermit,
						query.not(query.slot.active),
						query.not(query.slot.empty),
						query.not(query.slot.frozen),
						query.slot.canBecomeActive,
					),
				)
				if (!slot?.inRow()) return
				opponentPlayer.knockback(slot.row)
				discardRow()
			}
			game.addPickRequest(knockbackPickRequest)
		})
	},
}

export default ExileBed
