import {
	CardComponent,
	ObserverComponent,
	RowComponent,
	SlotComponent,
} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import WaterBucket from '../attach/water-bucket'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const SpookyStressRare: Hermit = {
	...hermit,
	id: 'spookystress_rare',
	numericId: 1245,
	name: 'Spooky Stress',
	shortName: 'S. Stress',
	expansion: 'alter_egos',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'rare',
	tokens: 1,
	type: ['terraform'],
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
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	): void {
		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.ADD_ATTACK,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				const waterBucketAttached = game.components.exists(
					SlotComponent,
					query.slot.has(WaterBucket),
					query.slot.active,
					query.slot.currentPlayer,
				)

				if (!waterBucketAttached) return

				game.components
					.filter(
						RowComponent,
						query.row.opponentPlayer,
						query.not(query.row.active),
						query.row.hasHermit,
					)
					.sort((a, b) => a.index - b.index)
					.forEach((row) => {
						const newAttack = game.newAttack({
							attacker: component.entity,
							target: row.entity,
							type: 'secondary',
							log: (values) => `, ${values.target} for ${values.damage} damage`,
						})
						newAttack.addDamage(component.entity, 10)
						newAttack.shouldIgnoreCards.push(
							query.card.entity(component.entity),
						)
						attack.addNewAttack(newAttack)
					})
			},
		)
	},
}

export default SpookyStressRare
