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
		numericId: 173,
		name: 'Spooky Stress',
		shortName: 'S. Stress',
		expansion: 'alter_egos_iii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'rare',
		tokens: 1,
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
				'If Water Bucket is attached to this Hermit, do 10hp damage to each of your opponent’s AFK Hermits.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent): void {
		const {player} = component

		observer.subscribe(player.hooks.beforeAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			const waterBucketAttached = game.components.exists(
				SlotComponent,
				query.slot.has(WaterBucket),
				query.slot.active,
				query.slot.currentPlayer
			)

			if (!waterBucketAttached) return

			game.components
				.filter(RowComponent, query.not(query.row.active), query.row.opponentPlayer)
				.forEach((row) => {
					const newAttack = game.newAttack({
						attacker: component.entity,
						target: row.entity,
						type: 'secondary',
						log: (values) => `, ${values.target} for ${values.damage} damage`,
					})
					newAttack.addDamage(component.entity, 10)
					newAttack.shouldIgnoreCards.push(query.card.entity(component.entity))
					attack.addNewAttack(newAttack)
				})
		})
	}
}

export default SpookyStressRare
