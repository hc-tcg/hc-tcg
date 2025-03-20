import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import BadOmenEffect from '../../status-effects/badomen'
import PoisonEffect from '../../status-effects/poison'
import {afterApply, beforeAttack} from '../../types/priorities'
import {applySingleUse} from '../../utils/board'
import {attach, singleUse} from '../defaults'
import {Attach, SingleUse} from '../types'

function removeStatusEffects(
	game: GameModel,
	slot: SlotComponent | null | undefined,
) {
	if (!slot) return
	game.components
		.filter(
			StatusEffectComponent,
			query.effect.targetIsCardAnd(query.card.slotEntity(slot.entity)),
			query.effect.is(PoisonEffect, BadOmenEffect),
		)
		.forEach((effect) => effect.remove())
}

const MilkBucket: Attach & SingleUse = {
	...attach,
	...singleUse,
	id: 'milk_bucket',
	numericId: 86,
	name: 'Milk Bucket',
	category: 'attach',
	expansion: 'default',
	rarity: 'common',
	tokens: 0,
	description:
		'Remove poison and bad omen from one of your Hermits.\nIf attached, prevents the Hermit this card is attached to from being poisoned.',
	attachCondition: query.some(
		attach.attachCondition,
		singleUse.attachCondition,
	),
	log: (values) => {
		if (values.pos.slotType === 'single_use')
			return `${values.defaultLog} on $p${values.pick.name}$`
		return `$p{You|${values.player}}$ attached $e${MilkBucket.name}$ to $p${values.pos.hermitCard}$`
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

					removeStatusEffects(game, pickedSlot)

					applySingleUse(game, pickedSlot)
				},
			})
		} else if (component.slot.type === 'attach') {
			// Straight away remove fire
			removeStatusEffects(game, component.slot)

			observer.subscribeWithPriority(
				game.hooks.beforeAttack,
				beforeAttack.EFFECT_REMOVE_STATUS,
				(_attack) => {
					if (!component.slot.inRow()) return
					removeStatusEffects(game, component.slot.row.getHermit()?.slot)
				},
			)

			observer.subscribeWithPriority(
				opponentPlayer.hooks.afterApply,
				afterApply.CLEAR_STATUS_EFFECT,
				() => {
					if (!component.slot.inRow()) return
					removeStatusEffects(game, component.slot.row.getHermit()?.slot)
				},
			)
		}
	},
}

export default MilkBucket
