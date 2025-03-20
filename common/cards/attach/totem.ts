import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {rowRevive} from '../../types/priorities'
import {attach} from '../defaults'
import {Attach} from '../types'

const Totem: Attach = {
	...attach,
	id: 'totem',
	numericId: 101,
	name: 'Totem',
	expansion: 'default',
	rarity: 'ultra_rare',
	tokens: 2,
	description:
		'If the Hermit this card is attached to is knocked out, they are revived with 10hp.\nDoes not count as a knockout. Discard after use.',
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

		// If we are attacked from any source
		observer.subscribeWithPriority(
			game.hooks.rowRevive,
			rowRevive.TOTEM_REVIVE,
			(attack) => {
				if (!attack.isTargeting(component)) return
				let target = attack.target

				if (!target) return

				let targetHermit = target.getHermit()
				if (targetHermit?.isAlive()) return

				target.health = 10

				game.components
					.filter(
						StatusEffectComponent,
						query.effect.targetEntity(targetHermit?.entity),
						query.effect.type('normal', 'damage'),
					)
					.forEach((ail) => {
						ail.remove()
					})

				const revivedHermit = targetHermit?.props.name
				game.battleLog.addEntry(
					player.entity,
					`Using $eTotem$, $p${revivedHermit}$ revived with $g10hp$`,
				)

				// This will remove this hook, so it'll only be called once
				component.discard()
			},
		)
	},
}

export default Totem
