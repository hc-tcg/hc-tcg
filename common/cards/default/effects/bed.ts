import {GameModel} from '../../../models/game-model'
import {discardCard} from '../../../utils/movement'
import {CardPosModel} from '../../../models/card-pos-model'
import {applyStatusEffect} from '../../../utils/board'
import {slot} from '../../../slot'
import Card, {Attachable, attachable} from '../../base/card'

class BedEffectCard extends Card {
	props: Attachable = {
		...attachable,
		id: 'bed',
		numericId: 2,
		expansion: 'default',
		name: 'Bed',
		rarity: 'ultra_rare',
		tokens: 3,
		description:
			'Attach to your active Hermit. This Hermit restores all HP, then sleeps for the rest of this turn, and the following two turns, before waking up. Discard after your Hermit wakes up.',
		attachCondition: slot.every(attachable.attachCondition, slot.activeRow),
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		// Give the current row sleeping for 3 turns
		const {player, row} = pos
		const hermitSlot = this.getInstanceKey(instance, 'hermitSlot')

		if (row && row.hermitCard) {
			applyStatusEffect(game, 'sleeping', row.hermitCard.instance)
		}

		// Knockback/Tango/Jevin/etc
		player.hooks.onTurnStart.add(instance, () => {
			const isSleeping = game.state.statusEffects.some(
				(a) => a.targetInstance == row?.hermitCard?.instance && a.statusEffectId == 'sleeping'
			)
			if (!isSleeping) {
				discardCard(game, row?.effectCard || null)
				return
			}
		})

		player.hooks.beforeApply.add(instance, () => {
			player.custom[hermitSlot] = row?.hermitCard?.instance
		})

		//Ladder
		player.hooks.afterApply.add(instance, () => {
			if (player.custom[hermitSlot] != row?.hermitCard?.instance && row && row.hermitCard) {
				row.health = row.hermitCard.card.props.health

				// Add new sleeping statusEffect
				applyStatusEffect(game, 'sleeping', row.hermitCard.instance)
			}
			delete player.custom[hermitSlot]
		})

		player.hooks.onTurnEnd.add(instance, () => {
			const isSleeping = game.state.statusEffects.some(
				(a) => a.targetInstance == row?.hermitCard?.instance && a.statusEffectId == 'sleeping'
			)

			// if sleeping has worn off, discard the bed
			if (!isSleeping) {
				discardCard(game, row?.effectCard || null)
				player.hooks.onTurnEnd.remove(instance)
			}
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onTurnEnd.remove(instance)
		player.hooks.onTurnStart.remove(instance)
		player.hooks.beforeApply.remove(instance)
		player.hooks.afterApply.remove(instance)
		delete player.custom[this.getInstanceKey(instance, 'hermitSlot')]
	}

	override sidebarDescriptions() {
		return [
			{
				type: 'statusEffect',
				name: 'sleeping',
			},
		]
	}
}

export default BedEffectCard
