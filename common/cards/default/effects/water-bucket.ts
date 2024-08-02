import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import FireEffect from '../../../status-effects/fire'
import {applySingleUse} from '../../../utils/board'
import String from '../../alter-egos/effects/string'
import Card from '../../base/card'
import {attach, singleUse} from '../../base/defaults'
import {Attach, SingleUse} from '../../base/types'

class WaterBucket extends Card {
	props: Attach & SingleUse = {
		...attach,
		...singleUse,
		category: 'attach',
		id: 'water_bucket',
		expansion: 'default',
		numericId: 105,
		name: 'Water Bucket',
		rarity: 'common',
		tokens: 0,
		description:
			'Remove burn and String from one of your Hermits.\nIf attached, prevents the Hermit this card is attached to from being burned.',
		attachCondition: query.some(
			attach.attachCondition,
			singleUse.attachCondition,
		),
		log: (values) => {
			if (values.pos.slotType === 'single_use')
				return `${values.defaultLog} on $p${values.pick.name}$`
			return `$p{You|${values.player}}$ attached $e${this.props.name}$ to $p${values.pos.hermitCard}$`
		},
	}

	private static removeFireEffect(
		game: GameModel,
		slot: SlotComponent | null | undefined,
	) {
		if (!slot) return
		game.components
			.filter(
				StatusEffectComponent,
				query.effect.targetIsCardAnd(query.card.slotEntity(slot.entity)),
				query.effect.is(FireEffect),
			)
			.forEach((effect) => effect.remove())
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component
		if (component.slot.type === 'single_use') {
			game.addPickRequest({
				playerId: player.id,
				id: component.entity,
				message: 'Pick one of your Hermits',
				canPick: query.every(
					query.slot.currentPlayer,
					query.slot.hermit,
					query.not(query.slot.empty),
				),
				onResult(pickedSlot) {
					if (!pickedSlot.inRow()) return

					WaterBucket.removeFireEffect(game, pickedSlot)

					game.components
						.filter(
							CardComponent,
							query.card.slot(query.slot.rowIs(pickedSlot.row.entity)),
							query.card.is(String),
						)
						.forEach((card) => card.discard())

					applySingleUse(game, pickedSlot)
				},
			})
		} else if (component.slot.type === 'attach') {
			// Straight away remove fire
			WaterBucket.removeFireEffect(game, component.slot)

			observer.subscribe(player.hooks.onDefence, (_attack) => {
				if (!component.slot.inRow()) return
				WaterBucket.removeFireEffect(game, component.slot.row.getHermit()?.slot)
			})

			observer.subscribe(opponentPlayer.hooks.afterApply, () => {
				if (!component.slot.inRow()) return
				WaterBucket.removeFireEffect(game, component.slot.row.getHermit()?.slot)
			})
		}
	}
}

export default WaterBucket
