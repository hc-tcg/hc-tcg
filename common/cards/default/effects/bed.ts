import {GameModel} from '../../../models/game-model'
import {discardCard} from '../../../utils/movement'
import {applyStatusEffect, hasStatusEffect} from '../../../utils/board'
import {query, slot} from '../../../filters'
import Card from '../../base/card'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/interfaces'

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
		attachCondition: query.every(attach.attachCondition, slot.activeRow),
	}

	override onAttach(game: GameModel, component: CardComponent) {
		// Give the current row sleeping for 3 turns
		const {player, rowId: row} = pos

		let hermitCard: CardComponent | null = null

		if (row && row.hermitCard) {
			applyStatusEffect(game, 'sleeping', row.hermitCard)
		}

		// Knockback/Tango/Jevin/etc
		player.hooks.onTurnStart.add(component, () => {
			const isSleeping = game.state.statusEffects.some(
				(a) => a.targetInstance.component == row?.hermitCard?.component && a.props.id == 'sleeping'
			)
			if (!isSleeping) {
				discardCard(game, row?.effectCard || null)
				return
			}
		})

		player.hooks.beforeApply.add(component, () => {
			hermitCard = row?.hermitCard || null
		})

		//Ladder
		player.hooks.afterApply.add(component, () => {
			if (hermitCard?.entity != row?.hermitCard?.component && row && row.hermitCard) {
				row.health = row.hermitCard.props.health

				// Add new sleeping statusEffect
				applyStatusEffect(game, 'sleeping', row.hermitCard)
			}
		})

		player.hooks.onTurnEnd.add(component, () => {
			// if sleeping has worn off, discard the bed
			if (!hasStatusEffect(game, component, 'sleeping')) {
				discardCard(game, row?.effectCard || null)
				player.hooks.onTurnEnd.remove(component)
			}
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = pos
		player.hooks.onTurnEnd.remove(component)
		player.hooks.onTurnStart.remove(component)
		player.hooks.beforeApply.remove(component)
		player.hooks.afterApply.remove(component)
	}
}

export default BedEffectCard
