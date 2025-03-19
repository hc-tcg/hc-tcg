import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import FireEffect from '../../status-effects/fire'
import {afterApply, beforeAttack} from '../../types/priorities'
import {applySingleUse} from '../../utils/board'
import String from '../attach/string'
import {attach, singleUse} from '../defaults'
import {Attach, SingleUse} from '../types'

function removeFireEffect(
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

const WaterBucket: Attach & SingleUse = {
	...attach,
	...singleUse,
	category: 'attach',
	id: 'water_bucket',
	expansion: 'default',
	numericId: 96,
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
		return `$p{You|${values.player}}$ attached $e${WaterBucket.name}$ to $p${values.pos.hermitCard}$`
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component
		if (component.slot.type === 'single_use') {
			game.addPickRequest({
				player: player.entity,
				id: component.entity,
				message: 'Pick one of your Hermits',
				canPick: query.every(
					query.slot.currentPlayer,
					query.slot.hermit,
					query.not(query.slot.empty),
				),
				onResult(pickedSlot) {
					if (!pickedSlot.inRow()) return

					removeFireEffect(game, pickedSlot)

					game.components
						.filter(
							CardComponent,
							query.card.slot(
								query.slot.rowIs(pickedSlot.row.entity),
								query.not(query.slot.frozen),
							),
							query.card.is(String),
						)
						.forEach((card) => card.discard())

					applySingleUse(game, pickedSlot)
				},
			})
		} else if (component.slot.type === 'attach') {
			// Straight away remove fire
			removeFireEffect(game, component.slot)

			observer.subscribeWithPriority(
				game.hooks.beforeAttack,
				beforeAttack.EFFECT_REMOVE_STATUS,
				(_attack) => {
					if (!component.slot.inRow()) return
					removeFireEffect(game, component.slot.row.getHermit()?.slot)
				},
			)

			observer.subscribeWithPriority(
				opponentPlayer.hooks.afterApply,
				afterApply.CLEAR_STATUS_EFFECT,
				() => {
					if (!component.slot.inRow()) return
					removeFireEffect(game, component.slot.row.getHermit()?.slot)
				},
			)
		}
	},
}

export default WaterBucket
