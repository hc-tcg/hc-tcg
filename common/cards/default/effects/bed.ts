import {GameModel} from '../../../models/game-model'
import {discardCard} from '../../../utils/movement'
import {CardPosModel} from '../../../models/card-pos-model'
import {applyStatusEffect} from '../../../utils/board'
import {slot} from '../../../slot'
import Card, {Attach, attach} from '../../base/card'
import {CardInstance} from '../../../types/game-state'
import {SlotInfo} from '../../../types/cards'

class BedEffectCard extends Card {
	props: Attach = {
		...attach,
		id: 'bed',
		numericId: 2,
		expansion: 'default',
		name: 'Bed',
		rarity: 'ultra_rare',
		tokens: 3,
		description:
			'Attach to your active Hermit. This Hermit restores all HP, then sleeps for the rest of this turn, and the following two turns, before waking up. Discard after your Hermit wakes up.',
		sidebarDescriptions: [
			{
				type: 'statusEffect',
				name: 'sleeping',
			},
		],
		attachCondition: slot.every(attach.attachCondition, slot.activeRow),
	}

	override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		// Give the current row sleeping for 3 turns
		const {player, row} = pos

		let hermitCard: CardInstance | null = null

		if (row && row.hermitCard) {
			applyStatusEffect(game, 'sleeping', row.hermitCard)
		}

		// Knockback/Tango/Jevin/etc
		player.hooks.onTurnStart.add(instance, () => {
			const isSleeping = game.state.statusEffects.some(
				(a) =>
					a.targetInstance.instance == row?.hermitCard?.instance && a.statusEffectId == 'sleeping'
			)
			if (!isSleeping) {
				discardCard(game, row?.effectCard || null)
				return
			}
		})

		player.hooks.beforeApply.add(instance, () => {
			hermitCard = row?.hermitCard || null
		})

		//Ladder
		player.hooks.afterApply.add(instance, () => {
			if (hermitCard?.instance != row?.hermitCard?.instance && row && row.hermitCard) {
				row.health = row.hermitCard.props.health

				// Add new sleeping statusEffect
				applyStatusEffect(game, 'sleeping', row.hermitCard)
			}
		})

		player.hooks.onTurnEnd.add(instance, () => {
			const isSleeping = game.state.statusEffects.some(
				(a) =>
					a.targetInstance.instance == row?.hermitCard?.instance && a.statusEffectId == 'sleeping'
			)

			// if sleeping has worn off, discard the bed
			if (!isSleeping) {
				discardCard(game, row?.effectCard || null)
				player.hooks.onTurnEnd.remove(instance)
			}
		})
	}

	override onDetach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onTurnEnd.remove(instance)
		player.hooks.onTurnStart.remove(instance)
		player.hooks.beforeApply.remove(instance)
		player.hooks.afterApply.remove(instance)
	}
}

export default BedEffectCard
