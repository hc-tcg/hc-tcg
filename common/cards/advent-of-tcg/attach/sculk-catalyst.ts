import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import SculkCatalystTriggeredEffect from '../../../status-effects/skulk-catalyst'
import {afterAttack} from '../../../types/priorities'
import {attach} from '../../defaults'
import {Attach} from '../../types'

const SculkCatalyst: Attach = {
	...attach,
	id: 'sculk_catalyst',
	name: 'Sculk Catalyst',
	expansion: 'minecraft',
	numericId: 1400,
	rarity: 'rare',
	tokens: 1,
	description:
		'When a Hermit other than the Hermit this card is attached to is knocked out, heal this Hermit 50hp.',
	sidebarDescriptions: [
		{
			type: 'glossary',
			name: 'knockout',
		},
	],
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(attack) => {
				if (!component.slot.inRow() || !component.slot.row.health) return
				if (attack.target?.health) return

				const targetHermit = attack.target?.getHermit()

				if (!targetHermit?.isHermit()) return
				if (
					game.components.find(
						StatusEffectComponent,
						query.effect.is(SculkCatalystTriggeredEffect),
						query.effect.targetIsCardAnd(
							query.card.rowEntity(attack.targetEntity),
						),
						(_game, effect) => effect.creatorEntity === component.entity,
					)
				)
					return
				component.slot.row.heal(50)
				const healedHermit = component.slot.row.getHermit()
				game.battleLog.addEntry(
					player.entity,
					`$p${healedHermit?.props.name} (${
						component.slot.row.index + 1
					})$ was healed $g50hp$ by $p${component.props.name}$`,
				)
				game.components
					.new(
						StatusEffectComponent,
						SculkCatalystTriggeredEffect,
						component.entity,
					)
					.apply(targetHermit.entity)
			},
		)
	},
}

export default SculkCatalyst
