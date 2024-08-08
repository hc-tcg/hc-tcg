import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import BadOmenEffect from '../../../status-effects/badomen'
import PoisonEffect from '../../../status-effects/poison'
import {applySingleUse} from '../../../utils/board'
import CardOld from '../../base/card'
import {attach, singleUse} from '../../base/defaults'
import {Attach, SingleUse} from '../../base/types'

class MilkBucket extends CardOld {
	props: Attach & SingleUse = {
		...attach,
		...singleUse,
		id: 'milk_bucket',
		numericId: 79,
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
				query.effect.is(PoisonEffect, BadOmenEffect),
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

					MilkBucket.removeFireEffect(game, pickedSlot)

					applySingleUse(game, pickedSlot)
				},
			})
		} else if (component.slot.type === 'attach') {
			// Straight away remove fire
			MilkBucket.removeFireEffect(game, component.slot)

			observer.subscribe(player.hooks.onDefence, (_attack) => {
				if (!component.slot.inRow()) return
				MilkBucket.removeFireEffect(game, component.slot.row.getHermit()?.slot)
			})

			observer.subscribe(opponentPlayer.hooks.afterApply, () => {
				if (!component.slot.inRow()) return
				MilkBucket.removeFireEffect(game, component.slot.row.getHermit()?.slot)
			})
		}
	}
}

export default MilkBucket
