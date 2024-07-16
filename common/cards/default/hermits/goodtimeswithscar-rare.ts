import {GameModel} from '../../../models/game-model'
import {CardComponent, StatusEffectComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import RevivedByDeathloopStatusEffect from '../../../status-effects/revived-by-deathloop'

class GoodTimesWithScarRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'goodtimeswithscar_rare',
		numericId: 33,
		name: 'Scar',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'builder',
		health: 270,
		primary: {
			name: 'Scarred For Life',
			cost: ['builder'],
			damage: 50,
			power: null,
		},
		secondary: {
			name: 'Deathloop',
			cost: ['builder', 'any'],
			damage: 70,
			power:
				'If this Hermit is knocked out before the start of your next turn, they are revived with 50hp.\nDoes not count as a knockout. This Hermit can only be revived once using this ability.',
		},
		sidebarDescriptions: [
			{
				type: 'glossary',
				name: 'knockout',
			},
		],
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = component

		let reviveReady = false

		player.hooks.onAttack.add(component, (attack) => {
			if (attack.attacker?.entity !== component.entity) return
			// If this component is not blocked from reviving, make possible next turn
			if (!component.hasStatusEffect(RevivedByDeathloopStatusEffect)) {
				reviveReady = true
			}
		})

		// Add before so health can be checked reliably
		opponentPlayer.hooks.afterAttack.addBefore(component, (attack) => {
			if (!reviveReady) return

			reviveReady = false
			const row = attack.target
			if (!row || row.health === null || row.health > 0) return
			const target = row.getHermit()
			if (!target) return

			row.health = 50

			game.components
				.filter(
					StatusEffectComponent,
					(game, effect) =>
						effect.target?.entity === target.entity &&
						effect.statusEffect.props.id === 'revived_by_deathloop'
				)
				.forEach((effect) => effect.remove())

			game.battleLog.addEntry(
				player.id,
				`Using $vDeathloop$, $p${target.props.name}$ revived with $g50hp$`
			)

			game.components
				.new(StatusEffectComponent, RevivedByDeathloopStatusEffect)
				.apply(component.entity)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		// Remove hooks
		player.hooks.onAttack.remove(component)
	}
}

export default GoodTimesWithScarRareHermitCard
