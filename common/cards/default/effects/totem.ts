import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {AttackModel} from '../../../models/attack-model'
import {GameModel} from '../../../models/game-model'
import Card from '../../base/card'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

class Totem extends Card {
	props: Attach = {
		...attach,
		id: 'totem',
		numericId: 101,
		name: 'Totem',
		expansion: 'default',
		rarity: 'ultra_rare',
		tokens: 3,
		description:
			'If the Hermit this card is attached to is knocked out, they are revived with 10hp.\nDoes not count as a knockout. Discard after use.',
		sidebarDescriptions: [
			{
				type: 'glossary',
				name: 'knockout',
			},
		],
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		const reviveHook = (attack: AttackModel) => {
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
		}

		// If we are attacked from any source
		// Add before any other hook so they can know a hermits health reliably
		observer.subscribeBefore(player.hooks.afterDefence, (attack) =>
			reviveHook(attack),
		)

		// Also hook into afterAttack of opponent before other hooks, so that health will always be the same when their hooks are called
		// @TODO this is slightly more hacky than I'd like
		observer.subscribeBefore(opponentPlayer.hooks.afterAttack, (attack) =>
			reviveHook(attack),
		)
	}
}

export default Totem
