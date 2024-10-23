import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import SleepingEffect from '../../status-effects/sleeping'
import {onTurnEnd} from '../../types/priorities'
import {attach} from '../defaults'
import {Attach} from '../types'

const Bed: Attach = {
	...attach,
	id: 'bed',
	numericId: 2,
	expansion: 'default',
	name: 'Bed',
	rarity: 'ultra_rare',
	tokens: 2,
	description:
		'Attach to your active Hermit. This Hermit restores all HP, then sleeps for the rest of this turn, and the following two turns, before waking up. Discard after your Hermit wakes up.',
	sidebarDescriptions: [
		{
			type: 'statusEffect',
			name: 'sleeping',
		},
	],
	attachCondition: query.every(attach.attachCondition, query.slot.active),
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		// Give the current row sleeping for 3 turns
		const {player} = component

		let hermitCard = () => {
			if (!component.slot.inRow()) return
			return game.components.find(
				CardComponent,
				query.card.rowEntity(component.slot.row.entity),
				query.card.slot(query.slot.hermit),
			)
		}

		game.components
			.new(StatusEffectComponent, SleepingEffect, component.entity)
			.apply(hermitCard()?.entity)

		observer.subscribe(player.hooks.onActiveRowChange, () => {
			let hermit = hermitCard()
			if (!hermit) return

			// If the player is moved by knockback or ladder, we want to remove sleep and discard the bed.
			if (
				!hermit.slot.inRow() ||
				hermit.slot.row.entity !== player.activeRowEntity
			) {
				hermit.getStatusEffect(SleepingEffect)?.remove()
				component.discard()
			}
		})

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (!hermitCard()?.getStatusEffect(SleepingEffect)) {
				component.discard()
			}
		})

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.BEFORE_STATUS_EFFECT_TIMEOUT,
			() => {
				// if sleeping has worn off, discard the bed
				if (!hermitCard()?.getStatusEffect(SleepingEffect)) {
					component.discard()
				}
			},
		)
	},
}

export default Bed
