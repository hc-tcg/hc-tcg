import {CardComponent, ObserverComponent, RowComponent, SlotComponent} from '../../../components'
import * as query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import WaterBucket from '../../default/effects/water-bucket'

class SpookyStressRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'spookystress_rare',
		numericId: 238,
		name: 'Spooky Stress',
		shortName: 'S. Stress',
		expansion: 'alter_egos_ii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'rare',
		tokens: 2,
		type: 'terraform',
		health: 260,
		primary: {
			name: 'Meh',
			cost: ['terraform'],
			damage: 50,
			power: null,
		},
		secondary: {
			name: "Wa'a",
			cost: ['terraform', 'terraform', 'any'],
			damage: 90,
			power:
				'If Water Bucket is attached to this Hermit, do 10hp damage to each of your opponent’s AFK Hermits',
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent): void {
		const {player} = component

		observer.subscribe(player.hooks.beforeAttack, (attack) => {
			if (attack.attacker?.entity !== component.entity) return
			if (attack.type !== 'secondary') return

			if (
				!game.components.exists(
					SlotComponent,
					query.slot.active,
					query.slot.has(WaterBucket),
					query.slot.currentPlayer
				)
			) {
				return
			}

			game.components
				.filter(RowComponent, query.not(query.row.active), query.row.opponentPlayer)
				.forEach((row) => {
					attack
						.addNewAttack(
							game.newAttack({
								attacker: component.entity,
								target: row.entity,
								type: 'secondary',
								log: (values) => `, ${values.target} for ${values.damage} damage`,
							})
						)
						.addDamage(component.entity, 10)
				})
		})
	}
}

export default SpookyStressRare
