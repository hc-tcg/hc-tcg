import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {AttackModel} from '../../../models/attack-model'
import {GameModel} from '../../../models/game-model'
import {afterAttack} from '../../../types/priorities'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

const Totem: Attach = {
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
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

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
		game.components
			.filter(PlayerComponent)
			.forEach((player) =>
				observer.subscribeWith(
					player.hooks.afterAttack,
					afterAttack.TOTEM_REVIVE,
					(attack) => reviveHook(attack),
				),
			)
	},
}

export default Totem
