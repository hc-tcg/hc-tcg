import {GameModel} from '../../../models/game-model'
import {card, query, slot} from '../../../components/query'
import Card from '../../base/card'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'
import {CardComponent, StatusEffectComponent} from '../../../components'
import SleepingStatusEffect from '../../../status-effects/sleeping'
import {ObserverComponent} from '../../../types/hooks'

// @todo Figure out how ladder is supposed to work

class Bed extends Card {
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

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		// Give the current row sleeping for 3 turns
		const {player} = component

		let hermitCard = () => {
			if (!component.slot.inRow()) return
			return game.components.find(
				CardComponent,
				card.rowIs(component.slot.row.entity),
				card.slot(slot.hermitSlot)
			)
		}

		game.components.new(StatusEffectComponent, SleepingStatusEffect).apply(hermitCard()?.entity)

		// Knockback/Tango/Jevin/etc
		observer.subscribe(player.hooks.onTurnStart, () => {
			if (!hermitCard()?.hasStatusEffect(SleepingStatusEffect)) {
				component.discard()
			}
		})

		observer.subscribe(player.hooks.onTurnEnd, () => {
			// if sleeping has worn off, discard the bed
			if (!hermitCard()?.hasStatusEffect(SleepingStatusEffect)) {
				component.discard()
				player.hooks.onTurnEnd.remove(component)
			}
		})
	}
}

export default Bed
