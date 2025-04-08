import {
	CardComponent,
	ObserverComponent,
	RowComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import ExiledEffect from '../../../status-effects/exiled'
import {attach} from '../../defaults'
import {Attach} from '../../types'

const BouncyBed: Attach = {
	...attach,
	id: 'bouncy_bed',
	numericId: 273,
	expansion: 'beds',
	name: 'Bouncy bed',
	rarity: 'ultra_rare',
	tokens: 2,
	description:
		'Move the hermit this is attached to the top row. If the top row is blocked, exile the hermit.',
	log: (values) =>
		`$p{You|${values.player}}$ placed $p${values.pos.name}$ on row #${values.pick.rowIndex}`,
	onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: ObserverComponent,
	) {
		const {player} = component

		if (!component.slot.inRow()) return

		const newRow = game.components.find(
			RowComponent,
			query.row.index(0),
			query.row.player(player.entity),
		)
		if (!newRow) return
		if (!newRow.hermitSlot.cardEntity) {
			game.swapRows(newRow, component.slot.row)
			return
		}

		const row = component.slot.row
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
}

export default BouncyBed
