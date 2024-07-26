import {CardComponent, ObserverComponent, RowComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {GameModel} from '../../../models/game-model'
import {executeExtraAttacks} from '../../../utils/attacks'
import * as query from '../../../components/query'
import {RowEntity} from '../../../entities'

class SkizzlemanRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'skizzleman_rare',
		numericId: 172,
		name: 'Skizz',
		expansion: 'season_x',
		background: 'alter_egos',
		rarity: 'rare',
		tokens: 2,
		type: 'builder',
		health: 290,
		primary: {
			name: 'Hupper Cut ',
			cost: ['any'],
			damage: 40,
			power: null,
		},
		secondary: {
			name: 'Gas Light',
			cost: ['builder', 'builder'],
			damage: 70,
			power:
				"At the end of your turn, deal 20hp damage to each of your opponent's AFK hermits that took damage this turn.",
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		let attackedEntities = new Set<RowEntity>()

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.targetEntity) return
			if (
				!game.components.exists(
					RowComponent,
					query.row.entity(attack.targetEntity),
					query.row.opponentPlayer,
					query.not(query.row.active)
				)
			)
				return
			attackedEntities.add(attack.targetEntity)
		})

		observer.subscribe(player.hooks.afterAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			let extraAttacks = [...attackedEntities.values()].map((entity) => {
				console.log(entity)
				let attack = game
					.newAttack({
						attacker: component.entity,
						target: entity,
						type: 'secondary',
						log: (values) => `${values.target} took ${values.damage} damage from $vGas Light$`,
					})
					.addDamage(component.entity, 20)
				attack.shouldIgnoreCards.push(query.card.entity(component.entity))
				return attack
			})

			executeExtraAttacks(game, extraAttacks)
		})

		observer.subscribe(player.hooks.onTurnEnd, () => {
			attackedEntities = new Set()
		})
	}
}

export default SkizzlemanRare
