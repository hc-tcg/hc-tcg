import {GameModel} from '../../../models/game-model'
import {applySingleUse} from '../../../utils/board'
import {card, effect, query, slot} from '../../../components/query'
import Card from '../../base/card'
import {attach, singleUse} from '../../base/defaults'
import {CardComponent, SlotComponent, StatusEffectComponent} from '../../../components'
import {Attach, SingleUse} from '../../base/types'
import PoisonStatusEffect from '../../../status-effects/poison'
import BadOmenStatusEffect from '../../../status-effects/badomen'

class MilkBucket extends Card {
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
		attachCondition: query.some(attach.attachCondition, singleUse.attachCondition),
		log: (values) => {
			if (values.pos.slotType === 'single_use')
				return `${values.defaultLog} on $p${values.pick.name}$`
			return `$p{You|${values.player}}$ attached $e${this.props.name}$ to $p${values.pos.hermitCard}$`
		},
	}

	private static removeFireEffect(game: GameModel, slot: SlotComponent | null | undefined) {
		if (!slot) return
		game.components
			.filter(
				StatusEffectComponent,
				effect.target(card.slotIs(slot.entity)),
				effect.is(PoisonStatusEffect, BadOmenStatusEffect)
			)
			.forEach((effect) => effect.remove())
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = component
		if (component.slot.type === 'single_use') {
			game.addPickRequest({
				playerId: player.id,
				id: component.entity,
				message: 'Pick one of your Hermits',
				canPick: query.every(slot.currentPlayer, slot.hermitSlot, query.not(slot.empty)),
				onResult(pickedSlot) {
					if (!pickedSlot.inRow()) return

					MilkBucket.removeFireEffect(game, pickedSlot)

					applySingleUse(game, pickedSlot)
				},
			})
		} else if (component.slot.type === 'attach') {
			// Straight away remove fire
			MilkBucket.removeFireEffect(game, component.slot)

			player.hooks.onDefence.add(component, (_attack) => {
				if (!component.slot.inRow()) return
				MilkBucket.removeFireEffect(game, component.slot.row.getHermit()?.slot)
			})

			opponentPlayer.hooks.afterApply.add(component, () => {
				if (!component.slot.inRow()) return
				MilkBucket.removeFireEffect(game, component.slot.row.getHermit()?.slot)
			})
		}
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = component
		player.hooks.onDefence.remove(component)
		opponentPlayer.hooks.afterApply.remove(component)
	}
}

export default MilkBucket
